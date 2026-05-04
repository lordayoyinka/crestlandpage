

// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

    
document.getElementById('nav-toggle').addEventListener('click', function() {
  var navMenu = document.querySelector('.nav-menu');
  var navToggle = document.querySelector('.nav-toggle');

  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});


document.addEventListener('DOMContentLoaded', async function () {
    const categoryLinks = document.querySelectorAll('.category-navigation a');
    const imageGrid = document.querySelector('.image-grid');
    const viewMoreButton = document.querySelector('.view-more');
  





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
    const dataRef = doc(db, 'cms', "galleryPage");
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


    var fetch = await fetchData();







    // Define online image URLs for each category
    const imageUrls = fetch.gallery;

    console.log("all images", imageUrls);


    // Function to load images based on category
 // Function to load images based on category
// Function to load images based on category
function loadImages(category) {
    imageGrid.innerHTML = '';
  
    const images = [];
  
    imageUrls.forEach((item) => {
      if (item[category]) {
        images.push(item[category]);
      }
    });
  
    console.log('images', images);
    images.forEach((imageUrl) => {
      imageUrl.forEach((img) => {
        // Create a container for each image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
  
        // Create an image element
        const imgElement = document.createElement('img');
        imgElement.src = img.link;
        imgElement.alt = 'Image'; // Set alt text for accessibility
  
        // Set the title attribute to display the name on hover
        imgElement.title = img.name;
  
        // Create an overlay element to display the name
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.textContent = img.name;
  
        // Append image and overlay to the container
        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(overlay);
  
        // Append the container to the image grid
        imageGrid.appendChild(imgContainer);
      });
    });
  }
  

    // Add click event listeners to category links
    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.getAttribute('data-category');
            if (category) {
                loadImages(category);
                viewMoreButton.style.display = 'block'; // Show the "View More" button
            }
        });
    });

    // Click event listener for the "View More" button
    loadImages('all');
    viewMoreButton.addEventListener('click', () => {
        // Add code here to view more images or open a modal
    });
});



















const imageUrls = fetch.gallery;
console.log("all images", imageUrls);





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
emailTextElement.innerHTML = `${fetch2.missionText.replace(/\n/g, '<br/>')}`;
emailTextElement.style.whiteSpace = 'pre-line';




const phoneTextElement = document.getElementById("phone");
phoneTextElement.innerHTML = `${fetch2.missionText.replace(/\n/g, '<br/>')}`;
phoneTextElement.style.whiteSpace = 'pre-line';





})
.catch(error => console.error('Error fetching Firebase config:', error));
