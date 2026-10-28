/* Gourish Kumawat — portfolio interactions
   Hero scroll scene (the head opens, then the inside fills the screen),
   section reveals, scroll ruler, index overlay, eyes that follow the
   pointer, and an optional ambient soundscape. No dependencies. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }

  if (!reduceMotion) root.classList.add("hero-anim");

  /* ---------- Stars ---------- */
  $$("[data-stars]").forEach(function (box) {
    var count = parseInt(box.getAttribute("data-stars"), 10) || 40;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var star = document.createElement("i");
      var size = Math.random() < 0.85 ? 1.5 + Math.random() * 1.5 : 3 + Math.random() * 2;
      star.className = "star";
      star.style.cssText =
        "left:" + (Math.random() * 100).toFixed(2) + "%;" +
        "top:" + (Math.random() * 100).toFixed(2) + "%;" +
        "width:" + size.toFixed(1) + "px;height:" + size.toFixed(1) + "px;" +
        "animation-delay:-" + (Math.random() * 6).toFixed(2) + "s;" +
        "animation-duration:" + (2.5 + Math.random() * 4).toFixed(2) + "s";
      frag.appendChild(star);
    }
    box.appendChild(frag);
  });

  /* ---------- Character clone that peeks up at Contact ---------- */
  var character = $("#character");
  var peek = $(".peek");
  if (character && peek) {
    var clone = character.cloneNode(true);
    clone.removeAttribute("id");
    clone.removeAttribute("role");
    clone.removeAttribute("aria-labelledby");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("focusable", "false");
    clone.setAttribute("viewBox", "40 60 720 640");
    $$("title, defs", clone).forEach(function (n) { n.remove(); });
    peek.appendChild(clone);
  }

  /* ---------- Split section titles into letters ---------- */
  $$("[data-split]").forEach(function (el) {
    var text = el.textContent.trim();
    var sr = document.createElement("span");
    var vis = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;
    vis.className = "split";
    vis.setAttribute("aria-hidden", "true");
    text.split("").forEach(function (c, i) {
      var ch = document.createElement("span");
      ch.className = "ch";
      ch.style.setProperty("--i", i);
      ch.textContent = c === " " ? " " : c;
      vis.appendChild(ch);
    });
    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(vis);
  });

  /* ---------- Marquee: duplicate the list once for a seamless loop ---------- */
  var track = $(".marquee__track");
  if (track) {
    $$("li", track).forEach(function (li) {
      var copy = li.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      track.appendChild(copy);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  $$(".reveal").forEach(function (el) {
    var siblings = $$(":scope > .reveal", el.parentElement);
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty("--d", Math.min(idx, 6) * 90 + "ms");
  });
  $$(".chips").forEach(function (list) {
    $$("li", list).forEach(function (li, i) { li.style.setProperty("--c", i); });
  });

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (!target || reduceMotion) return;
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / dur, 0, 1);
      el.textContent = Math.round(target * easeOut(t)).toLocaleString("en-IN");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealTargets = $$(".reveal, .sec-head, .skills__group");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        $$("[data-count]", entry.target).forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });

    // The peeking character sits clipped below its section, so watch the section instead.
    var contact = $("#contact");
    if (peek && contact) {
      new IntersectionObserver(function (entries) {
        peek.classList.toggle("is-in", entries[0].isIntersecting);
      }, { rootMargin: "0px 0px -30% 0px" }).observe($(".contact__list") || contact);
    }
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
    if (peek) peek.classList.add("is-in");
  }

  /* ---------- Index overlay ---------- */
  var navToggle = $("#nav-toggle");
  var menu = $("#menu");
  var menuLabel = $(".nav__menu-label");
  var menuTimer = null;

  function setMenu(open) {
    if (!navToggle || !menu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Close" : "Index";
    document.body.classList.toggle("menu-open", open);
    clearTimeout(menuTimer);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { menu.classList.add("is-open"); });
      });
    } else {
      menu.classList.remove("is-open");
      menuTimer = setTimeout(function () { menu.hidden = true; }, reduceMotion ? 0 : 650);
    }
  }
  if (navToggle && menu) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- Hero: lid lifts, thoughts float out, the inside fills the screen ---------- */
  var hero = $(".hero");
  var stage = $(".hero__stage");
  var figure = $(".hero__figure");
  var lid = $(".hero .character__lid");
  var brows = $$(".hero .character__brow");
  var opening = $(".hero .character__opening");
  var heroTitle = $(".hero__title");
  var tagline = $(".hero__tagline");
  var scrollHint = $(".hero__scroll");
  var birds = $(".birds");
  var portal = $(".portal");
  var thoughts = $$(".thought").map(function (el, i) {
    var m = (el.getAttribute("data-m") || "0,0").split(",");
    return {
      el: el, i: i,
      x: parseFloat(el.getAttribute("data-x")), y: parseFloat(el.getAttribute("data-y")),
      mx: parseFloat(m[0]), my: parseFloat(m[1])   // hand-placed px offsets for phones
    };
  });
  var openingRest = 0;   // opening's y within the stage when untransformed
  var lidLift = 0;       // shared with the pupils so the eyes glance up as the lid opens

  function measureHero() {
    if (!figure) return;
    figure.style.transform = "";
    var s = stage.getBoundingClientRect();
    var f = figure.getBoundingClientRect();
    openingRest = f.top - s.top + f.height * 0.32;
  }

  function renderHero(p) {
    if (!figure) return;
    var a = easeInOut(clamp(p / 0.26, 0, 1));         // lid lifts
    var b = clamp((p - 0.4) / 0.48, 0, 1);             // dive toward the opening
    var be = easeOut(b);
    var vh = stage.clientHeight;
    var vw = stage.clientWidth;
    lidLift = a;

    lid.style.transform = "translate(" + (-40 * a).toFixed(2) + "px," + (-175 * a).toFixed(2) + "px) rotate(" + (-26 * a).toFixed(2) + "deg)";
    brows.forEach(function (br) { br.style.transform = "translateY(" + (-9 * a).toFixed(2) + "px)"; });

    var shiftY = (vh * 0.5 - openingRest) * be;
    figure.style.transform = "translate(-50%," + shiftY.toFixed(1) + "px) scale(" + (1 + 7 * b * b).toFixed(4) + ")";

    // Thoughts fan out in an arc above the head; phones use hand-placed positions.
    var unit = figure.clientWidth * 0.22;
    var narrow = vw < 600;
    var phoneScale = Math.min(vw / 390, 1.3);
    var fly = 1 + b * 2.6;
    var fade = 1 - clamp(b * 2, 0, 1);
    thoughts.forEach(function (t) {
      var k = easeOut(clamp((p - 0.06 - t.i * 0.02) / 0.2, 0, 1));
      var x = (narrow ? t.mx * phoneScale : t.x * unit) * k * fly;
      var y = (narrow ? t.my * phoneScale : t.y * unit) * k * fly + (1 - k) * 24;
      var rot = (t.i % 2 ? -5 : 5) * k;
      t.el.style.opacity = (k * fade).toFixed(3);
      t.el.style.transform = "translate(-50%,-50%) translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + rot.toFixed(1) + "deg) scale(" + (0.4 + 0.6 * k).toFixed(3) + ")";
    });

    // The name lifts away first, making room for the thoughts.
    var t0 = clamp(p / 0.17, 0, 1);
    heroTitle.style.opacity = (1 - t0).toFixed(3);
    heroTitle.style.transform = "translateY(" + (-easeOut(t0) * 70).toFixed(1) + "px)";
    tagline.style.opacity = (1 - clamp(p / 0.12, 0, 1)).toFixed(3);
    if (scrollHint) scrollHint.style.opacity = (1 - clamp(p / 0.08, 0, 1)).toFixed(3);
    if (birds) birds.style.opacity = (1 - clamp(b * 2.5, 0, 1)).toFixed(3);

    // The portal starts exactly over the (same-coloured) opening and grows past the corners.
    var g = clamp((p - 0.8) / 0.2, 0, 1);   // finishes at the end of the hero, so there's no empty pause
    if (g <= 0) {
      portal.style.clipPath = "ellipse(0px 0px at 50% 50%)";
    } else {
      var r = opening.getBoundingClientRect();
      var sr = stage.getBoundingClientRect();
      var cx = r.left - sr.left + r.width / 2;
      var cy = r.top - sr.top + r.height / 2;
      var max = Math.hypot(vw, vh) * 1.15;
      var ge = easeIn(g);
      var rx = r.width / 2 + (max - r.width / 2) * ge;
      var ry = r.height / 2 + (max - r.height / 2) * ge;
      portal.style.clipPath = "ellipse(" + rx.toFixed(1) + "px " + ry.toFixed(1) + "px at " + cx.toFixed(1) + "px " + cy.toFixed(1) + "px)";
    }
    applyPupils();
  }

  var heroCurrent = 0;
  var heroRaf = null;
  function heroTarget() {
    var total = hero.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-hero.getBoundingClientRect().top / total, 0, 1);
  }
  function heroTick() {
    var target = heroTarget();
    heroCurrent += (target - heroCurrent) * 0.16;
    if (Math.abs(target - heroCurrent) < 0.0005) heroCurrent = target;
    renderHero(heroCurrent);
    heroRaf = heroCurrent !== target ? requestAnimationFrame(heroTick) : null;
  }
  function requestHero() { if (!heroRaf) heroRaf = requestAnimationFrame(heroTick); }

  /* ---------- Eyes follow the pointer ---------- */
  var pupilGroups = $$(".character__pupils");
  var look = { x: 0, y: 0 };
  function applyPupils() {
    pupilGroups.forEach(function (g, i) {
      var lift = i === 0 ? lidLift * 9 : 0;   // the hero's character glances up at its open lid
      g.style.transform = "translate(" + look.x.toFixed(2) + "px," + (look.y - lift).toFixed(2) + "px)";
    });
  }
  if (finePointer && !reduceMotion && pupilGroups.length) {
    window.addEventListener("pointermove", function (e) {
      var eye = pupilGroups[0].getBoundingClientRect();
      if (pupilGroups[1]) {
        var peekEye = pupilGroups[1].getBoundingClientRect();
        if (peekEye.top < window.innerHeight && peekEye.bottom > 0) eye = peekEye;
      }
      var dx = e.clientX - (eye.left + eye.width / 2);
      var dy = e.clientY - (eye.top + eye.height / 2);
      var d = Math.hypot(dx, dy) || 1;
      var m = Math.min(1, d / 400) * 9;
      look.x = (dx / d) * m;
      look.y = (dy / d) * m;
      applyPupils();
    }, { passive: true });
  }

  /* ---------- Selection box: live dimensions of the name ---------- */
  var nameEl = $(".hero__name");
  var selectBox = $(".select-box");
  var sizeLabel = $("#select-size");
  function writeSize(el) {
    var r = el.getBoundingClientRect();
    sizeLabel.textContent = Math.round(r.width) + " × " + Math.round(r.height);
  }
  function animateSize() {
    var start = performance.now();
    (function frame(now) {
      if (now - start < 1700) {
        writeSize(selectBox);
        requestAnimationFrame(frame);
      } else {
        writeSize(nameEl);
      }
    })(start);
  }

  /* ---------- Scroll ruler ---------- */
  var ruler = $(".ruler");
  var rulerHead = $(".ruler__head");
  var rulerLinks = $$(".ruler__labels a");
  var rulerStops = [];
  function measureRuler() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    rulerStops = rulerLinks.map(function (a) {
      var target = document.getElementById(a.getAttribute("data-target"));
      var y = target ? target.getBoundingClientRect().top + window.scrollY : 0;
      a.style.left = (clamp(y / max, 0, 1) * 100).toFixed(2) + "%";
      return { a: a, y: y };
    });
  }
  function renderRuler() {
    if (!ruler) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var f = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    var width = ruler.clientWidth - 2 * parseFloat(getComputedStyle(rulerHead).left);
    rulerHead.style.setProperty("--x", (f * width).toFixed(1) + "px");
    var active = null;
    rulerStops.forEach(function (s) { if (window.scrollY + window.innerHeight * 0.4 >= s.y) active = s.a; });
    rulerLinks.forEach(function (a) { a.classList.toggle("is-active", a === active); });
  }

  /* ---------- Nav background once past the hero; active link ---------- */
  var nav = $("#site-nav");
  var primaryLinks = $$(".nav__primary a");
  function renderNav() {
    var past = window.scrollY > hero.offsetHeight - window.innerHeight * 0.6;
    nav.classList.toggle("is-solid", past);
    var current = null;
    ["work", "about", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4) current = "#" + id;
    });
    primaryLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === current); });
  }

  /* ---------- Gentle tilt on the product screenshot ---------- */
  var tilts = $$("[data-tilt]");
  function renderTilts() {
    if (reduceMotion) return;
    tilts.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var t = clamp((window.innerHeight - r.top) / (window.innerHeight * 0.9), 0, 1);
      el.style.setProperty("--tilt", ((1 - easeOut(t)) * 14).toFixed(2) + "deg");
      el.style.setProperty("--lift", ((1 - easeOut(t)) * 40).toFixed(1) + "px");
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".btn, .contact__arrow").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      });
      btn.addEventListener("pointerleave", function () { btn.style.translate = ""; });
    });
  }

  /* ---------- Ambient sound (off by default; synthesised, no audio files) ---------- */
  var soundBtn = $("#sound-toggle");
  var soundState = $(".sound__state");
  var audio = null;
  var soundOn = false;
  var sparkleTimer = null;

  function buildAudio() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    var ctx = new Ctx();
    var master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    filter.Q.value = 0.6;
    filter.connect(master);
    // A soft, slowly breathing chord: A, E, A, C♯
    [110, 164.81, 220, 277.18].forEach(function (f, i) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 5;
      g.gain.value = [0.5, 0.2, 0.16, 0.07][i];
      o.connect(g);
      g.connect(filter);
      o.start();
    });
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 280;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    return { ctx: ctx, master: master };
  }

  function chime(freq, vol, len) {
    if (!audio || !soundOn) return;
    var ctx = audio.ctx;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    var now = ctx.currentTime;
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + len);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + len + 0.05);
  }
  var pentatonic = [880, 987.77, 1108.73, 1318.51, 1479.98, 1760];
  function sparkle() {
    chime(pentatonic[Math.floor(Math.random() * pentatonic.length)], 0.025, 2.2);
    sparkleTimer = setTimeout(sparkle, 2600 + Math.random() * 3200);
  }

  function setSound(on) {
    soundOn = on;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundState.textContent = on ? "on" : "off";
    if (on) {
      if (!audio) audio = buildAudio();
      if (!audio) return;
      audio.ctx.resume();
      audio.master.gain.cancelScheduledValues(audio.ctx.currentTime);
      audio.master.gain.setTargetAtTime(0.06, audio.ctx.currentTime, 0.9);
      clearTimeout(sparkleTimer);
      sparkleTimer = setTimeout(sparkle, 1200);
    } else if (audio) {
      clearTimeout(sparkleTimer);
      audio.master.gain.cancelScheduledValues(audio.ctx.currentTime);
      audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.25);
    }
  }
  if (soundBtn) {
    soundBtn.addEventListener("click", function () { setSound(!soundOn); });
    $$(".nav a, .btn, .menu a, .contact__row, .chips li").forEach(function (el) {
      el.addEventListener("pointerenter", function () { chime(1318.51 + Math.random() * 300, 0.018, 0.25); });
    });
  }

  /* ---------- Wire up ---------- */
  function onScroll() {
    if (!reduceMotion) requestHero();
    renderRuler();
    renderNav();
    renderTilts();
  }
  function onResize() {
    measureHero();
    measureRuler();
    if (!reduceMotion) {
      heroCurrent = heroTarget();
      renderHero(heroCurrent);
    }
    onScroll();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  measureHero();
  if (reduceMotion) {
    // A still frame: name in place, lid just ajar.
    renderHero(0);
    lid.style.transform = "translate(-12px,-52px) rotate(-8deg)";
  } else {
    heroCurrent = heroTarget();
    renderHero(heroCurrent);
  }
  measureRuler();
  onScroll();

  function start() {
    if (root.classList.contains("is-loaded")) return;
    root.classList.add("is-loaded");
    if (nameEl) {
      if (reduceMotion) writeSize(nameEl);
      else setTimeout(animateSize, 750);
    }
    measureRuler();
    renderRuler();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(start); });
  }
  setTimeout(start, 1500);
  window.addEventListener("load", function () { measureRuler(); renderRuler(); });

  if (nameEl && "ResizeObserver" in window) {
    new ResizeObserver(function () {
      if (root.classList.contains("is-loaded")) writeSize(nameEl);
    }).observe(nameEl);
  }
})();
