

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';


var pagedata = null;
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
    const dataRef = doc(db, 'cms', "secondaryPage");
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

    const notables = fetch.notables;




    
// Example: Populate HTML elements
const titleElement = document.getElementById("herotitle");
titleElement.innerHTML = `${fetch.heroTitle.replace(/\n/g, '<br/>')}`;
titleElement.style.whiteSpace = 'pre-line';

const textElement = document.getElementById("herosub");
textElement.innerHTML = `${fetch.heroSubtitle.replace(/\n/g, '<br/>')}`;
textElement.style.whiteSpace = 'pre-line';


//sec 1


const sec1titleElement = document.getElementById("detailsText");
sec1titleElement.innerHTML = `${fetch.detailsText.replace(/\n/g, '<br/>')}`;
sec1titleElement.style.whiteSpace = 'pre-line';






    // Assuming notables is the array containing your data
const activitiesContainer = document.getElementById("activities-container");

// Create the main container for activities
const activitiesListContainer = document.createElement("div");
activitiesListContainer.classList.add("activitylist");

// Create the ul element
const ulElement = document.createElement("ul");
ulElement.classList.add("activity-list");

// Iterate through notables and create li elements
notables.forEach((notable) => {
  const liElement = document.createElement("li");
  const spanElement = document.createElement("span");
  spanElement.classList.add("bullet");
  spanElement.textContent = "+";
  liElement.appendChild(spanElement);
  liElement.innerHTML += ` ${notable}`;
  ulElement.appendChild(liElement);
});

// Append the ul element to the activities container
activitiesListContainer.appendChild(ulElement);

// Append the activities container to the main container
activitiesContainer.appendChild(activitiesListContainer);


})
.catch(error => console.error('Error fetching Firebase config:', error));
