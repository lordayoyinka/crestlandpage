// api/configfile.js
//
// Vercel serverless function equivalent of netlify/functions/configfile.js.
// Vercel auto-detects any file under /api at the repo root and deploys it
// as a serverless function reachable at /api/configfile — no Next.js needed.
//
// Set these same values in the Vercel project's Environment Variables
// (Project Settings -> Environment Variables). Use the exact values from
// your Firebase project: Project settings -> General -> Your apps -> SDK setup.
// If they're already set on Netlify, you can copy them straight across.

module.exports = (req, res) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
    appId: process.env.FIREBASE_APPID,
    measurementId: process.env.FIREBASE_MEASUREMENTID,
  };

  res.status(200).json({ firebaseConfig });
};
