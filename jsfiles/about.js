import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

var pagedata = null;

document.getElementById('nav-toggle').addEventListener('click', function () {
  var navMenu = document.querySelector('.nav-menu');
  var navToggle = document.querySelector('.nav-toggle');

  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Works whether the site is running on Vercel (/api/configfile) or
// Netlify (.netlify/functions/configfile) — tries Vercel first, falls
// back to Netlify, so the same repo deploys cleanly on either host.
// (Previously this file only tried the Netlify path, which 404s on
// Vercel and silently breaks every dynamic section on this page.)
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
  .then(async data => {
    const firebaseConfig = data.firebaseConfig;
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(db, "db")

    const fetchData = async () => {
      try {
        const dataRef = doc(db, 'cms', "aboutPage");
        const querySnapshot = await getDoc(dataRef);
        const data = querySnapshot.data();
        pagedata = data;
        return data;
      } catch (error) {
        console.error('Error fetching aboutPage data:', error);
        return null;
      }
    };

    const fetchData2 = async () => {
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

    const fetch2 = await fetchData2();
    const fetch = await fetchData();

    console.log("fetch", fetch, "fetch2", fetch2)

    // ---------- Staff ----------
    const teachers = fetch2.teachers;
    const staffCardsContainer = document.querySelector(".staff-cards-container");

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

    // ---------- Hero ----------
    const titleElement = document.getElementById("aboutTitle");
    titleElement.innerHTML = `${(fetch.aboutTitle || "").replace(/\n/g, '<br/>')}`;
    titleElement.style.whiteSpace = 'pre-line';

    const subtextElement = document.getElementById("aboutSubtitle");
    subtextElement.innerHTML = `${(fetch.aboutSubtitle || "").replace(/\n/g, '<br/>')}`;
    subtextElement.style.whiteSpace = 'pre-line';

    // ---------- Director spotlights ----------
    const dir1TitleElement = document.getElementById("dirName1");
    dir1TitleElement.innerHTML = `${(fetch.directcollegeTitle || "").replace(/\n/g, '<br/>')}`;
    dir1TitleElement.style.whiteSpace = 'pre-line';

    const dir2TitleElement = document.getElementById("dirName2");
    dir2TitleElement.innerHTML = `${(fetch.directbasicTitle || "").replace(/\n/g, '<br/>')}`;
    dir2TitleElement.style.whiteSpace = 'pre-line';

    const dir3TitleElement = document.getElementById("dirName3");
    dir3TitleElement.innerHTML = `${(fetch.directprebasicTitle || "").replace(/\n/g, '<br/>')}`;
    dir3TitleElement.style.whiteSpace = 'pre-line';

    // Director bio text (present in the CMS, previously never rendered on the page at all)
    const dir1TextElement = document.getElementById("dirText1");
    if (dir1TextElement) {
      dir1TextElement.innerHTML = `${(fetch.directcollegeText || "").replace(/\n/g, '<br/>')}`;
    }
    const dir2TextElement = document.getElementById("dirText2");
    if (dir2TextElement) {
      dir2TextElement.innerHTML = `${(fetch.directprebasicText || "").replace(/\n/g, '<br/>')}`;
    }
    const dir3TextElement = document.getElementById("dirText3");
    if (dir3TextElement) {
      dir3TextElement.innerHTML = `${(fetch.directprebasicAbout || "").replace(/\n/g, '<br/>')}`;
    }

    // ---------- Mission / Vision (shared with homepage, stored on indexPage) ----------
    const vissiontextElement = document.getElementById("visionText");
    vissiontextElement.innerHTML = `${(fetch2.visionText || "").replace(/\n/g, '<br/>')}`;
    vissiontextElement.style.whiteSpace = 'pre-line';

    const missionTextElement = document.getElementById("missionText");
    missionTextElement.innerHTML = `${(fetch2.missionText || "").replace(/\n/g, '<br/>')}`;
    missionTextElement.style.whiteSpace = 'pre-line';

    // ---------- Topbar (matches index.html's header exactly) ----------
    const emailTopElement = document.getElementById("email-top");
    if (emailTopElement) emailTopElement.textContent = fetch2.emailfooter || "";

    const phoneTopElement = document.getElementById("phone-top");
    if (phoneTopElement) phoneTopElement.textContent = fetch2.phonefooter || "";

    const topbarLinkIds = {
      facebookfooter: "facebooktop",
      linkedinfooter: "linkedintop",
      instagramfooter: "instagramtop",
      twitterfooter: "twittertop",
    };
    Object.entries(topbarLinkIds).forEach(([field, id]) => {
      const el = document.getElementById(id);
      if (el && fetch2[field]) el.href = fetch2[field];
    });

    // ---------- Footer (same fields/IDs as script.js on the homepage) ----------
    const emailTextElement = document.getElementById("email");
    if (emailTextElement) {
      emailTextElement.innerHTML = `${(fetch2.emailfooter || "").replace(/\n/g, '<br/>')}`;
    }

    const phoneTextElement = document.getElementById("phone");
    if (phoneTextElement) {
      phoneTextElement.innerHTML = `${(fetch2.phonefooter || "").replace(/\n/g, '<br/>')}`;
    }

    const footerLinkIds = {
      facebookfooter: "facebookfooter",
      linkedinfooter: "linkedinfooter",
      instagramfooter: "instagramfooter",
      twitterfooter: "twitterfooter",
    };
    Object.entries(footerLinkIds).forEach(([field, id]) => {
      const el = document.getElementById(id);
      if (el && fetch2[field]) el.href = fetch2[field];
    });

    const copyrightYearEl = document.getElementById("copyright-year");
    if (copyrightYearEl) copyrightYearEl.textContent = new Date().getFullYear();

    // ---------- Director images ----------
    const image3 = fetch.prebasicphoto;
    const image1 = fetch.collegephoto;
    const image2 = fetch.basicphoto;

    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");

    if (image1) img1.src = image1;
    if (image2) img2.src = image2;
    if (image3) img3.src = image3;

    // ---------- Auto-scroll the director sections ----------
    const container = document.getElementById('sections-container');
    if (container) {
      const clonedContent = container.innerHTML;
      container.innerHTML += clonedContent;

      const scrollSpeed = 2;
      function autoScroll() {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft -= container.scrollWidth / 2;
        }
        requestAnimationFrame(autoScroll);
      }
      autoScroll();
    }
  })
  .catch(error => console.error('Error fetching Firebase config or page data:', error));
