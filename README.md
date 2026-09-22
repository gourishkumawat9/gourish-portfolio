# Gourish Kumawat — Portfolio

Personal portfolio and résumé website, built with plain HTML, CSS and vanilla JavaScript. No build step, no dependencies.

One continuous page: Hero → About → Education → Experience → Work (VittamHub + RUHS research + DEV Herbal) → Achievements → Skills → Interests → Contact.

## Structure

```
gourish-portfolio/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/
│   │   ├── profile.jpg
│   │   └── vittamhub/hero.png
│   └── documents/
│       └── Gourish_Kumawat_Resume.pdf   ← linked from nav, hero and contact
└── README.md
```

## Keeping it current

**Résumé.** Three links point at `assets/documents/Gourish_Kumawat_Resume.pdf` — the nav button, the hero CTA and the contact card. Replace that one file to update all three. Keep the filename exactly as-is.

**Profile photo.** `assets/images/profile.jpg`, portrait orientation (the frame crops to 4:5). If the file is missing the hero falls back to a marked placeholder rather than breaking.

**Deployment URL.** `index.html` sets `<link rel="canonical">` and the Open Graph tags to `https://gourishkumawat9.github.io/gourish-portfolio/`. If the site is deployed anywhere else, update those three URLs — otherwise link previews will point at the wrong place.

## Running locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly also works, though the résumé download behaves better over HTTP.

## Design system

A "dossier" system defined entirely in custom properties at the top of `style.css`:

- **Surfaces** — warm paper (`--paper`) with a single inverted section (`--paper-dark`) for Work.
- **Accent** — one rust, used sparingly for index numerals and marks. Note there are two tokens: `--rust` for light surfaces and `--rust-on-dark`, a lightened step used on the dark section. The base rust only reaches 3.2:1 against `--paper-dark`, which fails WCAG AA; the lightened one reaches 4.81:1.
- **Type** — Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (labels and numerals).
- **Rules, not shadows** — hairline borders carry all separation.

Layout uses Flexbox and CSS Grid, `position: sticky` for the nav and `position: fixed` for the desktop index rail. `IntersectionObserver` drives active-section highlighting; `prefers-reduced-motion` is respected.

## Accessibility

Audited with axe-core (WCAG 2.1 A/AA + best practice) at 1440px, 820px and 390px: **0 violations**. Notable choices:

- The fixed index rail duplicates the primary nav, so it is `aria-hidden` **and** its links carry `tabindex="-1"` — otherwise keyboard users could tab into links screen readers do not announce.
- Inline links are underlined with real `text-decoration`, not a box-shadow, so they are distinguishable without relying on colour.
- Skip link, visible `:focus-visible` rings, and semantic landmarks throughout.
