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

    const fileFields = ['birthCertificate', 'lastSchoolResult', 'passportPhoto1', 'passportPhoto2'];
    const files = {};
    for (const fieldName of fileFields) {
      const file = form.querySelector(`[name="${fieldName}"]`).files[0];
      if (!file) throw new Error(`Missing required file: ${fieldName}`);
      files[fieldName] = {
        filename: file.name,
        mimeType: file.type,
        contentBase64: await fileToBase64(file),
      };
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
        email: fields.fatherEmail || '',
      },
      mother: {
        fullName: fields.motherFullName || '',
        occupation: fields.motherOccupation || '',
        phone: fields.motherPhone || '',
        email: fields.motherEmail,
      },
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

function row(table, label, value) {
  const tr = document.createElement('tr');
  const tdLabel = document.createElement('td');
  tdLabel.className = 'label';
  tdLabel.textContent = label;
  const tdValue = document.createElement('td');
  tdValue.textContent = value || '-';
  tr.appendChild(tdLabel);
  tr.appendChild(tdValue);
  table.appendChild(tr);
}

function renderConfirmation(fields, applicationRef) {
  document.getElementById('printRef').textContent = applicationRef;

  const studentTable = document.getElementById('printStudentTable');
  row(studentTable, 'Student Full Name', fields.studentFullName);
  row(studentTable, 'Date of Birth', fields.dob);
  row(studentTable, 'Sex', fields.sex);
  row(studentTable, 'Nationality', fields.nationality);
  row(studentTable, 'State of Origin', fields.stateOfOrigin);
  row(studentTable, 'Local Govt. Area', fields.lga);
  row(studentTable, 'Religion', fields.religion);
  row(studentTable, 'Residential Address', fields.address);
  row(studentTable, 'Name of Last School Attended', fields.lastSchool);
  row(studentTable, 'Last Class Attended', fields.lastClass);
  row(studentTable, 'Class Applying For', fields.classApplyingFor);
  row(studentTable, 'Medical Issues/Challenges', fields.medicalIssues);

  const parentTable = document.getElementById('printParentTable');
  row(parentTable, "Father's Full Name", fields.fatherFullName);
  row(parentTable, 'Occupation', fields.fatherOccupation);
  row(parentTable, 'Telephone', fields.fatherPhone);
  row(parentTable, 'E-mail', fields.fatherEmail);
  row(parentTable, "Mother's Full Name", fields.motherFullName);
  row(parentTable, 'Occupation', fields.motherOccupation);
  row(parentTable, 'Telephone', fields.motherPhone);
  row(parentTable, 'E-mail', fields.motherEmail);

  document.getElementById('printAffirmation').textContent =
    `I, ${fields.affirmationName}, hereby affirm that information provided here is accurate and can be relied upon.`;

  formView.style.display = 'none';
  confirmView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
