import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';


var pagedata = null;
document.getElementById('nav-toggle').addEventListener('click', function () {
  var navMenu = document.querySelector('.nav-menu');
  var navToggle = document.querySelector('.nav-toggle');

  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});













fetch('./../.netlify/functions/configfile')
  .then(response => response.json())
  .then(async data => {
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

        pagedata = data;
        console.log("page data is now", pagedata);

        return data;





      } catch (error) {
        console.error('Error fetching data:', error);
        return null;
      }
    };




    const fetchData2 = async () => {
      try {
        const dataRef = doc(db, 'cms', "indexPage");
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


    const fetch2 = await fetchData2();







    // Call the function to fetch data


    const fetch = await fetchData();




    // Example: Retrieve data from Firestore


    console.log("fetch", fetch)




    // Assuming teachers is an object where each key represents a teacher
    const teachers = fetch2.teachers;

    // Get the container element to append staff cards
    const staffCardsContainer = document.querySelector(".staff-cards-container");

    // Loop through teachers and create staff cards
    Object.keys(teachers).forEach((teacherKey) => {
      const teacher = teachers[teacherKey];

      // Create staff card element
      const staffCard = document.createElement("div");
      staffCard.className = "staff-card";

      // Create image element
      const img = document.createElement("img");
      img.src = teacher.teacherPicture;
      img.alt = teacher.teacherName;

      // Create heading element
      const h3 = document.createElement("h3");
      h3.textContent = teacher.teacherName;

      // Create paragraph elements
      const pRole = document.createElement("p");
      pRole.textContent = `Role: ${teacher.teacherRole}`;

      // Append elements to staff card
      staffCard.appendChild(img);
      staffCard.appendChild(h3);
      staffCard.appendChild(pRole);

      // Append staff card to staff cards container
      staffCardsContainer.appendChild(staffCard);
    });









    // Example: Populate HTML elements
    const titleElement = document.getElementById("aboutTitle");
    titleElement.innerHTML = `${fetch.aboutTitle.replace(/\n/g, '<br/>')}`;
    titleElement.style.whiteSpace = 'pre-line';

    const subtextElement = document.getElementById("aboutSubtitle");
    subtextElement.innerHTML = `${fetch.aboutSubtitle.replace(/\n/g, '<br/>')}`;
    subtextElement.style.whiteSpace = 'pre-line';



    const dir1TitleElement = document.getElementById("dirName1");
    dir1TitleElement.innerHTML = `${fetch.directcollegeTitle.replace(/\n/g, '<br/>')}`;
    dir1TitleElement.style.whiteSpace = 'pre-line';


    const dir2TitleElement = document.getElementById("dirName2");
    dir2TitleElement.innerHTML = `${fetch.directbasicTitle.replace(/\n/g, '<br/>')}`;
    dir2TitleElement.style.whiteSpace = 'pre-line';


    const dir3TitleElement = document.getElementById("dirName3");
    dir3TitleElement.innerHTML = `${fetch.directprebasicTitle.replace(/\n/g, '<br/>')}`;
    dir3TitleElement.style.whiteSpace = 'pre-line';

    const vissiontextElement = document.getElementById("visionText");
    vissiontextElement.innerHTML = `${fetch2.visionText.replace(/\n/g, '<br/>')}`;
    vissiontextElement.style.whiteSpace = 'pre-line';

    const missionTextElement = document.getElementById("missionText");
    missionTextElement.innerHTML = `${fetch2.missionText.replace(/\n/g, '<br/>')}`;
    missionTextElement.style.whiteSpace = 'pre-line';


    const emailTextElement = document.getElementById("email");
    emailTextElement.innerHTML = `${fetch2.emailfooter.replace(/\n/g, '<br/>')}`;
    emailTextElement.style.whiteSpace = 'pre-line';




    const phoneTextElement = document.getElementById("phone");
    phoneTextElement.innerHTML = `${fetch2.phonefooter.replace(/\n/g, '<br/>')}`;
    phoneTextElement.style.whiteSpace = 'pre-line';


    const image3 = fetch.prebasicphoto;
    const image1 = fetch.collegephoto;
    const image2 = fetch.basicphoto;


    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");
  
    // Function to set image
    img3.src = image3;
    img1.src = image1;
    img2.src = image2;

    
  















    // Function to preload images
  

    // Clone the content and append it to the container
    const container = document.getElementById('sections-container');
    const clonedContent = container.innerHTML;
    container.innerHTML += clonedContent;

 

    const scrollSpeed = 2;



    // Set up the auto-scrolling and image updating
    function autoScroll() {
      container.scrollLeft += scrollSpeed;

      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft -= container.scrollWidth / 2;

      }

      requestAnimationFrame(autoScroll);
    }


   
    // Call autoScroll function to start the animation
    autoScroll();



    // Your existing code for populating HTML elements...














  })
  .catch(error => console.error('Error fetching Firebase config:', error));
