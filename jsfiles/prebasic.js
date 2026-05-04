
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









     
  document.getElementById('nav-toggle').addEventListener('click', function() {
    var navMenu = document.querySelector('.nav-menu');
    var navToggle = document.querySelector('.nav-toggle');
  
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });
  

  });
  


 
  


  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';



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
    const dataRef = doc(db, 'cms', "aboutPage");
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




const fetchData2 = async () => {
  try {
    const dataRef = doc(db, 'cms', "galleryPage");
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


    const fetch2 = await fetchData2();







// Call the function to fetch data


    const fetch = await fetchData();




// Example: Retrieve data from Firestore


console.log("fetch",  fetch)




  









// // Example: Populate HTML elements
// const titleElement = document.getElementById("aboutTitle");
// titleElement.innerHTML = `${fetch.aboutTitle.replace(/\n/g, '<br/>')}`;
// titleElement.style.whiteSpace = 'pre-line';

// const subtextElement = document.getElementById("aboutSubtitle");
// subtextElement.innerHTML = `${fetch.aboutSubtitle.replace(/\n/g, '<br/>')}`;
// subtextElement.style.whiteSpace = 'pre-line';



const abtpretextElement = document.getElementById("abtpre");
abtpretextElement.innerHTML = `${fetch.directprebasicAbout.replace(/\n/g, '<br/>')}`;
abtpretextElement.style.whiteSpace = 'pre-line';


const dir3textElement = document.getElementById("dirText");
dir3textElement.innerHTML = `${fetch.directprebasicText.replace(/\n/g, '<br/>')}`;
dir3textElement.style.whiteSpace = 'pre-line';

const dir3TitleElement = document.getElementById("dirName");
dir3TitleElement.innerHTML = `${fetch.directbasicTitle.replace(/\n/g, '<br/>')}`;
dir3TitleElement.style.whiteSpace = 'pre-line';


const img = document.getElementById("img");
img.src = fetch.basicphoto;









const imageUrls = fetch2.gallery;

const sectionsContainer = document.getElementById("sections_container")


function createCategoryElement(category) {
      
        const images = [];

      
        imageUrls.forEach((item) => {
          if (item[category]) {
            images.push(item[category]);
            console.log(images)
          }
        });
    
    // Create a category container
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category';
  
    // Create the title (h3) for the category
    const categoryTitle = document.createElement('h3');

    if(category == "prebasic"){

        categoryTitle.textContent = "Pre-Basic Gallery";
    }else{
        categoryTitle.textContent = "Other Memorable Pictures";

    }
  
    // Create the image container for the category
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
  
    // Add images to the image container
    images[0].forEach(imageUrl => {
      const imgElement = document.createElement('img');
      console.log("img", imageUrl)
      imgElement.src = imageUrl.link;
      imageContainer.appendChild(imgElement);
    });
  
    // Append title and image container to the category container
    categoryContainer.appendChild(categoryTitle);
    categoryContainer.appendChild(imageContainer);
  
    // Append the category container to the sections container
    sectionsContainer.appendChild(categoryContainer);
  }
  
  // Create categories dynamically
  ["prebasic", "prebasic_memories"].forEach(category => {
    createCategoryElement(category);
  });








  const fetchData3 = async () => {
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
  
    const fetch3 = await fetchData3();
  
    const emailTextElement = document.getElementById("email");
  emailTextElement.innerHTML = `${fetch3.emailfooter.replace(/\n/g, '<br/>')}`;
  emailTextElement.style.whiteSpace = 'pre-line';
  
  
  
  
  const phoneTextElement = document.getElementById("phone");
  phoneTextElement.innerHTML = `${fetch3.phonefooter.replace(/\n/g, '<br/>')}`;
  phoneTextElement.style.whiteSpace = 'pre-line';
  
  
  




})
.catch(error => console.error('Error fetching Firebase config:', error));
