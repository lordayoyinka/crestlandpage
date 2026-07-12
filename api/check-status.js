// api/check-status.js
//
// Public status lookup for applicants. Runs server-side (not a direct
// client-side Firestore read) so we can require a surname match before
// revealing anything, and so exam credentials are never exposed to
// someone who only guesses an Application Reference Number.
//
// Required environment variables (Vercel project settings for crestlandpage):
//   FIREBASE_SERVICE_ACCOUNT_KEY - the full JSON key from
//     Firebase Console -> Project Settings -> Service Accounts ->
//     Generate new private key, saved as a single-line JSON string.
//
// This uses firebase-admin, which has full read access — that's exactly
// why this must run server-side with a secret key, never in the browser.

const admin = require('firebase-admin');

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { applicationRef, surname } = req.body || {};
  if (!applicationRef || !surname) {
    return res.status(400).json({ error: 'applicationRef and surname are required' });
  }

  // Basic format guard — cuts down on wasted lookups / naive scraping.
  if (!/^CH-\d{4}-[A-Z0-9]{4,8}$/i.test(applicationRef.trim())) {
    return res.status(200).json({ found: false });
  }

  try {
    const app = getAdminApp();
    const db = admin.firestore(app);
    const snap = await db.collection('applications').doc(applicationRef.trim().toUpperCase()).get();

    if (!snap.exists) {
      return res.status(200).json({ found: false });
    }

    const data = snap.data();
    const surnameInput = surname.trim().toLowerCase();
    const namesToCheck = [
      data.student?.fullName,
      data.father?.fullName,
      data.mother?.fullName,
      data.affirmation?.name,
    ]
      .filter(Boolean)
      .map((n) => n.toLowerCase());

    const matches = namesToCheck.some((n) => n.includes(surnameInput));
    if (!matches) {
      return res.status(200).json({ found: false });
    }

    const response = {
      found: true,
      status: data.status,
      studentName: data.student?.fullName,
    };

    if (data.status === 'confirmed') {
      response.examNumber = data.examNumber;
      response.passkey = data.passkey;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
};
