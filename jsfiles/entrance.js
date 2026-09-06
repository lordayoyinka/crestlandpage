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
        const dataRef = doc(db, 'cms', "admissionsPage");
        const querySnapshot = await getDoc(dataRef);
        return querySnapshot.data();
      } catch (error) {
        console.error('Error fetching admissionsPage data:', error);
        return null;
      }
    };

    const fetch = await fetchData();
    if (!fetch) {
      console.error('No admissionsPage data available — page will show default placeholder text only.');
      return;
    }

    const admission = fetch.admission || [];
    const bscs = (admission[2] && admission[2].entrancebasic) || [];
    const cols = (admission[3] && admission[3].entrancecollege) || [];

    const ulElement = document.getElementById("bscp_ul");
    if (ulElement) {
      bscs.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature;
        ulElement.appendChild(li);
      });
    }

    const ul2Element = document.getElementById("colp_ul");
    if (ul2Element) {
      cols.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature;
        ul2Element.appendChild(li);
      });
    }

    const enttitleElement = document.getElementById("entTitle");
    if (enttitleElement && fetch.entrancesystemTitle) {
      enttitleElement.innerHTML = fetch.entrancesystemTitle.replace(/\n/g, '<br/>');
    }

    const enttextElement = document.getElementById("entText");
    if (enttextElement) {
      enttextElement.innerHTML = (fetch.entrancesystemText || "").replace(/\n/g, '<br/>');
    }

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
