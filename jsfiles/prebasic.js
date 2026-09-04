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

    document.getElementById('nav-toggle').addEventListener('click', function () {
        var navMenu = document.querySelector('.nav-menu');
        var navToggle = document.querySelector('.nav-toggle');

        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

});

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

// Works whether the site is running on Vercel (/api/configfile) or
// Netlify (.netlify/functions/configfile) — tries Vercel first, falls
// back to Netlify. (Previously this only tried the Netlify path, which
// 404s on Vercel and silently breaks every dynamic section on this page.)
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

    // Use Firestore functionality
    const fetchData = async () => {
      try {
        const dataRef = doc(db, 'cms', "aboutPage");
        const querySnapshot = await getDoc(dataRef);
        const data = querySnapshot.data();
        console.log("page data is now", data);
        return data;
      } catch (error) {
        console.error('Error fetching aboutPage data:', error);
        return null;
      }
    };

    const fetchData2 = async () => {
      try {
        const dataRef = doc(db, 'cms', "galleryPage");
        const querySnapshot = await getDoc(dataRef);
        const data = querySnapshot.data();
        console.log("page data is now", data);
        return data;
      } catch (error) {
        console.error('Error fetching galleryPage data:', error);
        return null;
      }
    };

    const fetch2 = await fetchData2();
    const fetch = await fetchData();

    console.log("fetch", fetch)

    // ---------- About text (reuses aboutPage's "About Nursery and Primary" field) ----------
    const abtpretextElement = document.getElementById("abtpre");
    if (abtpretextElement) {
      abtpretextElement.innerHTML = `${(fetch.directprebasicAbout || "").replace(/\n/g, '<br/>')}`;
      abtpretextElement.style.whiteSpace = 'pre-line';
    }

    // Renders a bio truncated to a fixed length, with a "Read more" toggle
    // if the full text is longer — same pattern used for the director bios
    // on the About page, just a longer limit here since this page only
    // shows one profile (more room to give it).
    const BIO_CHAR_LIMIT = 500;
    function renderBio(elementId, text) {
      const el = document.getElementById(elementId);
      if (!el) return;

      const full = (text || "").trim();
      el.innerHTML = "";

      if (!full) return;

      if (full.length <= BIO_CHAR_LIMIT) {
        el.innerHTML = full.replace(/\n/g, '<br/>');
        return;
      }

      // Truncate on a word boundary so it doesn't cut mid-word.
      let truncated = full.slice(0, BIO_CHAR_LIMIT);
      truncated = truncated.slice(0, truncated.lastIndexOf(' ')) || truncated;

      const textSpan = document.createElement('span');
      textSpan.className = 'bio-text';
      textSpan.innerHTML = (truncated + '…').replace(/\n/g, '<br/>');

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'read-more-btn';
      toggleBtn.textContent = 'Read more';

      let expanded = false;
      toggleBtn.addEventListener('click', () => {
        expanded = !expanded;
        textSpan.innerHTML = (expanded ? full : truncated + '…').replace(/\n/g, '<br/>');
        toggleBtn.textContent = expanded ? 'Read less' : 'Read more';
      });

      el.appendChild(textSpan);
      el.appendChild(document.createElement('br'));
      el.appendChild(toggleBtn);
    }

    // ---------- School Director (same identity as About page's School Director) ----------
    renderBio("dirText", fetch.directprebasicText);

    const dir3TitleElement = document.getElementById("dirName");
    if (dir3TitleElement) {
      dir3TitleElement.innerHTML = `${(fetch.directbasicTitle || "").replace(/\n/g, '<br/>')}`;
      dir3TitleElement.style.whiteSpace = 'pre-line';
    }

    const img = document.getElementById("img");
    if (img && fetch.basicphoto) img.src = fetch.basicphoto;

    // ---------- Gallery ----------
    const imageUrls = fetch2 && fetch2.gallery ? fetch2.gallery : [];
    const sectionsContainer = document.getElementById("sections_container");

    function createCategoryElement(category) {
      const images = [];

      imageUrls.forEach((item) => {
        if (item && item[category]) {
          images.push(item[category]);
        }
      });

      // If no gallery entry has this category yet, skip it quietly instead
      // of throwing and taking down everything rendered after this point.
      if (!images[0] || !Array.isArray(images[0])) {
        console.log(`No gallery images found for category "${category}" yet.`);
        return;
      }

      const categoryContainer = document.createElement('div');
      categoryContainer.className = 'category';

      const categoryTitle = document.createElement('h3');
      if (category === "prebasic") {
        categoryTitle.textContent = "Pre-Basic Gallery";
      } else {
        categoryTitle.textContent = "Other Memorable Pictures";
      }

      const imageContainer = document.createElement('div');
      imageContainer.className = 'image-container';

      images[0].forEach(imageUrl => {
        if (!imageUrl || !imageUrl.link) return;
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl.link;
        imgElement.loading = 'lazy';
        imageContainer.appendChild(imgElement);
      });

      categoryContainer.appendChild(categoryTitle);
      categoryContainer.appendChild(imageContainer);

      if (sectionsContainer) sectionsContainer.appendChild(categoryContainer);
    }

    if (sectionsContainer) {
      ["prebasic", "prebasic_memories"].forEach(category => {
        createCategoryElement(category);
      });
    }

    // ---------- Footer / topbar contact (indexPage doc) ----------
    const fetchData3 = async () => {
      try {
        const dataRef = doc(db, 'cms', "indexPage");
        const querySnapshot = await getDoc(dataRef);
        const data = querySnapshot.data();
        console.log("page data is now", data);
        return data;
      } catch (error) {
        console.error('Error fetching indexPage data:', error);
        return null;
      }
    };

    const fetch3 = await fetchData3();

    // Renders one <p><i>icon</i> value</p> per line, so multiple phone
    // numbers or emails each get their own icon (matches about.js/script.js).
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

    // Same idea, laid out inline for the topbar (matches about.js/script.js).
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

    if (fetch3) {
      renderContactLines("email-list", fetch3.emailfooter, "fas fa-envelope");
      renderContactLines("phone-list", fetch3.phonefooter, "fas fa-phone");
      renderContactLinesInline("email-top-list", fetch3.emailfooter, "fas fa-envelope");
      renderContactLinesInline("phone-top-list", fetch3.phonefooter, "fas fa-phone");

      const socialLinkIds = {
        facebookfooter: ["facebooktop", "facebookfooter"],
        linkedinfooter: ["linkedintop", "linkedinfooter"],
        instagramfooter: ["instagramtop", "instagramfooter"],
        twitterfooter: ["twittertop", "twitterfooter"],
      };
      Object.entries(socialLinkIds).forEach(([field, ids]) => {
        if (!fetch3[field]) return;
        ids.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.href = fetch3[field];
        });
      });

      const copyrightYearEl = document.getElementById("copyright-year");
      if (copyrightYearEl) copyrightYearEl.textContent = new Date().getFullYear();
    }

  })
  .catch(error => console.error('Error fetching Firebase config or page data:', error));
