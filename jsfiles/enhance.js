// enhance.js — presentational behavior only.
// Does not read/write Firestore; safe to load alongside the existing script.js / footer.js.
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("is-active");
      navMenu.classList.toggle("is-open");
      document.body.classList.toggle("no-scroll");
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.classList.remove("is-active");
        navMenu.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  /* ---------- Sticky nav shrink + shadow on scroll ---------- */
  var navbar = document.getElementById("navbar");
  if (navbar) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        navbar.classList.add("is-scrolled");
      } else {
        navbar.classList.remove("is-scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mirror dynamic contact info + socials into the top utility bar ---------- */
  function mirrorText(sourceId, targetId) {
    var source = document.getElementById(sourceId);
    var target = document.getElementById(targetId);
    if (!source || !target) return;
    var sync = function () { target.textContent = source.textContent; };
    sync();
    new MutationObserver(sync).observe(source, { childList: true, characterData: true, subtree: true });
  }
  mirrorText("email", "email-top");
  mirrorText("phone", "phone-top");

  function mirrorHref(sourceId, targetId) {
    var source = document.getElementById(sourceId);
    var target = document.getElementById(targetId);
    if (!source || !target) return;
    var sync = function () {
      var href = source.getAttribute("href");
      if (href) target.setAttribute("href", href);
    };
    sync();
    new MutationObserver(sync).observe(source, { attributes: true, attributeFilter: ["href"] });
  }
  mirrorHref("linkedinfooter", "linkedintop");
  mirrorHref("twitterfooter", "twittertop");
  mirrorHref("instagramfooter", "instagramtop");
  mirrorHref("facebookfooter", "facebooktop");

  /* ---------- Modal close (click outside / close button / Escape) ---------- */
  var modal = document.getElementById("myModal");
  var closeBtn = document.getElementById("closeModalBtn");
  function closeModal() {
    if (modal) modal.style.display = "none";
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
  window.closeModal = closeModal; // kept global in case script.js calls it

  /* ---------- Staff marquee: smooth, paused off-screen / on hover / reduced motion ---------- */
  var staffContainer = document.querySelector(".staff-cards-container");
  if (staffContainer && !prefersReducedMotion) {
    var isPaused = false;
    var rafId = null;
    var speed = 0.6; // px per frame, gentle

    var step = function () {
      if (!isPaused) {
        staffContainer.scrollLeft += speed;
        if (staffContainer.scrollLeft >= staffContainer.scrollWidth - staffContainer.clientWidth - 1) {
          staffContainer.scrollLeft = 0;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    var startLoop = function () {
      if (rafId === null) rafId = requestAnimationFrame(step);
    };
    var stopLoop = function () {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    staffContainer.addEventListener("mouseenter", function () { isPaused = true; });
    staffContainer.addEventListener("mouseleave", function () { isPaused = false; });
    staffContainer.addEventListener("touchstart", function () { isPaused = true; }, { passive: true });
    staffContainer.addEventListener("touchend", function () { isPaused = false; }, { passive: true });

    // Only animate while the section is actually visible on screen.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) startLoop(); else stopLoop();
        });
      }, { threshold: 0.05 });
      io.observe(staffContainer);
    } else {
      startLoop();
    }
  }

  /* ---------- News carousel prev/next buttons ---------- */
  var blogContainer = document.querySelector(".blog-card-container");
  var nextBtn = document.getElementById("nextButton");
  var prevBtn = document.getElementById("prevButton");
  function scrollBlogBy(amount) {
    if (!blogContainer) return;
    blogContainer.scrollBy({ left: amount, behavior: "smooth" });
  }
  if (nextBtn) nextBtn.addEventListener("click", function () { scrollBlogBy(340); });
  if (prevBtn) prevBtn.addEventListener("click", function () { scrollBlogBy(-340); });

  /* ---------- Reveal-on-scroll for section headings/cards ---------- */
  var revealTargets = document.querySelectorAll(
    ".value, .hex, .vm, .s2-right, .s3-right, .s2-img, .footer-col"
  );
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 500);
    }, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
})();
