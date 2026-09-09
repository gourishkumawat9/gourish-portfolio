# Gourish Kumawat — Portfolio

Personal portfolio and résumé website, built with plain HTML, CSS and vanilla JavaScript.

Live structure: one continuous page — Hero, About, Education, Experience, Work (featuring VittamHub), Achievements, Skills, Interests, Contact.

## Structure

```
gourish-portfolio/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/
│   │   └── profile.jpg        ← replace with your photo (see below)
│   └── documents/
│       └── Gourish_Kumawat_Resume.pdf   ← add your résumé here
└── README.md
```

## Replacing the profile photo

Drop a photo at `assets/images/profile.jpg` (portrait orientation works best — the frame crops to a 4:5 ratio). If the file is missing, the hero shows a clearly marked placeholder instead of breaking.

## Adding the résumé

Save your résumé PDF as `assets/documents/Gourish_Kumawat_Resume.pdf`. The "Résumé" buttons in the nav, hero and contact section all point to this exact path.

## Running locally

No build step — open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## CSS concepts demonstrated

Element/class/ID selectors, custom properties (design tokens), Flexbox and CSS Grid layouts, `position: sticky` and `position: fixed`, responsive media queries (mobile / tablet / desktop), hover and focus-visible states, transitions, `object-fit` image cropping, and a semantic, accessible document structure.
