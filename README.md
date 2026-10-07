# Vishwa Dayarathne Portfolio

A software engineering portfolio built with Next.js, Tailwind CSS, Framer Motion, and a scroll-driven canvas image sequence.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** with reusable typography, color, spacing, surface, and interaction tokens
- **Framer Motion** for restrained section reveals, mobile navigation, and scroll progress
- **Lenis** for demand-driven desktop wheel and anchor scrolling; native scrolling on touch devices
- **Canvas 2D** for the full-page background sequence, synchronized with document scroll
- **lucide-react** + **react-icons** for iconography
- Self-hosted variable **Inter** for all typography, with no font network requests at build time

## Project structure

```
src/
  app/            # routes, layout, metadata, dynamic favicon/OG image
  components/
    layout/       # Navbar, Footer, ScrollProgress, CustomCursor
    providers/    # Motion preferences and desktop smooth scrolling
    sections/     # Hero, About, Experience, Projects, Skills, Education, Contact
    ui/           # Reveal animations, SectionHeading, Button
    backgrounds/  # Scroll-driven canvas background
  data/
    profile.ts    # ALL content (name, experience, projects, skills, etc.) lives here
```

To update any content on the site (roles, bullet points, links, skills, etc.), edit **`src/data/profile.ts`** nothing else needs to change.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Before you go live two small to-dos

1. **Resume file**: the "Resume" button in the Hero section links to `/Vishwa_Dayarathne_CV.pdf`. Drop your actual CV PDF into the `public/` folder with that exact filename (or change `resumeUrl` in `src/data/profile.ts`).
2. **Project links**: the four project cards currently use placeholder (`#`) links for GitHub/live demos, since the CV didn't list URLs. Fill in the real ones in `src/data/profile.ts` (`projects[].links`).

Also worth a look:
- `profile.linkedin` in `src/data/profile.ts` is set to a best-guess LinkedIn URL slug double-check it matches your real profile.
- `siteUrl` in `src/app/layout.tsx` is a placeholder domain used only for SEO/Open Graph tags update it once you have a real domain (or your Vercel URL).

## Deployment (easiest: Vercel)

This project needs **zero configuration** to deploy on Vercel it's the same company that builds Next.js.

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Leave all settings as default (Vercel auto-detects Next.js) and click **Deploy**.
4. You'll get a live URL (`your-project.vercel.app`) in about a minute. Add a custom domain later from the project's Vercel dashboard if you want one.

Every subsequent `git push` to the main branch auto-deploys.

### Alternative: Netlify

Works the same way import the GitHub repo at [app.netlify.com](https://app.netlify.com), Netlify's Next.js runtime auto-detects everything, no build settings needed.

## Background sequence

The background uses the 300 ordered JPG frames in `public/images/Background/`, drawn to a fixed canvas behind the portfolio. The frame follows progress through the document and reverses when scrolling upward. Portfolio content remains in the normal document flow.

The UI uses warm white, dark ink, and one muted teal accent. An open typographic hero leaves the background portrait visible; local foreground surfaces protect reading as the frames become busier. Projects use numbered editorial rows, experience uses a date/content timeline, and skills use filterable category lists. The original sequence frames and scroll implementation remain unchanged. See [the foreground design and audit notes](docs/ui-redesign.md) for the complete design system and validation approach.

The server discovers regular `.jpg` / `.jpeg` files and sorts filenames numerically. Adding or removing frames requires rebuilding the site. The first JPG is preloaded and also serves as the canvas background before the first draw. Four concurrent requests load compressed frames, prioritizing the current frame and its neighbors; two concurrent decoders maintain a working set capped at 48 MiB of decoded pixels. A missing frame uses the nearest decoded frame. The canvas preserves aspect ratio with centered cover sizing, limits DPR to 2 and its backing surface to 2.5 million pixels, and draws only when needed. Reduced-motion users see a static first frame, without sequence prefetching. Preference changes take effect without a reload.

Shared motion timing lives in `src/lib/motion.ts`: 160–280 ms interactions, 420–820 ms reveal presets, 8–30 px travel, and 45–75 ms stagger. The one-time opening sequence starts after fonts and first paint are ready; section headings, supporting copy, cards, project rows, lists, and filter results then use coordinated viewport reveals. A reusable Framer Motion handoff layer gradually transfers emphasis between the hero, major sections, experience rows, projects, contact, and footer without changing the background scroll mapper. Mobile removes the linked handoff transforms and reduces reveal travel and stagger. Server-rendered content remains visible without JavaScript, while reduced motion exposes content immediately and disables reveals and smooth scrolling. Navigation includes active-section indicators, a skip link, visible focus rings, and a mobile dialog with focus containment and Escape dismissal. The restored difference-blend custom cursor uses spring-driven transforms, responds subtly to navigation, buttons, links, and project rows, and disables itself for touch, keyboard interaction, and reduced motion.

Verification (Node.js 24 for the native TypeScript test runner):

```bash
node --test tests/*.test.mjs
npm run lint
npx tsc --noEmit
npm run build
npm run start -- --port 3001
# In a second terminal, with Google Chrome installed:
node scripts/verify-background.mjs http://localhost:3001
node scripts/verify-background.mjs http://localhost:3001 --appearance-only
```

Set `BACKGROUND_TEST_BROWSER` to another Chromium executable if needed. Browser verification checks scroll direction/endpoints, keyboard/wheel/touch scrolling, responsive cover sizing, navigation, reduced motion, loading failures, delayed frames, and idle decode/animation behavior. The appearance suite checks six viewport sizes from 320 to 1920 pixels, content preservation, contrast, keyboard focus, mobile dialog behavior, skill filters, browser history, contact typing, and content visibility without JavaScript. Its screenshots and results are written to `.background-verification/` (ignored by Git).
