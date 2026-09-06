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

fetchFirebaseConfigJson()
  .then(response => response.json())
  .then(async data => {
    const firebaseConfig = data.firebaseConfig;
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const dataRef = doc(db, 'cms', "basicsPage");
        const querySnapshot = await getDoc(dataRef);
        return querySnapshot.data();
      } catch (error) {
        console.error('Error fetching basicsPage data:', error);
        return null;
      }
    };

    const fetch = await fetchData();
    if (!fetch) {
      console.error('No basicsPage data available — page will show default placeholder text only.');
      return;
    }

    const titleElement = document.getElementById("herotitle");
    if (titleElement && fetch.heroTitle) {
      titleElement.innerHTML = fetch.heroTitle.replace(/\n/g, '<br/>');
    }

    const textElement = document.getElementById("herosub");
    if (textElement) {
      textElement.innerHTML = (fetch.heroSubtitle || "").replace(/\n/g, '<br/>');
    }

    const detailsTextElement = document.getElementById("detailsText");
    if (detailsTextElement) {
      detailsTextElement.innerHTML = (fetch.detailsText || "").replace(/\n/g, '<br/>');
    }

    const notables = fetch.notables || [];
    const activitiesContainer = document.getElementById("activities-container");
    if (activitiesContainer) {
      notables.forEach((notable) => {
        const li = document.createElement("li");
        li.textContent = notable;
        activitiesContainer.appendChild(li);
      });
    }

    // ---------- Footer / topbar contact (indexPage doc) — was hardcoded
    // static text before, now dynamic like every other page. ----------
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
