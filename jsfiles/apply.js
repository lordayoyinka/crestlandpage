// jsfiles/apply.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

// Same fallback pattern used on the homepage: works on Vercel (/api/configfile)
// or Netlify (.netlify/functions/configfile) without code changes.
async function fetchFirebaseConfigJson() {
  const endpoints = ['/api/configfile', './../.netlify/functions/configfile'];
  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (e) { /* try next */ }
  }
  throw new Error('Could not load Firebase config.');
}

let db;
fetchFirebaseConfigJson()
  .then((r) => r.json())
  .then(({ firebaseConfig }) => {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  })
  .catch((err) => {
    console.error(err);
    showError('Could not connect to the server. Please refresh and try again.');
  });

const form = document.getElementById('admissionForm');
const submitBtn = document.getElementById('submitBtn');
const formView = document.getElementById('formView');
const confirmView = document.getElementById('confirmView');
const errorBox = document.getElementById('formError');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Phone photos are often 3-8MB, and Vercel serverless functions hard-cap
// request bodies at 4.5MB. Compressing images client-side before they're
// base64-encoded and sent keeps submissions well under that limit.
function compressImageFile(file, maxDimension = 1400, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file); // leave non-images (e.g. PDFs) untouched
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            resolve(file); // fall back to original if compression fails
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fall back to original if it can't be loaded as an image
    };

    img.src = objectUrl;
  });
}

// Rough safety net: base64 adds ~33% overhead, and Vercel's serverless
// function request-body limit is 4.5MB. Stay comfortably under that.
const MAX_TOTAL_PAYLOAD_BYTES = 4 * 1024 * 1024;

// A non-sequential, hard-to-guess reference number. Doubles as the
// public lookup key for the "Check Application Status" page, so it
// must not be predictable.
function generateApplicationRef() {
  const year = new Date().getFullYear();
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (b) => b.toString(36)).join('').toUpperCase().slice(0, 6);
  return `CH-${year}-${code}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.style.display = 'none';

  if (!db) {
    showError('Still connecting to the server — please wait a moment and try again.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const formData = new FormData(form);
    const fields = {};
    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) fields[key] = value;
    }

    const fileFields = ['birthCertificate', 'lastSchoolResult', 'passportPhoto'];
    const files = {};
    let totalBytes = 0;

    for (const fieldName of fileFields) {
      const rawFile = form.querySelector(`[name="${fieldName}"]`).files[0];
      if (!rawFile) throw new Error(`Missing required file: ${fieldName}`);

      const processedFile = await compressImageFile(rawFile);
      const contentBase64 = await fileToBase64(processedFile);
      totalBytes += contentBase64.length;

      files[fieldName] = {
        filename: processedFile.name,
        mimeType: processedFile.type,
        contentBase64,
      };
    }

    if (totalBytes > MAX_TOTAL_PAYLOAD_BYTES) {
      throw new Error(
        'Your uploaded files are too large even after compression (this usually happens with a large PDF). ' +
        'Please use a smaller/scanned version of the birth certificate or school result and try again.'
      );
    }

    const applicationRef = generateApplicationRef();

    // Server-side step: commits the documents to the private docs repo
    // and generates a PDF replica of the form. Needs the GitHub token,
    // so it can't run in the browser.
    const uploadRes = await fetch('/api/submit-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationRef, fields, files }),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload failed: ${errText}`);
    }

    const { documents } = await uploadRes.json();

    await setDoc(doc(db, 'applications', applicationRef), {
      applicationRef,
      createdAt: serverTimestamp(),
      status: 'pending_payment',
      student: {
        fullName: fields.studentFullName,
        dob: fields.dob,
        sex: fields.sex,
        nationality: fields.nationality,
        stateOfOrigin: fields.stateOfOrigin || '',
        lga: fields.lga || '',
        religion: fields.religion || '',
        address: fields.address,
        lastSchool: fields.lastSchool || '',
        lastClass: fields.lastClass || '',
        classApplyingFor: fields.classApplyingFor,
        medicalIssues: fields.medicalIssues || '',
      },
      father: {
        fullName: fields.fatherFullName,
        occupation: fields.fatherOccupation || '',
        phone: fields.fatherPhone,
      },
      mother: {
        fullName: fields.motherFullName || '',
        occupation: fields.motherOccupation || '',
        phone: fields.motherPhone || '',
      },
      contactEmail: fields.guardianEmail,
      affirmation: {
        name: fields.affirmationName,
        date: new Date().toISOString().slice(0, 10),
      },
      documents,
      examNumber: null,
      passkey: null,
    });

    renderConfirmation(fields, applicationRef);
  } catch (err) {
    console.error(err);
    showError(err.message || 'Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';
  }
});

// Builds one table row containing two label/value pairs side by side
// (matching the original paper form's two-column layout), instead of
// one field per row — this roughly halves the printed table height.
function row2(table, label1, value1, label2, value2) {
  const tr = document.createElement('tr');
  const cells = [
    ['label', label1], ['value', value1 || '-'],
    ['label', label2 ?? ''], ['value', label2 ? (value2 || '-') : ''],
  ];
  cells.forEach(([cls, text]) => {
    const td = document.createElement('td');
    td.className = cls;
    td.textContent = text;
    tr.appendChild(td);
  });
  table.appendChild(tr);
}

function renderConfirmation(fields, applicationRef) {
  document.getElementById('printRef').textContent = applicationRef;

  const studentTable = document.getElementById('printStudentTable');
  row2(studentTable, 'Student Full Name', fields.studentFullName, 'Sex', fields.sex);
  row2(studentTable, 'Date of Birth', fields.dob, 'Nationality', fields.nationality);
  row2(studentTable, 'State of Origin', fields.stateOfOrigin, 'Local Govt. Area', fields.lga);
  row2(studentTable, 'Religion', fields.religion, 'Class Applying For', fields.classApplyingFor);
  row2(studentTable, 'Residential Address', fields.address, 'Name of Last School Attended', fields.lastSchool);
  row2(studentTable, 'Last Class Attended', fields.lastClass, 'Medical Issues/Challenges', fields.medicalIssues);

  const parentTable = document.getElementById('printParentTable');
  row2(parentTable, "Father's Full Name", fields.fatherFullName, "Mother's Full Name", fields.motherFullName);
  row2(parentTable, 'Occupation', fields.fatherOccupation, 'Occupation', fields.motherOccupation);
  row2(parentTable, 'Telephone', fields.fatherPhone, 'Telephone', fields.motherPhone);
  row2(parentTable, 'Parent/Guardian E-mail', fields.guardianEmail, '', '');

  document.getElementById('printAffirmation').textContent =
    `I, ${fields.affirmationName}, hereby affirm that information provided here is accurate and can be relied upon.`;

  formView.style.display = 'none';
  confirmView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
