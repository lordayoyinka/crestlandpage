import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';


document.getElementById('nav-toggle').addEventListener('click', function() {
  var navMenu = document.querySelector('.nav-menu');
  var navToggle = document.querySelector('.nav-toggle');

  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});


var pagedata = null;


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

    pagedata = data;
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




const fees = fetch.fees;


console.log("fees", fees);




// Assuming fees is the array containing your data
const feesContainer = document.getElementById("fees-container");

fees.forEach((fee) => {
  // Create the main container for each fee
  const feeContainer = document.createElement("div");
  feeContainer.classList.add("admissioncarddetails");

  // Create the image element
  const imgElement = document.createElement("img");
  imgElement.src = "/assets/Group 22296.png";
  feeContainer.appendChild(imgElement);

  // Create the h2 element with fee title
  const h2Element = document.createElement("h2");
  h2Element.textContent = `${fee.feeTitle}`; // Assuming you have a feeAmount property
  feeContainer.appendChild(h2Element);

  // Create the ul element
  const ulElement = document.createElement("ul");

  // Iterate through fee features and create li elements
  fee.feeFeatures.forEach((feature) => {
    const liElement = document.createElement("li");
    const pElement = document.createElement("p");
    pElement.textContent = feature;
    liElement.appendChild(pElement);
    ulElement.appendChild(liElement);
  });

  // Append the ul element to the fee container
  feeContainer.appendChild(ulElement);

  // Append the fee container to the main container
  feesContainer.appendChild(feeContainer);
});





// Example: Populate HTML elements
const titleElement = document.getElementById("herotitle");
titleElement.innerHTML = `${fetch.heroTitle.replace(/\n/g, '<br/>')}`;
titleElement.style.whiteSpace = 'pre-line';

const subtextElement = document.getElementById("herosub");
subtextElement.innerHTML = `${fetch.heroSubtitle.replace(/\n/g, '<br/>')}`;
subtextElement.style.whiteSpace = 'pre-line';


const tsubtextElement = document.getElementById("herosubtext");
tsubtextElement.innerHTML = `${fetch.heroSubtitletext.replace(/\n/g, '<br/>')}`;
tsubtextElement.style.whiteSpace = 'pre-line';





const setion1textElement = document.getElementById("section1Text");
setion1textElement.innerHTML = `${fetch.section1Text.replace(/\n/g, '<br/>')}`;
setion1textElement.style.whiteSpace = 'pre-line';

// Example: Populate HTML elements
const setion2titleElement = document.getElementById("section2Title");
setion2titleElement.innerHTML = `${fetch.section2Title.replace(/\n/g, '<br/>')}`;
setion2titleElement.style.whiteSpace = 'pre-line';

const setion2subtextElement = document.getElementById("section2subtitle");
setion2subtextElement.innerHTML = `${fetch.section2subtitle.replace(/\n/g, '<br/>')}`;
setion2subtextElement.style.whiteSpace = 'pre-line';


const setion2tsubtextElement = document.getElementById("section2Text");
setion2tsubtextElement.innerHTML = `${fetch.section2Text.replace(/\n/g, '<br/>')}`;
setion2tsubtextElement.style.whiteSpace = 'pre-line';

})
.catch(error => console.error('Error fetching Firebase config:', error));

