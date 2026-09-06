// Shared site header and footer, defined once here and reused via
// <site-header></site-header> / <site-footer></site-footer> tags on every
// page. Edit the markup below and it updates on every page that includes
// this file — no need to hand-edit each HTML file individually.
//
// IMPORTANT — script load order:
// This file must be the FIRST <script type="module"> tag on the page (before
// script.js/about.js/prebasic.js/college.js, and before footer.js/enhance.js,
// which must also have the `defer` attribute). Those other scripts look up
// elements like #nav-toggle, #email-list, #copyright-year etc. by ID — those
// IDs only exist once this file has rendered the header/footer, so it has to
// run first. See the load-order comment in each page's <head>/<body> for the
// exact required tag order.

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <!-- ============ TOP UTILITY BAR ============ -->
      <div class="topbar">
          <div class="container topbar__container">
              <div class="topbar__contact">
                  <span id="email-top-list"></span>
                  <span id="phone-top-list"></span>
              </div>
              <div class="topbar__social">
                  <a href="#" id="linkedintop" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                  <a href="#" id="twittertop" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                  <a href="#" id="instagramtop" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                  <a href="#" id="facebooktop" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              </div>
          </div>
      </div>

      <!-- ============ MAIN NAV ============ -->
      <nav class="navbar" id="navbar">
          <div class="container nav__container">
              <a href="index.html" class="school-name">
                  <img src="assets/logo.png" alt="CrestHive logo" class="brand-logo" width="42" height="42">
                  <h4>Crest<span class="brand-accent">Hive</span></h4>
              </a>

              <ul class="nav__menu">
                  <li class="school-dropdown">
                      <a href="#school">School <i class="fas fa-caret-down"></i></a>
                      <ul class="school-submenu">
                          <li><a href="pre-basic.html">Crest Nursery and Primary School</a></li>
                          <li><a href="college-extra.html">Cresthive International School</a></li>
                      </ul>
                  </li>
                  <li class="school-dropdown">
                      <a href="#school">Admission <i class="fas fa-caret-down"></i></a>
                      <ul class="school-submenu">
                          <li><a href="admission-process.html">Admission process</a></li>
                          <li><a href="holidays.html">Holidays</a></li>
                                <li><a href="check-status.html">Check Application Status</a></li>
                      </ul>
                  </li>
                  <li><a href="about.html">About Us</a></li>
              </ul>

              <div class="nav__cta">
                  <a href="/login.html"><button class="navbtn navbtn--ghost">Log In</button></a>
                  <a href="admission-process.html"><button class="navbtn navbtn--solid">Apply Now</button></a>
              </div>

              <div class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
                  <span></span>
                  <span></span>
                  <span></span>
              </div>
          </div>
      </nav>

      <!-- ============ MOBILE NAV ============ -->
      <nav class="nav-menu" id="nav-menu">
          <nav class="navi">
              <div class="container nav__container">
                  <a href="index.html" class="school-name">
                      <img src="assets/logo.png" alt="CrestHive logo" class="brand-logo" width="36" height="36">
                      <h4>Crest<span class="brand-accent">Hive</span></h4>
                  </a>
                  <ul class="nav__menu">
                      <li class="school-dropdown">
                          <a href="#school">School <i class="fas fa-caret-down"></i></a>
                          <ul class="school-submenu">
                              <li><a href="pre-basic.html">Crest Nursery and Primary School</a></li>
                              <li><a href="college-extra.html">Cresthive International School</a></li>
                          </ul>
                      </li>
                      <li class="school-dropdown">
                          <a href="#school">Admission <i class="fas fa-caret-down"></i></a>
                          <ul class="school-submenu">
                              <li><a href="admission-process.html">Admission process</a></li>
                                  <li><a href="holidays.html">Holidays</a></li>
                                        <li><a href="check-status.html">Check Application Status</a></li>
                          </ul>
                      </li>
                      <li><a href="about.html">About Us</a></li>
                  </ul>

                  <a href="/login.html"><button class="navbtn2">Log In</button></a>
                  <a href="admission-process.html"><button class="navbtn">Apply Now</button></a>
              </div>
          </nav>
      </nav>
    `;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <!-- ============ FOOTER ============ -->
      <footer class="footer">
          <div class="footer-content">
              <h2 class="footer-header">CrestHive surpasses just a school,<br><span class="footer-header-fasthand">we are family.</span></h2>
              <p class="footer-text">We imbibe knowledge without compromising the Deen.</p>
              <a href="/about.html"><button class="footer-button">Learn More</button></a>
          </div>

          <div class="footer-content2">
              <div class="footer-columns">
                  <div class="footer-col">
                      <h3>Quick Links</h3>
                      <ul>
                          <li><a href="about.html">About Us</a></li>
                          <li><a href="admission-process.html">Admissions</a></li>
                          <li><a href="gallery.html">Gallery</a></li>
                          <li><a href="holidays.html">Holidays</a></li>
                      </ul>
                  </div>

                  <div class="footer-col">
                      <h3>Our Schools</h3>
                      <ul>
                          <li><a href="pre-basic.html">Crest Nursery &amp; Primary</a></li>
                          <li><a href="college-extra.html">Cresthive International</a></li>
                      </ul>
                  </div>

                  <div class="footer-col contact-info">
                      <h3>Contact Us</h3>
                      <div id="email-list"></div>
                      <div id="phone-list"></div>
                      <div class="social-icons">
                          <a href="#" id="linkedinfooter" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                          <a href="#" id="twitterfooter" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                          <a href="#" id="instagramfooter" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                          <a href="#" id="facebookfooter" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                      </div>
                  </div>
              </div>

              <div class="copyright">
                  <p>&copy; <span id="copyright-year"></span> Cresthive International School. All rights reserved.</p>
              </div>
          </div>
      </footer>

      <div class="floating-icon">
          <a href="gallery.html">
              <div class="icon-bg"><i class="fas fa-image"></i> Gallery</div>
          </a>
      </div>

      <button class="back-to-top" id="backToTop" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
