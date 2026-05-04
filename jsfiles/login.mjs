// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";


import { SignJWT } from 'https://cdn.jsdelivr.net/npm/jose@3.12.3/dist/browser/jwt/sign.js';


// Generate a Jose token with a secret key
const generateJoseToken = async (payload, secretKey) => {
  // Build a JWT with specified claims (iat, exp, sub)
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // Specify the algorithm (HS256 in this case)
    .setIssuedAt() // Automatically set the Issued At claim
    .setExpirationTime('15m') // Set the expiration time
    .sign(secretKey);

  console.log("tk", token)


  return token;
};






// Replace 'your-firebase-config' with your actual Firebase config

fetch('./../.netlify/functions/configfile')
  .then(response => response.json())
  .then(async data => {
    const firebaseConfig = data.firebaseConfig;
    // Now you can use firebaseConfig in your Firebase initialization

    // Initialize Firebase

    // Initialize Firebase Admin SDK

    const firebase = initializeApp(firebaseConfig);
    const auth = getAuth(firebase);
    const db = getFirestore(firebase);

    const handleSubmit = async (event) => {
      event.preventDefault();

      // Show loading overlay
      showLoadingOverlay();

      const email = document.getElementById("email-address").value;
      const password = document.getElementById("password").value;
      const year = document.getElementById("year").value;
      const term = document.getElementById("term").value;

      const payload = {
        emailgotten: email,
        passwordgotten: password,
        yeargotten: year,
        termgotten: term,
      };



      const secretKey = new TextEncoder().encode('b5682868ab17c3780ac25d1213479dffae913e2e9a7ea77d131010aee7fd4e3a');




      const accessToken = await generateJoseToken(payload, secretKey);



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

            const adminDocRef = doc(db, "Admins", user.uid);
            const adminDocSnapshot = await getDoc(adminDocRef);


            if (user) {
              if (studentDocSnapshot.exists()) {
                // The user's UID exists in the students collection, proceed to redirect
                console.log("student redirected in successfully", accessToken);
                window.location.href = `https://student.crestscholars.com/SignIn?token=${encodeURIComponent(accessToken)}`;
              } else if (teacherDocDocSnapshot.exists()) {
                console.log("teacher redirected in successfully", user.uid);
                window.location.href = `https://teacher.crestscholars.com/SignIn?token=${encodeURIComponent(accessToken)}`;
              } else if (adminDocSnapshot.exists()) {
                console.log("admin redirected in successfully", user.uid);
                window.location.href = `https://admin.crestscholars.com/SignIn?token=${encodeURIComponent(accessToken)}`;
              } else {
                // The user's UID doesn't exist in the students collection, sign-out and display an error
                signOutf();
                console.error("User not found in the any collection.");
                // You can display an error message to the user or handle it as needed
              }
            }

            // Redirect the user to a new page (replace 'redirect-url' with the actual URL)
          };

          // Function to sign the user out
          function signOutf() {
            signOut(auth)
              .then(() => {
                hideLoadingOverlay();

                alert("Details error, Please try again!")

                console.log("User signed out");
              })
              .catch((error) => {
                hideLoadingOverlay();

                console.error("Sign out error:", error.message);
              });
          }

          redirect();
        })

        .catch((error) => {


          // Hide loading overlay
          hideLoadingOverlay();

          // Handle login errors
          console.error("Login error:", error.message);
          alert("Something went wrong, pease try again with correct details and stable network")
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


  })
  .catch(error => console.error('Error fetching Firebase config:', error));


  
function showLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

