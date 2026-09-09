/* Gourish Kumawat — portfolio interactions
   Mobile nav toggle, active-section highlighting, smooth-scroll fallback. */

(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("site-nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Highlight the current section in both nav rails as the user scrolls.
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section, .hero"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".index-list a"));

  function setActive(id) {
    navAnchors.forEach(function (a) {
      var match = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", match);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      if (section.id) observer.observe(section);
    });
  }

  // Current year is not shown, but keep footer text easy to extend later.
})();
