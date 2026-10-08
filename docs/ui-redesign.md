# Foreground redesign

## Audit and constraints

The working project uses Next.js App Router, React 19, TypeScript, Tailwind 4,
Framer Motion, Lenis, Lucide, and a locally hosted Inter variable font. Content
remains in `src/data/profile.ts`: About, three experience entries, four projects,
five skill groups, education, leadership, extracurricular activities, and contact.
There is no separate certification content in the supplied project.

The existing background remains untouched: 300 JPEG assets, server-side numeric
discovery, a fixed cover-sized canvas, a 48 MiB decoded-frame cache, and four
concurrent image requests. The target frame is
`round(scrollY / (documentHeight - viewportHeight) * 299)`, smoothed over 45 ms.
Scrolling upward reverses it. Content stays in document flow; resize observation
updates the range when filtering skills or changing the viewport. Section heights
have changed, so each section naturally occupies a different part of the same
continuous sequence. There are no pinned sections or competing scroll timelines.

Existing Lenis owns desktop wheel/anchor interpolation. Touch and reduced-motion
scrolling remain native. Reduced motion keeps the first background frame.
Background, cache, discovery, and smooth-scroll source files were not modified.

The working tree already contained substantial uncommitted changes. In particular,
CustomCursor.tsx had been deleted locally. Its Git version supplied the original
white difference-blend circle and spring-following behavior, which are restored
with lighter event handling and live capability/preference checks.

## Reference and interpretation

[Run Rob Run](https://www.runrobrun.com/) was reviewed as a design reference.
Its strong display/supporting-type contrast, compact navigation, numbered work,
and separation of project titles from supporting descriptions informed the
hierarchy here. Its branding, fonts, content, assets, layouts, and animation
sequences are not used.

This portfolio's monochrome portrait-to-circuitry sequence calls for warm white,
dark blue-green ink, and one restrained teal accent. Inter already provides a
self-hosted variable family; the upgrade uses its weight range, tighter display
spacing, responsive sizing, and measured reading columns instead of adding font
downloads. No dependencies were added.

## System and composition

- `src/app/globals.css`: semantic colors, typography, gutters, spacing, reading
  widths, surfaces, borders, radii, and interaction timing.
- `src/lib/motion.ts`: shared 160/280 ms interactions; 420–820 ms fade,
  support, major, heading, card, project, and intro presets; 8–30 px travel;
  45–75 ms stagger; and standard, reveal, and exit easing curves.
- Hero: open name masthead, portrait space, primary project CTA, CV link,
  professional role and availability, and a scroll cue.
- About: asymmetric biography, metadata column, and unboxed statistics.
- Experience: ruled timeline rows, a date column, larger roles, full contributions.
- Projects: numbered editorial rows with a larger, lightly tinted lead project.
  Descriptions and stacks remain visible; repository URLs can be added to data.
- Skills: filterable category rows and typographic lists, with no glowing tiles.
- Education/leadership: two reading columns, separated by rules instead of cards.
- Contact/footer: open contact details, accessible email-client form, large signature.

The fixed 12% veil leaves the image visible. Section surfaces add 86% separation
for reading, with slightly stronger treatment over busy projects/contact frames.
The hero uses a local directional contrast layer, allowing the portrait to remain
prominent. The wide-screen location label has its own small contrast backing.
These are foreground overlays, not replacement backgrounds.

Layouts change at 640px and 1024px; large screens cap the reading grid at 1320px.
Mobile stacks project/experience columns, wraps actions and filters, and uses the
existing accessible navigation dialog. No custom pointer is shown on touch.

## Interaction and accessibility

The opening is a deterministic one-time sequence that starts after fonts and the
first paint are ready. Navigation, role metadata, the intro phrase, both name
lines, supporting copy, actions, and bottom metadata enter in that order. A
pre-paint guard prevents a visible flash before the sequence begins and releases
content after 2.5 seconds if JavaScript initialization is interrupted.

Section motion follows the same grammar throughout the page. Eyebrows fade,
headings use a clipped reveal, supporting copy rises a shorter distance, and
cards or project rows use a slightly longer reveal with a very small scale
settle. Related lists stagger by 45–75 ms. Viewport motion runs once per element,
begins just before the element enters the viewport, and uses opacity and transform
properties only. Skill-filter changes animate the incoming result group without
leaving stale items in the accessibility tree.

A second, scroll-linked handoff layer connects those one-time reveals into a
continuous journey. The hero retains full emphasis at the top, then rises 16 px
and settles to 68% opacity as About takes priority. Major sections begin at 84%
opacity and 16 px below their resting position, remain fully emphasized through
their reading range, and leave at 82% opacity with a 12 px rise. Experience rows
use a quieter version. Project rows use the strongest overlap, with alternating
8 px horizontal entry, a 16 px rise, and partial outgoing opacity so adjacent
projects remain visually related. Contact and footer use closing presets that
finish at full emphasis.

The handoff values live beside the reveal tokens in `src/lib/motion.ts` and are
applied by `src/components/ui/ScrollHandoff.tsx`. Framer Motion derives them from
motion values rather than React state or a new scroll listener. The existing
background mapper and Lenis configuration remain unchanged. The reference site's
shared reveal hierarchy—masked rise for high-value text, plain fades for support,
and fine versus normal stagger—informed the pacing; its design, code, timing,
branding, and assets were not copied.

Mobile reduces travel to 10–16 px, shortens the opening, and caps stagger at
45 ms. It also removes scroll-linked section handoffs. Reduced motion exposes all
content immediately, removes transforms and
clip masks, disables Lenis and the custom cursor, and keeps the first background
frame. Server-rendered and no-JavaScript content remains visible.

The cursor retains its original difference blend and spring tracking. Motion
values update transforms without React state updates per pointer move. Hover
uses delegated pointer events; media-query changes, keyboard input, window blur,
and document visibility restore the native cursor as appropriate. Text fields
retain an I-beam. There is no permanently running cursor animation loop.

The existing skip link, focus rings, active-section navigation, menu focus trap,
Escape dismissal, focus restoration, anchor history, form labels/validation, and
no-JavaScript content visibility remain. Reduced motion removes foreground
movement, disables the custom cursor and Lenis, and freezes the background.

## Verification

The October 2026 motion audit changed reveals to scalar animation targets.
Only content below the viewport is prepared after hydration; content at a restored
reading position stays visible. Once a reveal leaves the viewport, it prepares
offscreen and replays on each later entry, including reverse scrolling. The heading overflow mask remains, while
the observed element avoids a fully closed clip-path that could prevent its own
IntersectionObserver from ever triggering. Mobile fade-only presets have zero
travel. Scroll handoff subscriptions detach on coarse pointers, small screens,
and reduced motion instead of continuing behind CSS overrides. Server-rendered
handoffs start at full emphasis.

The `--motion-only` browser check covers slow and fast full-page scrolling,
reverse scrolling, small wheel deltas approximating trackpad input, native
scrollbar dragging, repeat reveal playback, readable settled content, and mid-page reload. It records
frame intervals, long tasks, and layout shift in `motion.json`. These headless
measurements are diagnostic and do not establish a physical-device 60 FPS guarantee.

```sh
npm run lint
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
python -m http.server 3010 --bind 127.0.0.1 --directory out
node scripts/verify-background.mjs http://localhost:3010 --motion-only
node scripts/verify-background.mjs http://localhost:3010 --appearance-only
node scripts/verify-background.mjs http://localhost:3010
```

Use `npm.cmd` / `npx.cmd` in PowerShell when its execution policy blocks the
PowerShell wrappers. Chrome checks require a working Chromium renderer; this
workspace's sandbox required running the browser checks outside the sandbox.

The appearance suite covers 320, 390, 768, 1024, 1440, and 1920 px, existing
content, field typing, overflow, keyboard/mobile navigation, filters, and
no-JavaScript rendering. Cursor checks cover pointer activation, hover state,
live reduced-motion changes, keyboard fallback, and touch-device exclusion.
The background suite covers forward/reverse scroll, wheel/keyboard/touch input,
cover sizing, reduced motion, failed/delayed frames, memory bounds, and idle work.
Screenshots and reports are local to the ignored `.background-verification/` folder.

## Existing content gaps

The supplied public directory does not contain `Vishwa_Dayarathne_CV.pdf`.
The CV URL is preserved and still needs the real file. Repository links are
`#` placeholders in the supplied data; they remain noninteractive labels with
working “Discuss this project” contact links alongside them. No project URLs
or screenshots were fabricated. The contact form opens an email client; it is
not a server-side mail service. Existing domain/social profile assumptions
documented in README.md still need the owner's verification before publishing.
