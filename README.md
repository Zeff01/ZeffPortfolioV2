# Zeff Portfolio — Iron Man / JARVIS-themed Developer Portfolio

> A cinematic, Iron Man-inspired personal portfolio with a custom JARVIS HUD, motion-rich hero, and a case-study-driven projects showcase.

**👤 Jzeff Kendrew Somera** — AI Engineer · Fullstack & Blockchain Developer

🔗 **Live:** _add your deployed URL here_ · 💼 [LinkedIn](https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/) · 🐙 [GitHub](https://github.com/Zeff01)

<!-- 📸 Add a hero screenshot: drop an image at docs/screenshot.png and uncomment:
![Portfolio preview](docs/screenshot.png)
-->

---

## ✨ Why I built it

I wanted a portfolio that demonstrates my engineering *and* product sensibility — not just a list of links. Every interaction is hand-built: a JARVIS-style cursor reticle, a holographic hero HUD, decrypting text, and animated case-study modals. It's a playground for motion design, performance, and accessible interaction patterns, themed around Iron Man (my handle is "Jzironman").

## 🚀 Features

- **JARVIS hero HUD** — animated tech grid, holographic reactor rings, drifting particles, and targeting corner brackets
- **Global cursor reticle** — a custom cursor that springs after your mouse and "locks on" (grows + turns gold) over interactive elements
- **Cinematic hero** — choreographed intro, mouse-driven parallax depth, idle motion, and a "decrypting" name reveal
- **Case-study modals** — flagship projects open a structured *Challenge → Approach → Outcome* breakdown with metrics
- **Smart project cards** — DOM-measured truncation with read-more, `Private / NDA` badges for confidential work
- **Animated About, Projects & Contact** — scroll-reveal sections, glass UI, count-up stats, EmailJS contact form
- **Accessibility-first motion** — every animation respects `prefers-reduced-motion`
- **Performance-minded** — `next/image` with AVIF/WebP, optimized assets, lazy-loaded routes

## 🛠️ Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Email | EmailJS |
| Deploy | Vercel |

## 🧑‍💻 Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

> Requires **Node.js 24.x** (see `.nvmrc`). EmailJS needs `NEXT_PUBLIC_EMAILJS_*` env vars for the contact form.

## 📁 Structure

```
src/
├── app/            # App Router pages (home, about, projects, contact)
├── components/     # HeroHud, CursorReticle, ReadMore, Footer, Testimonials, …
├── data/           # projects, skills, experience data
└── hooks/          # AnimatedNumbers, useEmailJS, transitions
public/             # Iron Man assets + project imagery
```

## 📬 Contact

Open to freelance work and full-time roles.

- 📧 jzeffsomera@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/jzeff-kendrew-somera-88b66120a/)

---

<sub>Built with Next.js, React & Framer Motion.</sub>
