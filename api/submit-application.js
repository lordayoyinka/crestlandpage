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

async function commitFileToGitHub({ owner, repo, branch, token, path, contentBase64, message }) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  let sha;
  const existing = await fetch(`${apiUrl}?ref=${branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (existing.status === 200) {
    sha = (await existing.json()).sha;
  }

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, content: contentBase64, branch, ...(sha ? { sha } : {}) }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GitHub commit failed for ${path}: ${errBody}`);
  }
  return path;
}

function wrapText(text, maxChars) {
  if (!text) return [''];
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
  return lines;
}

async function buildAdmissionPdf(applicationRef, fields) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]); // A4
  const margin = 50;
  let y = 800;
  const green = rgb(0, 0.41, 0.24);

  const newPageIfNeeded = (spaceNeeded = 20) => {
    if (y < margin + spaceNeeded) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
  };

  const drawTitle = (text, size = 18) => {
    page.drawText(text, { x: margin, y, size, font: bold, color: green });
    y -= size + 10;
  };

  const drawSectionHeader = (text) => {
    newPageIfNeeded(40);
    y -= 6;
    page.drawRectangle({ x: margin, y: y - 4, width: 495, height: 22, color: green });
    page.drawText(text, { x: margin + 8, y: y + 2, size: 12, font: bold, color: rgb(1, 1, 1) });
    y -= 30;
  };

  const drawField = (label, value) => {
    const lines = wrapText(value || '-', 70);
    newPageIfNeeded(16 * lines.length + 6);
    page.drawText(`${label}:`, { x: margin, y, size: 10, font: bold, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
    lines.forEach((line) => {
      page.drawText(line, { x: margin + 10, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 15;
    });
    y -= 4;
  };

  drawTitle('CrestHive International School');
  page.drawText('Application for Admission - 2026/2027 Session', { x: margin, y, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 22;
  page.drawText(`Application Reference Number: ${applicationRef}`, { x: margin, y, size: 11, font: bold, color: rgb(0, 0, 0) });
  y -= 26;

  drawSectionHeader('PERSONAL INFORMATION (STUDENT)');
  drawField('Student Full Name', fields.studentFullName);
  drawField('Date of Birth', fields.dob);
  drawField('Sex', fields.sex);
  drawField('Nationality', fields.nationality);
  drawField('State of Origin', fields.stateOfOrigin);
  drawField('Local Govt. Area', fields.lga);
  drawField('Religion', fields.religion);
  drawField('Residential Address', fields.address);
  drawField('Name of Last School Attended', fields.lastSchool);
  drawField('Last Class Attended', fields.lastClass);
  drawField('Class Applying For', fields.classApplyingFor);
  drawField('Any Medical Issues/Challenges', fields.medicalIssues);

  drawSectionHeader('PARENT/GUARDIAN INFORMATION');
  drawField("Father's Full Name", fields.fatherFullName);
  drawField('Occupation', fields.fatherOccupation);
  drawField('Telephone', fields.fatherPhone);
  drawField('E-mail', fields.fatherEmail);
  drawField("Mother's Full Name", fields.motherFullName);
  drawField('Occupation', fields.motherOccupation);
  drawField('Telephone', fields.motherPhone);
  drawField('E-mail', fields.motherEmail);

  drawSectionHeader('AFFIRMATION');
  drawField('', `I, ${fields.affirmationName}, hereby affirm that information provided here is accurate and can be relied upon.`);

  newPageIfNeeded(60);
  y -= 20;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + 200, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
  page.drawLine({ start: { x: margin + 295, y }, end: { x: margin + 495, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
  y -= 12;
  page.drawText('Parent/Guardian (Signature & Date)', { x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('Head of School (Signature & Date)', { x: margin + 295, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

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

    // Run all document commits AND the PDF build/commit in parallel instead
    // of one-at-a-time — this was previously up to 10 sequential GitHub API
    // round-trips, which risked exceeding Vercel's function timeout.
    const documentUploadPromises = Object.entries(files).map(async ([fieldName, file]) => {
      const ext = (file.filename || '').split('.').pop() || 'bin';
      const path = `applications/${safeRef}/${fieldName}.${ext}`;
      await commitFileToGitHub({
        owner, repo, branch, token, path,
        contentBase64: file.contentBase64,
        message: `Admission docs: add ${fieldName} for ${safeRef}`,
      });
      return [fieldName, path];
    });

    const pdfUploadPromise = (async () => {
      const pdfBytes = await buildAdmissionPdf(applicationRef, fields);
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
      const pdfPath = `applications/${safeRef}/admission-form.pdf`;
      await commitFileToGitHub({
        owner, repo, branch, token, path: pdfPath,
        contentBase64: pdfBase64,
        message: `Admission docs: add form PDF for ${safeRef}`,
      });
      return ['formPdf', pdfPath];
    })();

    const results = await Promise.all([...documentUploadPromises, pdfUploadPromise]);
    const documents = Object.fromEntries(results);

    return res.status(200).json({ documents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error', details: String(err) });
  }
};
