
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

  
      
document.getElementById('nav-toggle').addEventListener('click', function() {
  var navMenu = document.querySelector('.nav-menu');
  var navToggle = document.querySelector('.nav-toggle');

  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

fetch('./../.netlify/functions/configfile')
.then(response => response.json())
.then (async data => {
  const firebaseConfig = data.firebaseConfig;
  // Now you can use firebaseConfig in your Firebase initialization

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        console.log(db, "db")
// Use Firestore functionality
const fetchData = async () => {
try {
  const dataRef = doc(db, 'cms', "admissionsPage");
  const querySnapshot = await getDoc(dataRef);
  console.log(querySnapshot, "qs")

  const data = querySnapshot.data();

  const pagedata = data;
  console.log("page data is now", pagedata);

  return data;




  
} catch (error) {
  console.error('Error fetching data:', error);
  return null;
}
};

// Call the function to fetch data


  const fetch = await fetchData();




// Example: Retrieve data from Firestore


console.log("fetch",  fetch)




const admission = fetch.admission;


const bscs = admission[2].entrancebasic;
const cols = admission[3].entrancecollege;



console.log("admission", admission);




// Assuming admission is the array containing your data

// Create the h2 element with requrements title// Assuming you have a feeAmount property

// Create the ul element
const ulElement = document.getElementById("bscp_ul");
const ul2Element = document.getElementById("colp_ul")

// Iterate through requrements features and create li elements
bscs.forEach((feature) => {
  const pElement = document.createElement("li");
  pElement.textContent = feature;
  pElement.classList.add("text-gray-700");
  ulElement.appendChild(pElement);
});


cols.forEach((feature) => {
  const pElement = document.createElement("li");
  pElement.textContent = feature;
  pElement.classList.add("text-gray-700");
  ul2Element.appendChild(pElement);
  });

// Append the ul element to the requrements container




// Example: Populate HTML elements
const admptitleElement = document.getElementById("entTitle");
admptitleElement.innerHTML = `${fetch.entrancesystemTitle.replace(/\n/g, '<br/>')}`;
admptitleElement.style.whiteSpace = 'pre-line';

const admptextElement = document.getElementById("entText");
admptextElement.innerHTML = `${fetch.entrancesystemText.replace(/\n/g, '<br/>')}`;
admptextElement.style.whiteSpace = 'pre-line';





const fetchData2 = async () => {
  try {
    const dataRef = doc(db, 'cms', "indexPage");
    const querySnapshot = await getDoc(dataRef);
    console.log(querySnapshot, "qs")
  
    const data = querySnapshot.data();
  
    const pagedata = data;
    console.log("page data is now", pagedata);
  
    return data;
  
  
  
  
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  };

  const fetch2 = await fetchData2();

  const emailTextElement = document.getElementById("email");
emailTextElement.innerHTML = `${fetch2.emailfooter.replace(/\n/g, '<br/>')}`;
emailTextElement.style.whiteSpace = 'pre-line';




const phoneTextElement = document.getElementById("phone");
phoneTextElement.innerHTML = `${fetch2.phonefooter.replace(/\n/g, '<br/>')}`;
phoneTextElement.style.whiteSpace = 'pre-line';




})
.catch(error => console.error('Error fetching Firebase config:', error));