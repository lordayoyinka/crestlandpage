// api/submit-application.js
//
// Receives the admission form fields + base64-encoded documents from
// apply.js, commits the documents to a PRIVATE GitHub repo (kept
// separate from the public crestlandpage repo since these are personal
// student documents), generates a PDF replica of the paper form, and
// commits that PDF too. Returns the repo paths so the client can save
// them on the Firestore application doc.
//
// Required environment variables (Vercel project settings):
//   GITHUB_TOKEN     - fine-grained PAT with Contents: Read & Write on
//                       BOTH crestlandpage and the docs repo
//   GITHUB_OWNER      - "lordayoyinka"
//   GITHUB_DOCS_REPO  - name of the new PRIVATE repo, e.g. "cresthive-admission-docs"
//   GITHUB_BRANCH     - "main"

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// Commits multiple files to GitHub in a SINGLE atomic commit, using the
// low-level Git Data API instead of the Contents API. This matters because
// the Contents API (one PUT per file) requires each request to know the
// current branch position — running several of those in parallel causes a
// race ("Reference already exists" / 409), since they all read the same
// starting point and then fight over updating the branch ref. Blob creation
// below is safe to parallelize (it doesn't touch the branch); only the
// final tree -> commit -> ref update happens once, in sequence.
async function commitFilesToGitHub({ owner, repo, branch, token, files, message }) {
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const refRes = await fetch(`${base}/git/refs/heads/${branch}`, { headers });
  if (!refRes.ok) throw new Error(`Could not read branch ref: ${await refRes.text()}`);
  const latestCommitSha = (await refRes.json()).object.sha;

  const commitRes = await fetch(`${base}/git/commits/${latestCommitSha}`, { headers });
  if (!commitRes.ok) throw new Error(`Could not read base commit: ${await commitRes.text()}`);
  const baseTreeSha = (await commitRes.json()).tree.sha;

  // Create a blob for each file in parallel — this is the part that
  // actually uploads the (base64) content, and is safe to run concurrently.
  const blobs = await Promise.all(
    files.map(async (f) => {
      const blobRes = await fetch(`${base}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: f.contentBase64, encoding: 'base64' }),
      });
      if (!blobRes.ok) throw new Error(`Blob creation failed for ${f.path}: ${await blobRes.text()}`);
      const { sha } = await blobRes.json();
      return { path: f.path, mode: '100644', type: 'blob', sha };
    })
  );

  const treeRes = await fetch(`${base}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }),
  });
  if (!treeRes.ok) throw new Error(`Tree creation failed: ${await treeRes.text()}`);
  const newTreeSha = (await treeRes.json()).sha;

  const newCommitRes = await fetch(`${base}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, tree: newTreeSha, parents: [latestCommitSha] }),
  });
  if (!newCommitRes.ok) throw new Error(`Commit creation failed: ${await newCommitRes.text()}`);
  const newCommitSha = (await newCommitRes.json()).sha;

  const updateRefRes = await fetch(`${base}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ sha: newCommitSha }),
  });
  if (!updateRefRes.ok) throw new Error(`Ref update failed: ${await updateRefRes.text()}`);

  return files.map((f) => f.path);
}

function wrapText(text, maxChars) {
  if (!text) return ['-'];
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars) {
      lines.push(line.trim());
      line = word;
    } else {
      line += ' ' + word;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.length ? lines : ['-'];
}

// Mirrors apply.js's row2(): two label/value pairs side by side, matching
// the two-column layout of both the original paper form and the on-screen
// printable confirmation. Row height auto-grows to fit whichever cell
// wraps to the most lines (e.g. a long Residential Address).
async function buildAdmissionPdf(applicationRef, fields, passportPhoto) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]); // A4
  const margin = 40;
  const contentWidth = 595 - margin * 2; // 515
  const labelW = 85;
  const valueW = contentWidth / 2 - labelW; // 172.5
  const col2X = margin + labelW + valueW; // start of second label/value pair
  const green = rgb(0, 0.41, 0.24);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightBg = rgb(0.97, 0.97, 0.97);

  let y = 800;

  // --- Header: title/subtitle on the left, passport photo top-right ---
  page.drawText('CrestHive International School', { x: margin, y, size: 17, font: bold, color: green });
  y -= 16;
  page.drawText('Application for Admission - 2026/2027 Session', { x: margin, y, size: 10.5, font, color: gray });

  const photoW = 75;
  const photoH = 95;
  const photoX = margin + contentWidth - photoW;
  const photoY = 800 - photoH + 12;
  if (passportPhoto) {
    try {
      const bytes = Buffer.from(passportPhoto.contentBase64, 'base64');
      const image = passportPhoto.mimeType === 'image/png'
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);
      page.drawImage(image, { x: photoX, y: photoY, width: photoW, height: photoH });
      page.drawRectangle({ x: photoX, y: photoY, width: photoW, height: photoH, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 1 });
    } catch (e) {
      console.error('Could not embed passport photo in PDF:', e);
    }
  }

  y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 1.5, color: green });
  y -= 18;

  page.drawText(`Application Reference Number: ${applicationRef}`, { x: margin, y, size: 11, font: bold, color: rgb(0, 0, 0) });
  y -= 22;

  const drawSectionHeader = (text) => {
    page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 18, color: green });
    page.drawText(text, { x: margin + 8, y: y, size: 10.5, font: bold, color: rgb(1, 1, 1) });
    y -= 24;
  };

  // Draws one row with two label/value pairs, growing height to fit wraps.
  const drawRow2 = (label1, value1, label2, value2) => {
    const lines1 = wrapText(value1, 26);
    const lines2 = label2 ? wrapText(value2, 26) : [''];
    const maxLines = Math.max(lines1.length, lines2.length, 1);
    const rowH = 11 * maxLines + 6;

    page.drawRectangle({ x: margin, y: y - rowH, width: labelW, height: rowH, color: lightBg });
    page.drawRectangle({ x: col2X, y: y - rowH, width: labelW, height: rowH, color: lightBg });
    page.drawRectangle({ x: margin, y: y - rowH, width: contentWidth, height: rowH, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
    page.drawLine({ start: { x: margin + labelW, y }, end: { x: margin + labelW, y: y - rowH }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
    page.drawLine({ start: { x: col2X, y }, end: { x: col2X, y: y - rowH }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
    page.drawLine({ start: { x: col2X + labelW, y }, end: { x: col2X + labelW, y: y - rowH }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });

    page.drawText(label1, { x: margin + 4, y: y - 10, size: 8, font: bold, color: rgb(0.2, 0.2, 0.2) });
    lines1.forEach((line, i) => {
      page.drawText(line, { x: margin + labelW + 4, y: y - 10 - i * 11, size: 8, font, color: rgb(0, 0, 0) });
    });

    if (label2) {
      page.drawText(label2, { x: col2X + 4, y: y - 10, size: 8, font: bold, color: rgb(0.2, 0.2, 0.2) });
      lines2.forEach((line, i) => {
        page.drawText(line, { x: col2X + labelW + 4, y: y - 10 - i * 11, size: 8, font, color: rgb(0, 0, 0) });
      });
    }

    y -= rowH;
  };

  drawSectionHeader('PERSONAL INFORMATION (STUDENT)');
  drawRow2('Student Full Name', fields.studentFullName, 'Sex', fields.sex);
  drawRow2('Date of Birth', fields.dob, 'Nationality', fields.nationality);
  drawRow2('State of Origin', fields.stateOfOrigin, 'Local Govt. Area', fields.lga);
  drawRow2('Religion', fields.religion, 'Class Applying For', fields.classApplyingFor);
  drawRow2('Residential Address', fields.address, 'Name of Last School Attended', fields.lastSchool);
  drawRow2('Last Class Attended', fields.lastClass, 'Medical Issues/Challenges', fields.medicalIssues);
  y -= 8;

  drawSectionHeader('PARENT/GUARDIAN INFORMATION');
  drawRow2("Father's Full Name", fields.fatherFullName, "Mother's Full Name", fields.motherFullName);
  drawRow2('Occupation', fields.fatherOccupation, 'Occupation', fields.motherOccupation);
  drawRow2('Telephone', fields.fatherPhone, 'Telephone', fields.motherPhone);
  drawRow2('Parent/Guardian E-mail', fields.guardianEmail, '', '');
  y -= 8;

  drawSectionHeader('AFFIRMATION');
  const affLines = wrapText(`I, ${fields.affirmationName}, hereby affirm that information provided here is accurate and can be relied upon.`, 95);
  affLines.forEach((line) => {
    page.drawText(line, { x: margin, y, size: 9.5, font, color: rgb(0, 0, 0) });
    y -= 13;
  });

  y -= 24;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + 210, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
  page.drawLine({ start: { x: margin + 305, y }, end: { x: margin + contentWidth, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
  y -= 11;
  page.drawText('Parent/Guardian (Signature & Date)', { x: margin, y, size: 8, font, color: gray });
  page.drawText('Head of School (Signature & Date)', { x: margin + 305, y, size: 8, font, color: gray });

  y -= 20;
  page.drawText('Note: birth certificate and last school result were uploaded as part of this application.', { x: margin, y, size: 7, font, color: gray });

  return pdfDoc.save();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { applicationRef, fields, files } = req.body || {};
  if (!applicationRef || !fields || !files) {
    return res.status(400).json({ error: 'applicationRef, fields and files are required' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_DOCS_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return res.status(500).json({ error: 'Document storage is not configured (missing env vars)' });
  }

  try {
    const safeRef = String(applicationRef).replace(/[^a-zA-Z0-9_-]/g, '-');

    // Build the PDF first (pure CPU work, no network), then commit
    // everything — the 3 uploaded documents plus the PDF — in one
    // single atomic Git commit. This avoids the branch-ref race that
    // happens when multiple separate commits are pushed concurrently.
    const pdfBytes = await buildAdmissionPdf(applicationRef, fields, files.passportPhoto);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    const fileList = Object.entries(files).map(([fieldName, file]) => {
      const ext = (file.filename || '').split('.').pop() || 'bin';
      return {
        fieldName,
        path: `applications/${safeRef}/${fieldName}.${ext}`,
        contentBase64: file.contentBase64,
      };
    });
    fileList.push({
      fieldName: 'formPdf',
      path: `applications/${safeRef}/admission-form.pdf`,
      contentBase64: pdfBase64,
    });

    await commitFilesToGitHub({
      owner, repo, branch, token,
      files: fileList,
      message: `Admission docs: add application ${safeRef}`,
    });

    const documents = Object.fromEntries(fileList.map((f) => [f.fieldName, f.path]));

    return res.status(200).json({ documents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error', details: String(err) });
  }
};
