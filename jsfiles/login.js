// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { sign } from "jsonwebtoken";




// Replace 'your-firebase-config' with your actual Firebase config
const firebaseConfig = {
  // Your Firebase configuration

  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID,
  measurementId: process.env.FIREBASE_MEASUREMENTID,


};

// Initialize Firebase

// Initialize Firebase Admin SDK

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const db = getFirestore(firebase);

const handleSubmit = async (event) => {
  event.preventDefault();

  const email = document.getElementById("email-address").value;
  const password = document.getElementById("password").value;
  const year = document.getElementById("year").value;
  const term = document.getElementById("term").value;

  const hashedPassword = {
    emailgotten: email,
    passwordgotten: password,
    yeargotten: year,
    termgotten: term,
  };




  const secretKey = 'kmymymymymymmymmymmy28838838838';

  const token = sign(hashedPassword, secretKey, { expiresIn: '1h' });



  // Use Firebase authentication methods
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Handle successful login
      console.log("User logged in:", userCredential.user);
      const user = userCredential.user;

      const redirect = async () => {
        const studentDocRef = doc(db, year, term, "students", user.uid);
        const studentDocSnapshot = await getDoc(studentDocRef);

        const teacherDocRef = doc(db, "Teachers", user.uid);
        const teacherDocDocSnapshot = await getDoc(teacherDocRef);

        const adminDocRef = doc(db, "admin", user.uid);
        const adminDocSnapshot = await getDoc(adminDocRef);


        if (user) {
          if (studentDocSnapshot.exists()) {
            // The user's UID exists in the students collection, proceed to redirect
            console.log("student redirected in successfully", user.uid);
            window.location.href = `http://localhost:3000/SignIn?token=${encodeURIComponent(token)}`;
          } else if (teacherDocDocSnapshot.exists()) {
            console.log("teacher redirected in successfully", user.uid);
            window.location.href = `redirect-url?auth=${auth}&usertoken=${user.accessToken}&yeargotten=${year}&termgotten=${term}`;
          } else if (adminDocSnapshot.exists()) {
            console.log("admin redirected in successfully", user.uid);
            window.location.href = `redirect-url?auth=${auth}&usertoken=${user.accessToken}&yeargotten=${year}&termgotten=${term}`;
          } else {
            // The user's UID doesn't exist in the students collection, sign-out and display an error
            signOut();
            console.error("User not found in the students collection.");
            // You can display an error message to the user or handle it as needed
          }
        }

        // Redirect the user to a new page (replace 'redirect-url' with the actual URL)
      };

      // Function to sign the user out
      function signOut() {
        firebase
          .auth()
          .signOut()
          .then(() => {
            console.log("User signed out");
          })
          .catch((error) => {
            console.error("Sign out error:", error.message);
          });
      }

      redirect();
    })
    .catch((error) => {
      // Handle login errors
      console.error("Login error:", error.message);
      // You can display an error message to the user if needed
    });
};


// Hashing function on the client side using SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Add your Firebase authentication logic here
// For example, you can use the following to listen for form submission
document.getElementById("signin").addEventListener("submit", handleSubmit);
