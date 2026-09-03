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

    // ---------- School Administration (4 fixed profiles, aboutPage doc) ----------
    const administrators = fetch.administrators || [];
    const adminsContainer = document.getElementById("admins-container");
    if (adminsContainer) {
      administrators.forEach((admin) => {
        if (!admin || (!admin.adminName && !admin.adminPicture)) return;

        const card = document.createElement("div");
        card.className = "staff-card";

        const img = document.createElement("img");
        img.src = admin.adminPicture || "";
        img.alt = admin.adminName || "";

        const h3 = document.createElement("h3");
        h3.textContent = admin.adminName || "";

        const pRole = document.createElement("p");
        pRole.textContent = admin.adminRole ? `Role: ${admin.adminRole}` : "";

        card.appendChild(img);
        card.appendChild(h3);
        card.appendChild(pRole);

        adminsContainer.appendChild(card);
      });
    }

    // ---------- Staff ----------
    const teachers = fetch2.teachers;
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

    // ---------- Hero ----------
    const titleElement = document.getElementById("aboutTitle");
    titleElement.innerHTML = `${(fetch.aboutTitle || "").replace(/\n/g, '<br/>')}`;
    titleElement.style.whiteSpace = 'pre-line';

    const subtextElement = document.getElementById("aboutSubtitle");
    subtextElement.innerHTML = `${(fetch.aboutSubtitle || "").replace(/\n/g, '<br/>')}`;
    subtextElement.style.whiteSpace = 'pre-line';

    // Renders a director/admin bio truncated to a consistent length, with a
    // "Read more" toggle if the full text is longer — keeps all three bio
    // blocks visually the same height regardless of how much text is in the CMS.
    const BIO_CHAR_LIMIT = 130;
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

    // ---------- Director spotlights ----------
    // School Director
    const dir1TitleElement = document.getElementById("dirName1");
    dir1TitleElement.innerHTML = `${(fetch.directbasicTitle || "").replace(/\n/g, '<br/>')}`;
    dir1TitleElement.style.whiteSpace = 'pre-line';

    // Director (Nursery / Primary)
    const dir2TitleElement = document.getElementById("dirName2");
    dir2TitleElement.innerHTML = `${(fetch.directprebasicTitle || "").replace(/\n/g, '<br/>')}`;
    dir2TitleElement.style.whiteSpace = 'pre-line';

    // College Director
    const dir3TitleElement = document.getElementById("dirName3");
    dir3TitleElement.innerHTML = `${(fetch.directcollegeTitle || "").replace(/\n/g, '<br/>')}`;
    dir3TitleElement.style.whiteSpace = 'pre-line';

    // Director bio text (correct field mapping, confirmed against the CMS form)
    // Truncated to a consistent length with a Read more/less toggle.
    renderBio("dirText1", fetch.directprebasicText); // School Director
    renderBio("dirText2", fetch.directprebasicAbout); // Director (Nursery/Primary)
    renderBio("dirText3", fetch.directcollegeText); // College Director

    // ---------- Mission / Vision (shared with homepage, stored on indexPage) ----------
    const vissiontextElement = document.getElementById("visionText");
    vissiontextElement.innerHTML = `${(fetch2.visionText || "").replace(/\n/g, '<br/>')}`;
    vissiontextElement.style.whiteSpace = 'pre-line';

    const missionTextElement = document.getElementById("missionText");
    missionTextElement.innerHTML = `${(fetch2.missionText || "").replace(/\n/g, '<br/>')}`;
    missionTextElement.style.whiteSpace = 'pre-line';

    // ---------- Topbar (matches index.html's header exactly) ----------
    // Renders one icon per phone/email number, laid out inline so multiple
    // numbers/emails sit on one row but are still visually separated.
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

    renderContactLinesInline("email-top-list", fetch2.emailfooter, "fas fa-envelope");
    renderContactLinesInline("phone-top-list", fetch2.phonefooter, "fas fa-phone");

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

    // Renders one <p><i>icon</i> value</p> per line, so multiple phone
    // numbers or emails each get their own icon instead of sharing a
    // single icon at the top (which made two numbers look like one run-on line).
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

    // ---------- Footer (same fields/IDs as script.js on the homepage) ----------
    renderContactLines("email-list", fetch2.emailfooter, "fas fa-envelope");
    renderContactLines("phone-list", fetch2.phonefooter, "fas fa-phone");

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
    // img1 = School Director (basicphoto), img2 = Director (prebasicphoto), img3 = College Director (collegephoto)
    const image1 = fetch.basicphoto;
    const image2 = fetch.prebasicphoto;
    const image3 = fetch.collegephoto;

    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");

    if (image1) img1.src = image1;
    if (image2) img2.src = image2;
    if (image3) img3.src = image3;
  })
  .catch(error => console.error('Error fetching Firebase config or page data:', error));
