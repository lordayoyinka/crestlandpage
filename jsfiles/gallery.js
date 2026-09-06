import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

document.getElementById('nav-toggle').addEventListener('click', function () {
  var navMenu = document.querySelector('.nav-menu');
  var navToggle = document.querySelector('.nav-toggle');
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Works whether the site is running on Vercel (/api/configfile) or
// Netlify (.netlify/functions/configfile) — tries Vercel first, falls
// back to Netlify.
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

// Renders one <p><i>icon</i> value</p> per line, so multiple phone numbers
// or emails each get their own icon (matches about.js/script.js).
function renderContactLines(containerId, text, iconClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const lines = (text || "").split("\n").map((s) => s.trim()).filter(Boolean);
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
  const lines = (text || "").split("\n").map((s) => s.trim()).filter(Boolean);
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

document.addEventListener('DOMContentLoaded', function () {
  const categoryLinks = document.querySelectorAll('.category-navigation a');
  const imageGrid = document.querySelector('.image-grid');

  fetchFirebaseConfigJson()
    .then(response => response.json())
    .then(async data => {
      const firebaseConfig = data.firebaseConfig;
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      // ---------- Gallery images ----------
      const fetchData = async () => {
        try {
          const dataRef = doc(db, 'cms', "galleryPage");
          const querySnapshot = await getDoc(dataRef);
          return querySnapshot.data();
        } catch (error) {
          console.error('Error fetching galleryPage data:', error);
          return null;
        }
      };

      const galleryData = await fetchData();
      const imageUrls = (galleryData && galleryData.gallery) || [];

      function loadImages(category) {
        imageGrid.innerHTML = '';

        const images = [];
        imageUrls.forEach((item) => {
          if (item && item[category]) images.push(item[category]);
        });

        // Flatten: images is an array of arrays (one per gallery entry that
        // has this category), so combine them into one list to render.
        const flatImages = images.flat();

        if (flatImages.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'gal-empty';
          empty.textContent = 'No photos in this category yet — check back soon.';
          imageGrid.appendChild(empty);
          return;
        }

        flatImages.forEach((img) => {
          if (!img || !img.link) return;

          const imgContainer = document.createElement('div');
          imgContainer.className = 'image-container';

          const imgElement = document.createElement('img');
          imgElement.src = img.link;
          imgElement.alt = img.name || 'Gallery photo';
          imgElement.loading = 'lazy';

          const overlay = document.createElement('div');
          overlay.className = 'overlay';
          overlay.textContent = img.name || '';

          imgContainer.appendChild(imgElement);
          imgContainer.appendChild(overlay);
          imageGrid.appendChild(imgContainer);
        });
      }

      categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          categoryLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          const category = link.getAttribute('data-category');
          if (category) loadImages(category);
        });
      });

      loadImages('all');

      // ---------- Footer / topbar contact (indexPage doc) ----------
      const fetchData2 = async () => {
        try {
          const dataRef = doc(db, 'cms', "indexPage");
          const querySnapshot = await getDoc(dataRef);
          return querySnapshot.data();
        } catch (error) {
          console.error('Error fetching indexPage data:', error);
          return null;
        }
      };

      const fetch2 = await fetchData2();
      if (fetch2) {
        // Fixed from the original, which wrongly set both email AND phone
        // to fetch2.missionText — a copy-paste error.
        renderContactLines("email-list", fetch2.emailfooter, "fas fa-envelope");
        renderContactLines("phone-list", fetch2.phonefooter, "fas fa-phone");
        renderContactLinesInline("email-top-list", fetch2.emailfooter, "fas fa-envelope");
        renderContactLinesInline("phone-top-list", fetch2.phonefooter, "fas fa-phone");

        const socialLinkIds = {
          facebookfooter: ["facebooktop", "facebookfooter"],
          linkedinfooter: ["linkedintop", "linkedinfooter"],
          instagramfooter: ["instagramtop", "instagramfooter"],
          twitterfooter: ["twittertop", "twitterfooter"],
        };
        Object.entries(socialLinkIds).forEach(([field, ids]) => {
          if (!fetch2[field]) return;
          ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.href = fetch2[field];
          });
        });

        const copyrightYearEl = document.getElementById("copyright-year");
        if (copyrightYearEl) copyrightYearEl.textContent = new Date().getFullYear();
      }
    })
    .catch(error => console.error('Error fetching Firebase config or page data:', error));
});
