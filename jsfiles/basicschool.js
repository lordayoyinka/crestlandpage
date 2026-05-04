
document.addEventListener("DOMContentLoaded", function () {
  const snowfallContainer = document.querySelector(".snowfall");

  // Adjust the number of snowflakes
  const numberOfSnowflakes = 50;

  setInterval(createSnowflake, 500); // Create a snowflake every 500 milliseconds

  function createSnowflake() {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";

      // Randomize the initial position of each snowflake
      const initialX = Math.random() * window.innerWidth;
      const initialY = Math.random() * window.innerHeight;
      snowflake.style.left = initialX + "px";
      snowflake.style.top = initialY + "px";

      // Randomize the color with a preference for white
      const randomColor = Math.random() < 0.9 ? "#ffffff" : getRandomColor();
      snowflake.style.backgroundColor = randomColor;

      snowfallContainer.appendChild(snowflake);

      animateSnowflake(snowflake);
  }

  function animateSnowflake(snowflake) {
      const animationDuration = Math.random() * 5 + 1; // Random duration between 5 and 10 seconds

      snowflake.style.animation = `snowfall ${animationDuration}s linear`;

      snowflake.addEventListener("animationend", function () {
          snowflake.remove(); // Remove the snowflake after the animation ends
      });
  }

  function getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }
});











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
    const dataRef = doc(db, 'cms', "basicsPage");
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
