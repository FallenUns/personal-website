# Portfolio Rebuild: Fast Text-First Site With a 3D Desk

* **Author:** FallenUns
* **Date:** 2026-11-18

## Overview

Rebuild the personal portfolio so that it loads quickly on a phone and has one
memorable visual idea: a stylised 3D scene of the owner's real desk, where
objects on the desk lead to projects and experience. The audience is anyone
curious about the owner. There is no single action a visitor must take.

The owner's two complaints about the current site are that it is too slow and
that the design does not impress. The owner wants more 3D, small interactive
touches, more written depth per project, a full phone experience, and visuals
made only from real photos, screenshots and video.

Kept from the current site: the AI chat assistant and its Node server, the
feedback form and admin viewer, the day/night theme, the experience timeline
and the project detail pages. Removed: the birthday page.

## Analysis

Six reviewers with no knowledge of the conversation read the idea and the
repository. Three of their claims were checked against the source by the main
session and hold (marked "checked"). The rest are reviewer findings that have
not been independently confirmed.

### The idea rests on two wrong assumptions

1. **Phones are not blocked on `main`.** (checked) Nothing imports
   `MobileComingSoon.tsx` or `mobileDetection.ts`. Phones already receive the
   full heavy site. The phone problem is speed, not a missing layout gate.
   Production may be running an older build; that has not been checked.
2. **The main cause of slowness is a loading gate, not the 3D library.**
   (checked) `src/App.tsx` keeps all content invisible until `isLoading`
   clears. One of the loaders, `preloadAllMedia`, downloads every video and
   image before any text appears. The images alone are 3 to 6.5 MB each.
   Reviewers also report fixed delays of 1 to 1.5 seconds stacked on top. Any
   redesign that keeps a gate like this cannot show text in 2 seconds.

A third finding changes what "keep" means: the admin feedback viewer does not
work against the server. (checked) The server requires an `x-admin-api-key`
header and the client never sends it, so the viewer shows only feedback stored
in the admin's own browser.

### Five pieces of work are bundled as one

The idea combines a speed budget, a content rewrite, new page routes, the 3D
desk and the interactive touches. Only the desk waits on photos. Shipped
together, the unblocked work waits on the blocked work, and the 2 second
target cannot be tested until the 3D exists.

### The desk has no inputs, no time limit and no budget

There are no desk photos yet, no model files and no 3D artist. A desk modelled
in code tends to look like generic low-poly shapes unless "stylised" is
defined. Reviewers suggest a small trial first: model one object, run it on
the target phone, and measure frame rate and download size. They suggest
limits of about 50 draw calls, 100,000 triangles on desktop and 30,000 on
phones, and about 1.5 MB of textures.

### The desk cannot be the only way to navigate

All six reviewers raised this. Search engines, screen readers, keyboard users,
phones on a fallback tier and the chat assistant cannot use 3D objects, and
visitors may not realise the desk is a menu. A visible HTML list of projects
and experience has to be the main navigation. Each desk object should only
link to a page that already exists.

There are 10 projects and 3 experiences. A desk has a fixed number of objects.
Objects should open categories (for example monitor to projects, notebook to
timeline), not individual items, so that adding a project does not require
modelling a new object.

### Text depends on JavaScript today

`index.html` contains an empty root element, and Google Fonts blocks rendering
with 2 families and 11 weights. On a slow 4G connection, 2 seconds allows
roughly 150 to 170 KB of compressed download before text shows. The text has
to be in the HTML at build time, and the 3D library has to load afterwards.

### "Fast" has no testable definition and there is no baseline

No one has measured the live site. The spec needs a named test phone, a named
network profile, and pass/fail numbers, enforced automatically on each deploy.

### Other findings to carry into the spec

* Detail pages are overlays on top of the full home page, so a direct link to
  a project loads everything. No page is split into its own download.
* The chat assistant depends on fixed page section names and on portfolio text
  copied into three places. Its daily budget allows about 35 requests and
  resets when the server restarts.
* Every push to `main` deploys straight to production. A failed server restart
  is hidden, and old site versions are deleted after five deploys.
* Production strips all error logging, so failures are invisible.
* Three animation libraries are installed; one is enough. Several dependencies
  appear unused (face-api.js, ogl, troika-three-text, stats.js,
  liquid-glass-react, simplex-noise). Reviewers disagree on how many of the
  background effects are still live; a fresh build with a bundle report will
  settle it.
* Removing the birthday page touches `App.tsx`, `router.ts`, two server blocks
  in `nginx.conf`, and a DNS record.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Text readable within 2 seconds on a mid-range phone over 4G, measured and
    enforced on each deploy.
  * The site is complete and navigable with no 3D at all.
  * One 3D desk scene as an optional layer, with quality levels chosen in one
    place, and a static desk photo as the lowest level.
  * Standalone pages for projects and experience, each loaded on demand.
  * Longer written content per project, stored one file per project.
  * AI chat, feedback form, a working admin viewer, day/night theme and
    experience timeline carried over.
  * A fixed list of 3 to 5 small interactive touches, each switched off under
    reduced motion and on touch screens.
  * Birthday page and its subdomain removed.
* **Out-of-Scope Non-Goals:**
  * Generated imagery of any kind.
  * A photoreal desk. That needs a 3D scan or an artist.
  * A separate phone build of the scene.
  * A scrolled 3D world on the scale of why.zero.university.
  * Carrying over the existing background effects one by one.

## Alternatives Weighed

The owner rejected alternative 1. The others are not ruled on, except that
alternative 2 is kept as the fallback for the desk.

1. **Fix the current site only, or first.** Remove the loading gate, load
   heavy parts on demand, compress media, delete unused code. A few days of
   work. It fixes speed but not the design complaint. Every reviewer
   recommended doing this first. **Rejected by the owner (2026-11-18):** all
   work goes into the rebuild, with no separate speed release on the old code.
   The cost of this choice is that the live site stays slow until the rebuild
   ships. The rebuild must not carry the loading gate over.
2. **Real desk photo with clickable hotspots and a slight depth effect.** Uses
   real photos directly, needs no modelling, and is light on phones. It can
   also serve as the fallback for the 3D desk. Five of six reviewers raised
   it. It is less "3D" than the owner asked for.
3. **Scroll-controlled video of the real desk as the opening.** Real footage,
   no modelling. Needs the owner to film it.
4. **3D desk on desktop, photo hotspots on phones.** One shared list of
   objects and links. Lower phone risk; phones do not get the 3D.
5. **Dark editorial site with one small shader and no desk.** Lowest risk.
   The impression has to come from type, motion and video.
6. **Full 3D desk for all devices from the start.** The original idea.
   Highest risk: blocked on photos, unproven on phones, no time limit.

## Key Decisions & Staging for Next Steps

Decided by the owner:

* Audience is anyone curious about the owner.
* Phone gets the full site.
* Keep chat, feedback and admin, day/night theme, timeline, project pages.
  Remove the birthday page.
* Real material only. The owner will supply desk photos.
* Direction: 3D desk, small touches, more content depth.

* No separate speed release on the old code. Everything ships in the rebuild.

Working assumptions. The owner was asked and has not answered; these stand
unless the owner changes them:

* The rebuild is still built in four stages inside one branch, each passing
  the speed budget before the next starts:
  1. text-first pages with routes and an enforced speed budget;
  2. content model and rewrite;
  3. the desk as an add-on;
  4. interactive touches.
  Stages 1 and 2 do not wait for desk photos.
* Phones get the same 3D desk at a lower quality level. A phone that cannot
  hold 30 frames per second drops to the desk photo with hotspots.
* Desk objects open categories, not individual projects.
* Flat colours and shapes drawn in code count as building the desk, not as
  generated imagery. Screens, posters and paper in the scene show the owner's
  real photos and screenshots.
* If a one-object trial on a real phone fails, or the desk is not done when
  the rest is ready, the site ships with the desk photo and hotspots, and the
  3D desk follows.
* Rewrite the three largest components; keep the data files, the router, the
  theme provider and the server.
* Speed test: Lighthouse mobile preset, text visible within 2.0 seconds,
  median of 5 runs, plus a check on the owner's own phone.

Open questions for the owner:

1. What daily chat budget is acceptable, and what should visitors see when it
   runs out?
2. When will the desk photos be supplied?
