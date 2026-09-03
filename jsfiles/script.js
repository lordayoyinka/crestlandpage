const navbar = document.querySelector(".navbar");

document.addEventListener("scroll", function () {
    if (window.scrollY > 100) { 
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.staff-cards-containers');
    const scrollAmount = 1;
    const scrollSpeed = 1;

    function autoScroll() {
        if (!container) return;
        container.scrollLeft += scrollAmount * scrollSpeed;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
            container.scrollLeft = 0;
        }
        requestAnimationFrame(autoScroll);
    }

    autoScroll();
});

document.getElementById('nav-toggle').addEventListener('click', function() {
    var navMenu = document.querySelector('.nav-menu');
    var navToggle = document.querySelector('.nav-toggle');
  
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("prevButton");
    const prevButton = document.getElementById("nextButton");
    const cardContainer = document.querySelector(".blog-card-container");

    const scrollWidth = 450;

    function scrollCardsLeft() {
        cardContainer.scrollLeft -= scrollWidth;
    }

    function scrollCardsRight() {
        cardContainer.scrollLeft += scrollWidth;
    }

    nextButton.addEventListener("click", scrollCardsRight);
    prevButton.addEventListener("click", scrollCardsLeft);
});

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

var pagedata = null;

async function fetchFirebaseConfigJson() {
  const endpoints = ['/api/configfile', './../.netlify/functions/configfile'];
  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (e) {
      // try the next endpoint
    }
  }
  throw new Error('Could not load Firebase config from /api/configfile or the Netlify function.');
}

fetchFirebaseConfigJson()
  .then(response => response.json())
  .then (async data => {
    const firebaseConfig = data.firebaseConfig;

          const app = initializeApp(firebaseConfig);
          const db = getFirestore(app);

          console.log(db, "db")

const fetchData = async () => {
  try {
    const dataRef = doc(db, 'cms', "indexPage");
    const querySnapshot = await getDoc(dataRef);
    const data = querySnapshot.data();
    pagedata = data;
    return data;
  } catch (error) {
    console.error('Error fetching indexPage data:', error);
    return null;
  }
};

// Administrators live on the aboutPage doc (same source as the About page),
// so the same 4 profiles show consistently on both pages.
const fetchAboutData = async () => {
  try {
    const dataRef = doc(db, 'cms', "aboutPage");
    const querySnapshot = await getDoc(dataRef);
    const data = querySnapshot.data();
    return data;
  } catch (error) {
    console.error('Error fetching aboutPage data:', error);
    return null;
  }
};

    const fetch = await fetchData();
    const aboutData = await fetchAboutData();

console.log("fetch",  fetch)

// Example: Populate HTML elements
const titleElement = document.getElementById("herotitle");
titleElement.innerHTML = `${fetch.heroTitle.replace(/\n/g, '<br/>')}`;
titleElement.style.whiteSpace = 'pre-line';

const textElement = document.getElementById("herosub");
textElement.innerHTML = `${fetch.heroSubtitle.replace(/\n/g, '<br/>')}`;
textElement.style.whiteSpace = 'pre-line';

//sec 1

const sec1titleElement = document.getElementById("sec1title");
sec1titleElement.innerHTML = `${fetch.section1Title.replace(/\n/g, '<br/>')}`;
sec1titleElement.style.whiteSpace = 'pre-line';

const sec1textElement = document.getElementById("sec1text");
sec1textElement.innerHTML = `${fetch.section1Text.replace(/\n/g, '<br/>')}`;
titleElement.style.whiteSpace = 'pre-line';

// //sec 2

const sec2titleElement = document.getElementById("sec2title");
sec2titleElement.innerHTML = `${fetch.section2Title.replace(/\n/g, '<br/>')}`;
sec2titleElement.style.whiteSpace = 'pre-line';

const sec2text = document.getElementById("sec2text");
sec2text.innerHTML = `${fetch.section2Text.replace(/\n/g, '<br/>')}`;
sec2text.style.whiteSpace = 'pre-line';

// // sc 3

const sec3titleElement = document.getElementById("sec3title");
sec3titleElement.innerHTML = `${fetch.section3Title.replace(/\n/g, '<br/>')}`;
sec3titleElement.style.whiteSpace = 'pre-line';

const sec3textElement = document.getElementById("sec3text");
sec3textElement.innerHTML = `${fetch.section3Text.replace(/\n/g, '<br/>')}`;
sec3textElement.style.whiteSpace = 'pre-line';

const sec3subtitleElement = document.getElementById("sec3subtitle");
sec3subtitleElement.innerHTML = `${fetch.section3Subtitle.replace(/\n/g, '<br/>')}`;
sec3subtitleElement.style.whiteSpace = 'pre-line';

// vs an ms

const 
vissionElement = document.getElementById("visionText");
vissionElement.innerHTML = `${fetch.visionText.replace(/\n/g, '<br/>')}`;
vissionElement.style.whiteSpace = 'pre-line';

const 
missionElement = document.getElementById("missionText");
missionElement.innerHTML = `${fetch.missionText.replace(/\n/g, '<br/>')}`;
missionElement.style.whiteSpace = 'pre-line';

//foot

// Renders one <p><i>icon</i> value</p> per line, so multiple phone numbers
// or emails each get their own icon instead of sharing a single icon
// (previously only the first number/email had an icon in front of it).
function renderContactLines(containerId, text, iconClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const lines = (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  lines.forEach((line) => {
    const p = document.createElement("p");
    const icon = document.createElement("i");
    icon.className = iconClass;
    p.appendChild(icon);
    p.appendChild(document.createTextNode(" " + line));
    container.appendChild(p);
  });
}

renderContactLines("email-list", fetch.emailfooter, "fas fa-envelope");
renderContactLines("phone-list", fetch.phonefooter, "fas fa-phone");

// Topbar: same idea as the footer, but laid out as inline spans (not
// stacked <p> lines) so multiple numbers/emails sit on one row —
// each still gets its own icon, which is what separates them visually.
function renderContactLinesInline(containerId, text, iconClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const lines = (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  lines.forEach((line) => {
    const span = document.createElement("span");
    span.className = "topbar-contact-line";
    const icon = document.createElement("i");
    icon.className = iconClass;
    span.appendChild(icon);
    span.appendChild(document.createTextNode(" " + line));
    container.appendChild(span);
  });
}

renderContactLinesInline("email-top-list", fetch.emailfooter, "fas fa-envelope");
renderContactLinesInline("phone-top-list", fetch.phonefooter, "fas fa-phone");

// Get the anchor element by its ID
const myLink1 = document.getElementById("facebookfooter");
const myLink2 = document.getElementById("linkedinfooter");
const myLink3 = document.getElementById("instagramfooter");
const myLink4 = document.getElementById("twitterfooter");

// Set the href attribute to the dynamic URL
myLink1.href = fetch.facebookfooter;
myLink2.href = fetch.linkedinfooter;
myLink3.href = fetch.instagramfooter;
myLink4.href = fetch.twitterfooter;

const foot4titleElement = document.getElementById("sec3title");
foot4titleElement.innerHTML = `${fetch.section3Title.replace(/\n/g, '<br/>')}`;
foot4titleElement.style.whiteSpace = 'pre-line';

const foot3titleElement = document.getElementById("sec3title");
foot3titleElement.innerHTML = `${fetch.section3Title.replace(/\n/g, '<br/>')}`;
foot3titleElement.style.whiteSpace = 'pre-line';

const foot2titleElement = document.getElementById("sec3title");
foot2titleElement.innerHTML = `${fetch.section3Title.replace(/\n/g, '<br/>')}`;
foot2titleElement.style.whiteSpace = 'pre-line';

const foot1titleElement = document.getElementById("sec3title");
foot1titleElement.innerHTML = `${fetch.section3Title.replace(/\n/g, '<br/>')}`;
foot1titleElement.style.whiteSpace = 'pre-line';

// Assuming testimonials is an array of testimonial objects
const testimonials = fetch.testimonials;
// Get the container element to append cards
const cardContainer = document.querySelector(".blog-card-container");
const modal = document.getElementById("myModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalContentText = document.getElementById("modalContentText");
const modalImage2 = document.getElementById("modalImage2");
const modalImage3 = document.getElementById("modalImage3");

// Loop through testimonials and create cards
testimonials.forEach((testimonial) => {
  const card = document.createElement("div");
  card.className = "blog-card";

const cardImage = document.createElement("img");
cardImage.className = "blog-card-image";
cardImage.src = testimonial.testimonialimg;
cardImage.alt = testimonial.parentName;

  const pParagraphContainer = document.createElement("div");
  pParagraphContainer.className = "blog-card-paragraph";

  const titleP = document.createElement("p");
  const title = testimonial.parentName.split('\n');
  titleP.innerHTML = title.join('<br>');
  titleP.classList.add("blog-card-title");

  const titlea = document.createElement("p");
  titlea.innerHTML = "Read More...";

  const paragraph = document.createElement("p");
  const paragraphLines = testimonial.testimonialText.split('\n');
  paragraph.innerHTML = paragraphLines.join('<br>');

  pParagraphContainer.appendChild(paragraph);

 card.appendChild(cardImage);
  card.appendChild(titleP);
  card.appendChild(pParagraphContainer);
  card.appendChild(titlea)

  card.addEventListener("click", () => openModal(
    testimonial.parentName,
    paragraph.innerHTML,
    testimonial.testimonialimg,
    testimonial.testimonialimg2,
    testimonial.testimonialimg3
  ));
  
  cardContainer.appendChild(card);
});

function openModal(title, content, image, image2, image3) {
 modalImage.src = image;
  modalTitle.textContent = title;
  modalContentText.innerHTML = content;

  if (image2) {
    modalImage2.style.backgroundImage = `url(${image2})`;
    modalImage2.style.display = "block";
  } else {
    modalImage2.style.display = "none";
  }

  if (image3) {
    modalImage3.style.backgroundImage = `url(${image3})`;
    modalImage3.style.display = "block";
  } else {
    modalImage3.style.display = "none";
  }

  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

// ---------- School Administration (4 fixed profiles, from aboutPage doc) ----------
// Shown before the Teachers section, same visual card style, reusing the
// existing .staff-card class from style.css.
const administrators = (aboutData && aboutData.administrators) || [];
const adminsContainer = document.getElementById("admins-container");
if (adminsContainer) {
  administrators.forEach((admin) => {
    if (!admin || (!admin.adminName && !admin.adminPicture)) return;

    const staffCard = document.createElement("div");
    staffCard.className = "staff-card";

    const img = document.createElement("img");
    img.src = admin.adminPicture || "";
    img.alt = admin.adminName || "";

    const h3 = document.createElement("h3");
    h3.textContent = admin.adminName || "";

    const pRole = document.createElement("p");
    pRole.textContent = admin.adminRole ? `Role: ${admin.adminRole}` : "";

    staffCard.appendChild(img);
    staffCard.appendChild(h3);
    staffCard.appendChild(pRole);

    adminsContainer.appendChild(staffCard);
  });
}

// Assuming teachers is an object where each key represents a teacher
const teachers = fetch.teachers;

// Teachers now render into their own container (#teachers-container),
// separate from #admins-container above.
const staffCardsContainer = document.getElementById("teachers-container");

Object.keys(teachers).forEach((teacherKey) => {
  const teacher = teachers[teacherKey];

  const staffCard = document.createElement("div");
  staffCard.className = "staff-card";

  const img = document.createElement("img");
  img.src = teacher.teacherPicture;
  img.alt = teacher.teacherName;

  const h3 = document.createElement("h3");
  h3.textContent = teacher.teacherName;

  const pRole = document.createElement("p");
  pRole.textContent = `Role: ${teacher.teacherRole}`;

  staffCard.appendChild(img);
  staffCard.appendChild(h3);
  staffCard.appendChild(pRole);

  staffCardsContainer.appendChild(staffCard);
});

})
.catch((error) => console.log('Error fetching Firebase config:', error));
