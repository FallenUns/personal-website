# Portfolio Rebuild: Fast Text-First Site With a 3D Desk

*   **Author:** FallenUns
*   **Status:** In Review (revision 2, after the five-stage review of 2026-11-19)
*   **Date:** 2026-11-19

--------------------------------------------------------------------------------

## Overview

This design replaces the current personal portfolio with a new build,
delivered in two releases.

*   **Release 1, the text site.** Every page is a finished HTML file. Text is
    readable before any JavaScript runs. The chat assistant, the feedback
    form, the admin feedback page and the day/night theme work. The birthday
    page is gone.
*   **Release 2, the desk.** A 3D model of the owner's desk, built in code
    from the owner's photos, appears at the top of the home page. Six desk
    objects lead to parts of the site.

All pages and links work with the desk absent. This is called the **no-3D
rule** in the rest of the document.

Visuals come from the owner's photos, screenshots and video. The one
exception, accepted by the owner, is the desk itself: shapes and flat colours
drawn in code, and saved pictures of that model.

## The Problem

The owner states two complaints: the site is too slow, and its design does
not impress the owner.

**Causes of slowness found in the `main` branch.** Load time on the live site
has not been measured; these are read from source and from the last build.

1.  `src/App.tsx` hides all content until a loader finishes. The loader
    (`src/utils/imagePreloader.ts`) downloads every image and video first.
    Images are 3 to 6.5 MB each; the video is 6.9 MB.
2.  The last build is about 2.4 MB of JavaScript in four files, none split by
    page. The 3D library is 708 KB of it.
3.  `index.html` contains no text, and loads 2 font families in 11 weights
    from Google Fonts before first paint.

**Design.** The site has about ten background effects and three animation
libraries. The pages the owner named as references (the OpenAI and Anthropic
model release pages, Shopify Editions, why.zero.university) each use one
visual idea and headline type above 48 pixels.

**Also broken.** The admin feedback viewer never sends the
`x-admin-api-key` header the server requires
(`src/services/feedbackService.ts`), so it shows only feedback saved in the
admin's own browser.

## Goals

Each goal has a check in [Non-Functional Requirements](#non-functional-requirements).

*   **Text first.** Page text is in the HTML file and readable with
    JavaScript switched off.
*   **Small first download.** A page needs at most 30 KB of gzip-compressed
    JavaScript before the visitor interacts.
*   **The no-3D rule.** Every project, experience entry and feature is
    reachable through HTML links, by keyboard and by screen reader.
*   **One desk scene (Release 2).** Six objects open parts of the site. A
    device that cannot draw it at 30 frames per second, has no 3D graphics,
    or asks for reduced motion or data saving gets a still picture of the
    desk with the same six links.
*   **Own address per page.** Each project and experience entry is its own
    page. Back button and direct links work.
*   **Longer project content.** One Markdown file per entry, holding prose,
    images, video and charts. Every image has a text description.
*   **Features working.** AI chat, feedback form, day/night theme, experience
    timeline. The admin page lists feedback stored on the server.
*   **Five interactive effects**, listed under
    [Interactive effects](#interactive-effects), all off under reduced
    motion.
*   **Limits fail the deploy.** A deploy stops when a file-size limit is
    exceeded.
*   **Baseline recorded.** The live site is measured with Lighthouse before
    Release 1 goes live.
*   **Birthday page removed.**

## Non-Goals

*   No speed release on the old code. The owner chose to put all work into
    the rebuild.
*   No generated imagery other than the code-built desk and saved pictures of
    it.
*   No photoreal desk.
*   No second scene for phones. Phones get the same scene with a lower
    resolution cap and no shadows.
*   No client-side router. Links load pages.
*   No full-page loading screen.
*   No change to the request format of `/api/llm/chat` or to the feedback
    categories (`design`, `content`, `functionality`, `performance`,
    `general`).
*   No content management system.
*   No rewriting of project text for Release 1. Existing text moves as it
    is; the owner extends it afterwards.

## Open Questions

*   **Live site build.** No file in `main` blocks phones, yet the owner
    recalls a "coming soon" page on phones. The baseline measurement will
    show whether the live site is an older build.
*   **Chat budget value.** The server stops answering after
    `LLM_DAILY_TOKEN_BUDGET` tokens per day (default 100,000, roughly 35
    questions). The owner sets this value in the server's environment; no
    code depends on the number.

## Critical User Journeys (CUJs)

### CUJ 1: First visit on a phone

*   **Given**: A visitor on the Lighthouse "mobile" device profile (slow 4G,
    4x CPU slowdown), first visit.
*   **When**: They open `/`.
*   **Then**: The owner's name, introduction and project list are in the
    first HTML response. In Release 2 the desk appears afterwards in a box
    whose size was already reserved.

### CUJ 2: Direct link to a project

*   **Given**: A link to `/projects/reffy` on another site.
*   **When**: The visitor follows it.
*   **Then**: That page's HTML loads alone. Images load as they scroll into
    view. Back leaves the site.

### CUJ 3: Using the desk (Release 2)

*   **Given**: A desktop visitor on `/` with the desk drawn.
*   **When**: They point at the monitor and click.
*   **Then**: A label reading "Projects" shows, and the click loads
    `/projects`.

### CUJ 4: No 3D

*   **Given**: A browser with no 3D graphics, or reduced motion, or data
    saving turned on.
*   **When**: The visitor opens `/`.
*   **Then**: Release 2 shows the still picture with six links. No 3D code
    downloads.

### CUJ 5: Keyboard and screen reader

*   **Given**: A keyboard-only or screen-reader visitor.
*   **When**: They move through `/`.
*   **Then**: Every destination is an HTML link. The canvas is skipped.

### CUJ 6: Asking the assistant

*   **Given**: A visitor on any page.
*   **When**: They open the chat and type "show me Reffy".
*   **Then**: The assistant replies "Opening Reffy." and the browser loads
    `/projects/reffy`. The chat reopens there with its messages. When the
    daily budget is used up, the panel shows a message with links to
    `/projects` and `/experience`.

### CUJ 7: Reading feedback as the owner

*   **Given**: The owner opens `/admin/feedback` and types the admin key.
*   **When**: The list loads.
*   **Then**: It shows feedback from the server. Export and clear act on the
    server. A wrong key shows "Key rejected" and no data.

### CUJ 8: Day and night

*   **Given**: A visit at 20:00, or a saved choice of theme.
*   **When**: The page paints.
*   **Then**: The first painted frame uses the chosen theme.

## Technical Plan (Architecture)

### Decisions made by the owner

| Question | Choice | Date |
| --- | --- | --- |
| Tooling for building pages | Vite and React, each page written to an HTML file at build time | 2026-11-18 |
| What draws the desk | react-three-fiber with drei | 2026-11-18 |
| Where content lives | One Markdown file per entry with front matter | 2026-11-18 |
| Motion on text pages | Browser features only (CSS, View Transitions) | 2026-11-18 |
| Order of release | Text site first, desk as a later release | 2026-11-19 |
| Moving between pages | Ordinary page loads with the browser's transition | 2026-11-19 |
| Chat knowledge | Sent by the browser with each question, as today | 2026-11-19 |
| Test tool | Vitest | 2026-11-19 |
| What blocks a deploy | File-size checks; Lighthouse is a report | 2026-11-19 |
| Clutter on the desk | Left out of the model | 2026-11-19 |

**One consequence the owner should confirm.** With ordinary page loads there
is no reason for React to take over a whole page in the browser. In this
revision React renders every page at build time and, in the browser, runs
only inside the interactive parts (chat, feedback form, charts, desk, admin
page). Revision 1 had React attach to the full page. The change removes the
risk of the built HTML and the browser's output differing, and stops each
article shipping twice (once as HTML, once inside JavaScript).

### Terms

*   **Island**: an interactive part of a page that loads its own code when
    needed. Everything outside islands is plain HTML.
*   **Content compiler**: the build step that turns Markdown files into HTML
    and data.
*   **Media step**: the build step that resizes images.
*   **Still**: a saved picture of the 3D desk, one per theme.
*   **Deploy layout**: the server keeps each build in
    `$DEPLOY_PATH/releases/<commit>`. A link named `current` points at the
    live one and `html` points at `current`. The workflow keeps the newest
    five releases. `nginx.conf` is uploaded by the workflow and installed by
    the owner by hand.

### How the pieces fit

```text
BUILD
  content/**/*.md ──> content compiler ──> entries (HTML + fields)
                                      └──> knowledge (plain text for chat)
  media/** ─────────> media step ───────> public/m/<name>.<hash>.<ext>
  entries + pages ──> React renders each address to a string
                  ──> dist/<address>/index.html, dist/404.html

BROWSER, every page
  1. HTML arrives. Inline theme script sets data-theme. Text paints.
  2. src/client.ts (under 30 KB) wires the theme toggle, the pointer light,
     and finds elements marked data-island.
  3. An island's code loads when its trigger fires:
       chat, feedback ..... on click (or at idle if chat was open)
       chart .............. when scrolled into view
       desk (Release 2) ... at idle, when the hero is on screen
       admin-feedback ..... at once, on /admin/feedback only

SERVER (routes unchanged)
  POST /api/llm/chat        POST /api/feedback
  GET  /api/feedback        GET  /api/feedback/stats
  GET  /api/feedback/export-csv    DELETE /api/feedback    GET /api/health
```

### Build-time rendering

*   `src/entry-server.tsx` exports `render(address)`. It imports every page
    component directly (no lazy loading on the build side) and calls React's
    `renderToStaticMarkup`. It returns `{ html, head }`, where `head` holds
    the page's title, description, canonical address and social tags.
*   The build runs four commands in order: media step; `vite build` (browser
    code, with `build.manifest` on); `vite build --ssr src/entry-server.tsx
    --outDir build/server`; `node scripts/prerender.mjs`.
*   `scripts/prerender.mjs` reads `dist/index.html`, and for each address
    from `src/routes.ts` replaces the markers `<!--app-head-->` and
    `<!--app-html-->` and writes `dist/<address>/index.html`. It also writes
    `dist/404.html` from the not-found page.
*   `build/server` is outside `dist`, so the deploy does not upload it.
*   Page data travels inside the HTML. An island reads its settings from a
    `data-props` attribute holding JSON. No `.json` file is fetched, which
    matters because `nginx.conf` refuses `.json` requests.
*   In development, a small Vite plugin answers page requests by calling the
    same `render` function, so `npm run dev` shows the same pages.

### Pages and routes

`src/routes.ts` exports `addresses(slugs)`, which takes the lists of project
and experience slugs and returns every address, and `titleFor(address)`.

| Address | Content | HTML file |
| --- | --- | --- |
| `/` | Hero, section index, about, featured projects, short timeline, contact | `dist/index.html` |
| `/projects` | All projects, grouped by category; each group has an id such as `#mobile` | `dist/projects/index.html` |
| `/projects/<slug>` | One project | one file each |
| `/experience` | Full timeline | `dist/experience/index.html` |
| `/experience/<slug>` | One entry | one file each |
| `/admin/feedback` | A heading and the admin island; marked `noindex` | `dist/admin/feedback/index.html` |
| any other | Not-found page with links, status 404 | `dist/404.html` |

Links are `<a href>` elements. The stylesheet sets
`@view-transition { navigation: auto; }`, so Chrome and Safari animate the
change between pages; other browsers change pages without animation.

### Theme

*   The saved choice lives in `localStorage` under the key `theme`, with the
    value `dark` or `light`. No key means automatic: dark from 17:00 to
    05:00 local time, light otherwise (today's rule).
*   `src/theme-inline.js` is inserted into `<head>` by the prerender step:

    ```js
    (function () {
      var t = null;
      try { t = localStorage.getItem('theme'); } catch (e) {}
      if (t !== 'dark' && t !== 'light') {
        var h = new Date().getHours();
        t = h >= 17 || h < 5 ? 'dark' : 'light';
      }
      document.documentElement.dataset.theme = t;
    })();
    ```

*   `src/theme.ts` exports `getTheme()`, `setTheme('dark' | 'light' |
    'auto')` and `onThemeChange(fn)`. `auto` removes the key.
*   The toggle is a `<button>` in the navigation bar, wired by
    `src/client.ts`. No React is involved.
*   All colours are CSS variables keyed on `html[data-theme]`.
*   The site's content security policy allows inline scripts only by hash. A
    test computes the SHA-256 of `src/theme-inline.js` and fails unless that
    hash is in `nginx.conf`.

### Content

Files: `content/about.md`, `content/projects/<slug>.md`,
`content/experience/<slug>.md`.

**Project front matter**

| Field | Type | Required |
| --- | --- | --- |
| `title` | text | yes |
| `summary` | text, at most 200 characters | yes |
| `category` | `Mobile`, `Development`, `UI Library`, `Research`, `Data Science` or `Machine Learning` | yes |
| `technologies` | list of text | yes |
| `order` | number; lower shows first | yes |
| `featured` | true or false | no, default false |
| `status` | `live` or `coming-soon` | no, default `live` |
| `cover` | image path | no; a card with no cover shows title and summary only |
| `coverDark` | image path used in the dark theme | no |
| `accent` | CSS colour | no |
| `links` | list of `{ label, url }` | no |
| `charts` | list of `{ id, type, title, description, data, xAxisKey, yAxisKeys, colors }` (today's `ChartConfig`) | no |

**Experience front matter**: `role`, `company`, `start` (`YYYY-MM`), `end`
(`YYYY-MM` or `present`), `location`, `summary` (all required); `skills`,
`links`, `cover` (optional).

**About front matter**: `title`, `summary`. Its body holds the biography,
skills and achievements text now inside `src/api/knowledgeBase.ts`.

**Body syntax**

*   Standard Markdown.
*   Image: `![description](file.jpg "optional caption")`. A path with no
    leading slash is looked up in `media/` and becomes a `<picture>` with
    AVIF and WebP at three widths, fixed width and height, and lazy loading.
    A path with a leading slash (for example `/reffy-logo-dark.svg`) is a
    file in `public/` and is used as it is.
*   Video, on its own line:
    `::video{src="cliniwatch-1.mp4" poster="cliniwatch-poster.jpg"}`. It
    becomes a `<video controls preload="none">`.
*   Chart, on its own line: `::chart{id="accuracy"}`, naming an entry in
    `charts`. It becomes an island placeholder.
*   Today's `features`, `challenges` and `outcomes` lists become body
    sections with those headings. `liveUrl` and `githubUrl` become `links`.
    `mockupType` is dropped.

**Validation.** `scripts/content/compile.ts` exports
`compileEntry(path, text, mediaManifest)`. It returns the entry or throws an
error naming the file and the rule broken: a required field missing or of
the wrong type, an unknown category, an image with no description, an image
not found in `media/`, a chart marker with no matching chart, a duplicate
slug. The check is hand-written; no validation library is added.

**Use.** The content plugin exposes two modules. `virtual:content` (entries
with their HTML) is imported only by build-side code, so no article text
enters the browser's JavaScript. `virtual:knowledge` (title, address,
summary and plain text per entry, plus the about text) is imported only by
the chat island.

### Media

*   Originals move from `public/` to `media/`.
*   `scripts/media.mjs` writes AVIF and WebP at widths 480, 960 and 1600 to
    `public/m/`, named `<name>.<width>.<hash>.<ext>`, copies videos there
    with a hash in the name, deletes files in `public/m/` that the run did
    not produce, and writes a manifest to `.cache/media.json`. `public/m/`
    and `.cache/` are ignored by git.
*   The video is compressed once by hand to 720 pixels high, H.264, under
    4 MB (`ffmpeg -i in.MP4 -vf scale=-2:720 -crf 28 -preset slow
    -movflags +faststart out.mp4`) and committed to `media/`.
*   Images get a pipeline because there are about 15 and more will be added;
    there is one video.

### Chat assistant

*   **Markup.** Every page has a static chat button. A click loads the chat
    island.
*   **Ownership.** `src/islands/ChatIsland.tsx` owns the message list, the
    trimming of history to the last 5 turns, the call to
    `llmService.sendMessage`, and saving to `sessionStorage` under
    `chat:v1` as `{ open, messages }`. `src/components/ChatWindow.tsx`
    only displays. Its props become `{ messages, isAITyping, notice,
    onSendMessage, onClose }`, where `notice` is `null`, `'budget'` or
    `'offline'`.
*   **Across pages.** If `chat:v1` says the panel was open, `src/client.ts`
    loads the island at idle on the next page and reopens it.
*   **Knowledge.** `src/api/knowledgeBase.ts` keeps `getRelevantContext`,
    rewritten to search `virtual:knowledge`. `src/api/llmService.ts` keeps
    cutting context to 6,000 characters, which the server also enforces. The
    server's system prompt holds only identity rules today and is not
    changed.
*   **Commands.** Before a message goes to the server,
    `src/api/controlService.ts` checks it for a command:

    | Command | Trigger | Action | Reply |
    | --- | --- | --- | --- |
    | `navigate` | a verb (`show`, `open`, `go to`, `take me to`, `see`) plus `projects`, `experience`, `about`, `contact`, or a project or experience title or slug (case ignored) | `location.assign(address)`; `about` is `/#about`, `contact` is `/#contact` | "Opening <title>." |
    | `setTheme` | `dark mode`, `light mode`, `night`, `day`, `auto theme` | `setTheme(...)` | "Switched to <choice> theme." |

    The time-of-day, auto-sync and status commands are removed with the
    time-of-day backgrounds they controlled.
*   **Budget.** The server answers an exhausted budget with status 429 and
    `code: 'budget_exhausted'`. The rate limiter also uses 429, so
    `llmService` reads the JSON body before deciding, and returns
    `{ kind: 'budget' }`, `{ kind: 'offline' }` (no response) or the reply.
*   **Ledger.** The server keeps the day's token count in
    `DATA_DIR/llm-ledger.json` as `{ "dayKey": "2026-11-19", "used": 1234 }`.
    It is read once when the app is built and written after each request
    through one promise chain, to a temporary file that is then renamed.
*   **Development.** Vite forwards `/api` to `http://localhost:3001`.

### Feedback

*   A static feedback button on every page loads the form island on click.
*   Ctrl or Cmd + Shift + F goes to `/admin/feedback`, matching what the
    shortcut opens today.
*   `src/services/feedbackService.ts` calls `/api` by relative address. Admin
    functions take the key as an argument and send it as
    `x-admin-api-key`. The copy kept in `localStorage` is removed; a failed
    submit tells the visitor it failed.
*   `/admin/feedback` holds the key in memory only.

### The desk (Release 2)

**Objects**, from the owner's photos in `media/desk/`:

| Object | Leads to | Kind |
| --- | --- | --- |
| Monitor (with rubber duck on its corner) | `/projects` | link |
| MacBook on stand | `/experience` | link |
| Camera | `/projects/reffy` | link |
| iPad in folio | `/projects#mobile` | link |
| Floor lamp | switches the theme | button |
| Rubber duck | opens the chat | button |
| Desk, chair, keyboard, mouse and mat, coaster, charging stand, headphones, plant, block figure | nothing | decoration |

Left out: race bib, cable basket, charger, wallet, power bank, massage gun,
pouch, medication, bags, shelves.

`src/islands/desk/objects.ts` holds this table as data. The still and the
scene both read it.

**Stills.** The scene has a capture mode (`/?capture=dark`,
`/?capture=light`, development only) that draws one frame at 1920 by 1080
and saves it. The two pictures are committed to `media/desk-stills/`. The
home page's HTML shows the still for the current theme with `<a>` and
`<button>` hotspots placed from the table. Until the scene exists the hero
is headline text only.

**Loading.** At idle, with the hero on screen, `src/client.ts` checks three
gates: a WebGL2 context can be created; `prefers-reduced-motion` is not
`reduce`; `navigator.connection.saveData` is not true. If any fails, nothing
loads. Otherwise the scene code loads and fades in over the still.

**Frame-rate probe.** During the 1.5 second fade-in the scene draws
continuously while the camera drifts 5 degrees. `probe.ts` counts frames. An
average under 30 per second removes the canvas and leaves the still. At 30
or above the scene switches to drawing only on change
(`frameloop="demand"`). The result is not stored; each visit measures again.

**Settings by device.** `pointer: coarse` devices: resolution cap 1.5, no
shadows. Others: resolution cap 2, soft shadows.

**Limits.** Scene code with the 3D library: 250 KB gzip (checked by
`check-limits`). At most 50 draw calls and 100,000 triangles, read from the
renderer's own counters in development (checked by hand). Textures: 1.5 MB
total.

**Trial gate.** The desk surface and monitor are built first and run on the
owner's phone. Release 2 proceeds only if the probe passes there and the
scene code is under its limit. If it fails, Release 2 ships the stills and
hotspots without the live scene on phones.

### Visual direction

*   Dark theme: background `#0b0b0c`, text `#f2f0ea`, one warm light on the
    desk. Light theme: background `#faf9f5`, text `#141413`.
*   Fonts: Archivo (headlines) and Space Grotesk (text), the families used
    today, each as one variable WOFF2 file with the Latin character set and
    the weight axis only, served from `public/fonts/`.
*   Headlines: `clamp(3rem, 9vw, 9rem)`, letter spacing `-0.04em`.
*   The home page lists its sections as a numbered index
    (`[1] ........ About`), a layout taken from the Anthropic release page.

### Interactive effects

| # | Effect | How | Release | On touch screens |
| --- | --- | --- | --- | --- |
| 1 | Headlines and sections fade and rise 16 pixels as they enter the view | CSS `animation-timeline: view()`; no animation where unsupported | 1 | yes |
| 2 | Featured project cards stack while scrolling | CSS `position: sticky` | 1 | yes |
| 3 | A project's cover grows from its card to the top of its page | View Transition name per slug | 1 | yes |
| 4 | A radial highlight follows the pointer over the hero headline and cards | two CSS variables set by `src/client.ts` | 1 | no |
| 5 | A desk object rises 2 cm and shows its label on hover or focus | scene code | 2 | labels always shown |

All five sit inside `@media (prefers-reduced-motion: no-preference)`.

### Build, checks and deploy

*   Work happens on a `rebuild` branch. `main` keeps deploying the current
    site until Release 1 is merged.
*   One workflow, `.github/workflows/deploy.yml`, with two jobs. `check`
    runs on every push and pull request: install (root and `server/`), lint,
    type check, Vitest, server tests, build, `check-limits`, then Lighthouse
    as a step that cannot fail the job and uploads its report. `deploy`
    needs `check` and runs only on `main`.
*   `scripts/check-limits.mjs` reads `dist/.vite/manifest.json` and fails
    when a limit in Non-Functional Requirements is exceeded.
*   When a visitor's open page asks for a code file that a newer deploy has
    removed, Vite raises `vite:preloadError`; `src/client.ts` answers by
    reloading the page.
*   The deploy no longer hides a failed server restart. After restart it
    requests `http://127.0.0.1:3001/api/health` on the server, up to 10
    times one second apart, and fails without a success.
*   Before switching `current`, if `$DEPLOY_PATH/archive/pre-rebuild` does
    not exist, the workflow copies the release `current` points at into it.
*   `scripts/rollback.sh <path>` points `current` and `html` at the given
    folder and restarts `portfolio-server`.

**`nginx.conf`.** The new file serves both the old and the new build, so it
can be installed before the merge and a rollback needs no config change.

*   `location /`: `try_files $uri $uri/index.html =404;` with
    `error_page 404 /404.html;` and `expires -1;`.
*   `/assets/` and `/m/`: `expires 1y;`. `/fonts/`: `expires 30d;`.
*   Caching is set with `expires`, not `add_header`, because a location with
    its own `add_header` stops inheriting the security headers.
*   `script-src` gains the theme script's hash. The Google Fonts hosts stay
    for now; they are removed in a later change once the old build is no
    longer a rollback target.
*   `/birthday` and the birthday subdomain redirect to `/`.

### Actions only the owner can take

*   Run Lighthouse (mobile) five times on the live site and record the
    median before the merge.
*   Install the new `nginx.conf` and reload nginx before the merge; confirm
    the current site still loads.
*   Remove the birthday subdomain's DNS record.
*   Set `LLM_DAILY_TOKEN_BUDGET` on the server.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| The desk misses its limits or the phone trial | Release 1 does not depend on it; Release 2 falls back to stills ([Trial gate](#the-desk-release-2)) |
| The live site is not the `main` build, so the diagnosis is off | Baseline measured before work is merged ([Actions only the owner can take](#actions-only-the-owner-can-take)) |
| The policy blocks the inline theme script in production | Hash test ([Theme](#theme)) |
| The new nginx config breaks the old site, or rollback fails | One config serves both builds and is installed first ([Build, checks and deploy](#build-checks-and-deploy)) |
| One visitor uses up the daily chat budget | Accepted. 10 requests per minute per address already applies; the panel then shows links (CUJ 6) |
| A browser sends invented context to the chat | Accepted. The server's prompt restricts answers to portfolio topics and caps context at 6,000 characters |
| Someone guesses the admin key | Accepted. The key is a server secret compared in constant time; 100 requests per 15 minutes per address applies |
| A slowdown not caused by file size reaches production | Lighthouse report on every run; owner's phone check before each release |
| Scroll-linked CSS is missing in Firefox and older Safari | Content shows without the effect |

## Alternatives Considered

Alternatives A to F come from the brainstorm
([portfolio-rebuild-brief.md](portfolio-rebuild-brief.md)), in which six
automated reviewers with no knowledge of the conversation read the idea and
the repository. The owner ruled on A; C to F are set aside by the owner's
choice of the 3D desk, and their reasons are the drafter's.

### A: Fix the current site only, or first

*   **Pros**: Days of work; removes the loading gate and oversized media.
*   **Cons**: No design change; work on components the rebuild deletes.
*   **Reason for rejection**: Owner's decision, 2026-11-18. Releasing the
    text site first recovers most of its benefit.

### B: Desk photo with clickable hotspots

*   **Disposition**: Adopted in changed form. The picture is a saved image of
    the 3D desk, not a photograph, because the owner's photos show clutter
    and personal items that cannot be removed without retouching.

### C: Scroll-controlled video of the desk

*   **Reason for rejection**: Needs filming; a video that tracks scrolling
    is megabytes of download; objects in it cannot be clicked.

### D: 3D on desktop only

*   **Reason for rejection**: The owner asked for phones to be served. The
    probe gives the same result for phones that cannot draw the scene.

### E: Editorial site with one shader and no desk

*   **Reason for rejection**: The owner asked for 3D. Its type and layout are
    used for the text pages.

### F: Desk as the only navigation

*   **Reason for rejection**: Unusable by search engines, screen readers and
    keyboards.

### G: Astro with React for interactive parts

*   **Pros**: Provides static pages, islands and Markdown without custom
    build code.
*   **Cons**: A second framework's conventions to learn and track.
*   **Reason for rejection**: Owner's decision to stay on Vite and React.
    This revision's islands reach the same page weight with about 150 lines
    of build script, so the saving would be those lines against a migration
    of every file.

### H: Hand-written pages with no React at build time

*   **Reason for rejection**: Pages would need a second template language
    beside the React used in islands.

### I: Plain three.js

*   **Reason for rejection**: Saves 50 to 80 KB but requires hand-written
    labels and pointer handling, which drei supplies; the 250 KB limit holds
    either way.

### J: ogl

*   **Reason for rejection**: No built-in lighting or shadows, which the desk
    scene on non-touch devices uses.

### K: MDX

*   **Reason for rejection**: Content files would be code that can fail to
    compile; `::chart` markers cover the one interactive need.

### L: Typed TypeScript data files

*   **Reason for rejection**: Long prose in code strings discourages the
    longer writing the owner wants.

### M: GSAP

*   **Reason for rejection**: 45 KB against a 30 KB first-download limit, on
    the same thread as the desk.

### N: Motion (framer-motion)

*   **Reason for rejection**: 35 to 45 KB, and it animates only what React
    controls, which is no longer the page.

### O: An existing prerender or router package (vite-react-ssg, React Router prerender, vike)

*   **Pros**: Maintained code for rendering, routing and attaching.
*   **Cons**: Each attaches React to the whole page and ships a router
    (20 to 60 KB).
*   **Reason for rejection**: With ordinary page loads neither is needed.

### P: Client-side router

*   **Pros**: Chat stays open across pages without saving state.
*   **Cons**: Click, back-button and title rules to write and test; page
    code must load before React attaches.
*   **Reason for rejection**: Owner's decision, 2026-11-19.

### Q: React attaching to the whole page (revision 1 of this design)

*   **Reason for rejection**: Any difference between built HTML and browser
    output causes errors; every article ships twice. Islands avoid both.

### R: Server holds chat knowledge

*   **Reason for rejection**: Owner's decision. Each question would carry
    all content, so cost per question grows as content grows.

### S: Lighthouse as a blocking check

*   **Reason for rejection**: Owner's decision. Results vary between runs on
    shared machines.

## Non-Functional Requirements

Sizes are gzip level 9.

| Requirement | Limit | Checked by |
| --- | --- | --- |
| JavaScript a page loads before interaction | 30 KB | `check-limits`, blocks deploy |
| Desk scene code with 3D library | 250 KB | `check-limits`, blocks deploy (Release 2) |
| Chat island with its Markdown reader | 150 KB | `check-limits`, blocks deploy |
| Fonts | 2 files, 120 KB total | `check-limits`, blocks deploy |
| Any image file | 200 KB | `check-limits`, blocks deploy |
| Desk still at 960 wide | 80 KB | `check-limits`, blocks deploy (Release 2) |
| Video | 4 MB | `check-limits`, blocks deploy |
| Largest Contentful Paint, mobile profile | 2.0 s | Lighthouse report; owner reads it |
| Cumulative Layout Shift | 0.1 | Lighthouse report |
| Total Blocking Time | 200 ms | Lighthouse report |
| Desk frame rate | 30 per second average in the probe | Probe at run time; owner's phone before Release 2 |
| Draw calls and triangles | 50 and 100,000 | By hand, from the renderer's counters |
| Text contrast | WCAG AA in both themes | By hand |
| Pages readable with JavaScript off | every address | By hand, each release |

**Security.** The admin key is typed, held in memory and never stored. No
server route is added. With the server stopped, every page still loads; chat
shows the offline notice and the feedback form reports failure.

**Rollout.** Release 1: install `nginx.conf`, confirm the old site, merge
`rebuild` to `main`. Rollback: `scripts/rollback.sh
$DEPLOY_PATH/archive/pre-rebuild`. Project and experience addresses keep
their slugs.

## Future Improvements

*   Load-time numbers and errors collected from visitors' browsers.
*   A preview address for unmerged work.
*   Remove the Google Fonts hosts from the policy.
*   Replace the hand-built desk with a phone 3D scan.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

Two releases. Within Release 1 the steps are ordered so that the project
builds after each one. Paths are relative to the repository root.

### Release 1: the text site

#### Step 1: Tooling

| File | Action | Change |
| --- | --- | --- |
| `package.json` | Modify | No package is removed in this step, because old files that import them exist until Step 4. Add development dependencies `vitest`, `@types/node`, `sharp`, `gray-matter`, `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify` (versions matching those `react-markdown` already installs), `@lhci/cli`. Scripts: `media`, `build` (media, `tsc -b`, browser build, build-side build, prerender), `test` (`vitest run`), `check:limits`, `lhci` |
| `package-lock.json` | Modify | Regenerated |
| `vite.config.ts` | Modify | `build.manifest: true`; remove `manualChunks`, `optimizeDeps` and the `.glsl` setting; strip only `console.log` and `console.debug`; `server.proxy` for `/api`; a `test` block for Vitest. The content plugin is added in Step 2 and the development render plugin in Step 3, when those files exist |
| `tsconfig.node.json` | Modify | Include `scripts/**/*.ts`; `"types": ["node"]` |
| `tsconfig.app.json` | Modify | Exclude `src/**/*.test.ts` from the app check; tests are checked through `tsconfig.node.json` |
| `eslint.config.js` | Modify | Ignore `build/`, `public/m/`, `.cache/` |
| `.gitignore` | Modify | Add `build/`, `public/m/`, `.cache/` |
| `tailwind.config.js` | Delete | Not loaded by Tailwind 4 (no `@config` in any stylesheet) |
| `components.json` | Delete | Configures an installer for a deleted folder |
| `test-navigation.html` | Delete | Unused test page |

Scripts are written in TypeScript where they hold logic that is tested, and
run by Vite or Vitest; `media.mjs`, `prerender.mjs` and `check-limits.mjs`
are plain JavaScript and not type checked.

#### Step 2: Content and media

| File | Action | Change |
| --- | --- | --- |
| `scripts/content/compile.ts` | Create | `compileEntry` and `compileAll(dir, mediaManifest)` as described under Content; pure functions |
| `scripts/content/compile.test.ts` | Create | One valid project, experience and about file; one case per validation rule |
| `scripts/content/plugin.ts` | Create | Vite plugin serving `virtual:content` and `virtual:knowledge` from `compileAll`; reloads on change in `content/` |
| `scripts/media.mjs` | Create | As described under Media |
| `src/content/types.ts` | Create | `Project`, `Experience`, `About`, `ChartConfig` (moved from `src/data/projects.ts`), `KnowledgeEntry` |
| `src/content/dates.ts` | Create | `formatPeriod` and `diffMonths`, moved from `src/data/experiences.ts`, taking `YYYY-MM` text |
| `src/vite-env.d.ts` | Modify | Declare both virtual modules |
| `content/about.md` | Create | Biography, skills and achievements from `getBasicContext` in `src/api/knowledgeBase.ts`; the "Website Features" lines are rewritten for the new site |
| `content/projects/blipt.md`, `reffy.md`, `liquid-glass-design.md`, `software-engineering-project.md`, `interactive-portfolio.md`, `cliniwatch.md`, `co2-gdp-explorer.md`, `job-ads-data-parsing.md`, `life-expectancy-prediction.md`, `persuasion-detection-memes.md` | Create | Text and chart data moved from `src/data/projects.ts`, slugs unchanged. `liquid-glass-design` and `interactive-portfolio` describe past work and stay as projects |
| `content/experience/ios-hackathon-2025.md`, `apple-foundation-1.md`, `urban-waste-1.md` | Create | Moved from `src/data/experiences.ts`, ids unchanged |
| `media/` | Create by moving | `public/Subject.png`, `blipt-icon.png`, `cliniwatch-2.png`, `gdpco2-1.png`, `portfolio-1.png`, `portfolio-2.png`, and the seven files of `public/experiences/` (to `media/experiences/`) |
| `media/cliniwatch-1.mp4`, `media/cliniwatch-poster.jpg` | Create | Compressed from `public/cliniwatch-1.MP4`; poster is its first frame |
| `public/cliniwatch-1.MP4`, `public/experiences/.gitkeep` | Delete | Replaced |
| `public/logo.png` | Modify | Resized to 180 pixels with `sips -Z 180`; favicon only |
| `public/og.png` | Create | 1200 by 630 screenshot of the finished home page hero; used for social tags |
| `public/fonts/archivo-var.woff2`, `public/fonts/space-grotesk-var.woff2` | Create | From the families' open-licence sources, subset to Latin and the weight axis with fonttools `pyftsubset` |
| `public/js-logo.png`, `python-logo.png`, `r-logo.png`, `react-logo.png`, `sql-logo.png`, `tensorflow-logo.png` | Delete | Skills are a text list in `content/about.md` |
| `public/.htaccess`, `public/_redirects` | Delete | The site is served by nginx; neither is read |
| `public/Patrick Adrianus - Resume.pdf`, `public/reffy-logo-dark.svg`, `public/reffy-logo-light.svg` | Keep | |

`src/data/projects.ts` and `src/data/experiences.ts` stay until Step 4
removes their last importers.

#### Step 3: Pages, rendered at build time

| File | Action | Change |
| --- | --- | --- |
| `src/routes.ts` | Create | `addresses(slugs)`, `titleFor(address)` |
| `src/routes.test.ts` | Create | Given two slug lists, every expected address is returned once |
| `src/entry-server.tsx` | Create | `render(address)` as described under Build-time rendering; head tags: title, description, canonical, `og:url`, `og:title`, `og:description`, `og:image` (`/og.png`), matching `twitter:` tags |
| `scripts/prerender.mjs` | Create | As described; also inserts `src/theme-inline.js` |
| `scripts/dev-render-plugin.ts` | Create | Serves pages in development through `render` |
| `index.html` | Modify | Remove Google Fonts links and the fixed title, description, canonical and social tags; add `<!--app-head-->` and `<!--app-html-->`; preload both fonts; change the script to `/src/client.ts`; keep the structured-data block |
| `src/client.ts` | Create | Theme toggle; pointer light (fine pointers, no reduced motion); island loader (`data-island`, `data-props`, triggers `click`, `visible`, `idle`, `now`); chat reopen; Ctrl/Cmd+Shift+F; `vite:preloadError` reload. Imports `src/index.css` |
| `src/theme.ts`, `src/theme-inline.js` | Create | As described under Theme |
| `src/theme.test.ts` | Create | The script's SHA-256 appears in `nginx.conf`; `setTheme('auto')` removes the key |
| `src/index.css` | Modify (rewrite) | Tailwind import; `@font-face`; theme variables; type scale; `.prose` rules for compiled Markdown; effects 1 to 4; `@view-transition` |
| `src/pages/Layout.tsx` | Create | Skip link, navigation bar, `<main>`, footer, chat button, feedback button |
| `src/pages/Home.tsx` | Create | Hero (headline; desk slot empty in Release 1), `SectionIndex`, about (`id="about"`, portrait, skills list), featured projects, timeline with 3 entries, contact (`id="contact"`) |
| `src/pages/Projects.tsx` | Create | Cards grouped by category, each group with an id (`mobile`, `development`, `ui-library`, `research`, `data-science`, `machine-learning`) |
| `src/pages/ProjectPage.tsx`, `src/pages/ExperiencePage.tsx` | Create | Cover, fields, `Prose`, links, previous and next |
| `src/pages/Experience.tsx` | Create | Full timeline |
| `src/pages/AdminFeedbackShell.tsx` | Create | Heading and `<div data-island="admin-feedback" data-trigger="now">` |
| `src/pages/NotFound.tsx` | Create | Message and links to `/`, `/projects`, `/experience` |
| `src/components/SiteNav.tsx` | Create | Replaces `src/components/NavBar.tsx`, which the old `src/App.tsx` imports and which is deleted in Step 4. Site name linking to `/`; links to `/projects`, `/experience`, `/#contact`; theme button; on narrow screens a `<details>` menu |
| `src/components/Footer.tsx` | Create | Contact links and resume link |
| `src/components/ProjectCard.tsx`, `Timeline.tsx`, `SectionIndex.tsx` | Create | Static markup; the card's cover carries `view-transition-name: cover-<slug>` |
| `src/components/Prose.tsx` | Create | Outputs compiled HTML; chart markers become `<div data-island="chart" data-trigger="visible" data-props="...">` with a fixed height |

At the end of this step `npm run build` produces the new pages from
`src/client.ts`. The old application files remain on disk and still type
check, because nothing they import has been deleted yet.

#### Step 4: Islands and removal of the old application

This step is one unit. Seven files it modifies are imported by old files
(`src/components/FloatingAssistant.tsx`, `FeedbackButton.tsx`,
`FeedbackViewer.tsx`, `ProjectDetail.tsx` and `src/App.tsx`), so the type
check fails partway through. The removal listed at the end of this step is
done first; the build is checked when the whole step is complete.

| File | Action | Change |
| --- | --- | --- |
| `src/islands/registry.ts` | Create | Maps island names to dynamic imports |
| `src/islands/ChatIsland.tsx` | Create | As described under Chat assistant; registers `navigate` and `setTheme` with the control service |
| `src/components/ChatWindow.tsx` | Modify | New props; remove `framer-motion`, `LiquidGlassLite` and `mobile-optimizations.css` imports; open and close animate with CSS; show `notice` text |
| `src/components/ChatAlignment.css`, `ChatScrollbar.css` | Keep | |
| `src/api/controlTypes.ts` | Modify | `Command = { type: 'navigate', address, title } \| { type: 'setTheme', choice }`; remove `WebsiteControls`, `LLMCommand` and the state response |
| `src/api/controlService.ts` | Modify | `parseCommand(text, knowledge)` implementing the command table; `execute(command)`; remove time, auto-sync, status and section-scroll code |
| `src/api/controlService.test.ts` | Create | "show me Reffy", "open projects", "dark mode", a sentence with no command |
| `src/api/knowledgeBase.ts` | Modify | Search `virtual:knowledge`; remove the hard-coded text and the imports of `src/data/` |
| `src/api/llmService.ts` | Modify | Read the error body before branching on status; return the three result kinds; remove section-based reply text |
| `src/api/types.ts` | Modify | Result type with `kind` |
| `src/islands/FeedbackIsland.tsx` | Create | Opens `FeedbackForm` in a `<dialog>` |
| `src/components/FeedbackForm.tsx` | Modify | Remove `framer-motion` and `LiquidGlass` imports; fields unchanged; show failure text from the service |
| `src/services/feedbackService.ts` | Modify | As described under Feedback |
| `src/types/feedback.ts` | Modify | Remove `offline`; `timestamp` becomes text |
| `src/islands/AdminFeedback.tsx` | Create | Key prompt, list, export, clear with confirmation, "Key rejected" on 401 |
| `src/islands/ChartIsland.tsx` | Create | Wraps `InteractiveChart` |
| `src/components/InteractiveChart.tsx` | Modify | Remove `framer-motion`; import `ChartConfig` from `src/content/types.ts` |
| `src/components/ErrorBoundary.tsx` | Keep | Wraps each island |
| `server/index.js` | Modify | Move the ledger setup below `DATA_DIR`; read and write `llm-ledger.json` as described; add `code: 'budget_exhausted'` to the budget response |
| `server/test/llm-chat.test.js` | Modify | Build the app twice on one `DATA_DIR` and check the count carries over; budget response has the code |
| `server/test/admin-auth.test.js`, `feedback-concurrency.test.js`, `helpers.js`, `server/package.json`, `server/package-lock.json`, `server/data/feedback.json` | Keep | |

Removed in this step, before the modifications above: everything the new
entry does not use.

Packages removed from `package.json`: `framer-motion`, `gsap`, `lenis`,
`face-api.js`, `ogl`, `postprocessing`, `@react-three/postprocessing`,
`troika-three-text`, `stats.js`, `liquid-glass-react`, `simplex-noise`,
`@types/stats.js`, `shadcn`, `@tailwindcss/typography` (no stylesheet loads
it). `three`, `@react-three/fiber` and `@react-three/drei` stay for
Release 2. `package-lock.json` is regenerated.

Files deleted:

*   `src/main.tsx`, `src/App.tsx`, `src/App.css`
*   `src/data/projects.ts`, `src/data/experiences.ts`
*   `src/contexts/LoadingContext.tsx`, `src/contexts/TimeContext.tsx`
*   All of `src/hooks/` (`useAssetPreloader.ts`, `useHudBus.ts`,
    `useInViewport.ts`, `useMagnetic.ts`, `useScrollPerformance.ts`,
    `useScrollSpy.ts`)
*   All of `src/utils/` (`colors.ts`, `glassQuality.ts`, `imagePreloader.ts`,
    `lenis.ts`, `mobileDetection.ts`, `navigation.ts`, `performance.ts`,
    `preloadedImageHooks.tsx`, `preloadedVideoHooks.tsx`, `router.ts`,
    `shader-utils.ts`, `throttle.ts`, `useImageHooks.ts`, `utils.ts`)
*   In `src/components/`: `AssistantIcon.tsx`, `AssistantOrb.tsx`,
    `AssistantOrb.css`, `AuroraShader.tsx`, `BirthdayCake.tsx`,
    `BirthdayLetter.tsx`, `BirthdayPage.tsx`, `CameraWheel.tsx`,
    `CircularLoader.tsx`, `Contact.tsx`, `CursorSpotlight.tsx`,
    `DustToOrbLoader.tsx`, `ExperienceDetail.tsx`, `ExperienceSection.tsx`,
    `FeedbackButton.tsx`, `FeedbackManager.tsx`, `FeedbackViewer.tsx`,
    `FilmGrain.tsx`, `FilmGrain.css`, `FloatingAssistant.tsx`,
    `GlassFilter.tsx`, `GlassOrb.tsx`, `GlobalFeedbackShortcut.tsx`,
    `HeroSection.tsx`, `LiquidGlass.tsx`, `LiquidGlassLite.tsx`, `Logo.tsx`,
    `MobileComingSoon.tsx`, `NavBar.tsx`, `ProjectDetail.tsx`, `ProjectsSection.tsx`,
    `README.md`, `SEO.tsx.disabled`, `ScrollProgress.tsx`,
    `SkillsMarquee.tsx`, `SkillsMarquee.css`, `TechBackground.tsx`,
    `TechSphere.tsx`, `TechSphere.css`, `TerminalHud.tsx`,
    `TerminalHud.css`, `background.css`, `mobile-optimizations.css`,
    `performance.css`, `tech-background.css`, and the folders `animations/`,
    `common/` and `visuals/`

#### Step 5: Limits, server config and deploy

| File | Action | Change |
| --- | --- | --- |
| `scripts/check-limits.mjs` | Create | For each `dist/**/index.html`: sum the gzip size of its module scripts and their static imports from the manifest, limit 30 KB. Chat group (manifest entry `src/islands/ChatIsland.tsx` and its static imports), limit 150 KB. Fonts, images, video by file size. A group with no manifest entry is skipped, which covers the desk until Release 2 |
| `scripts/check-limits.test.mjs` | Create | A small fake `dist` over and under each limit |
| `lighthouserc.json` | Create | `staticDistDir: dist`; addresses `/` and `/projects/reffy/`; 5 runs; mobile preset; assertions as warnings |
| `nginx.conf` | Modify | As described under Build, checks and deploy |
| `.github/workflows/deploy.yml` | Modify | Two jobs as described; health check; archive guard; remove `\|\| true` from the restart |
| `scripts/rollback.sh` | Create | As described |
| `.env.example` | Modify | The shortcut comment says it opens `/admin/feedback`; document `LLM_DAILY_TOKEN_BUDGET` and `DATA_DIR` if absent |
| `secure-env-setup.sh` | Modify | Prompt for `ADMIN_API_KEY` in place of `ADMIN_PASSWORD_HASH` |
| `README.md` | Modify (rewrite) | What the site is; run, build, test, deploy; how to add a project; limits; rollback; baseline and new Lighthouse numbers |
| `.gitattributes`, `.gitignore.security`, `.claude/launch.json`, `tsconfig.json` | Keep | |
| `docs/designs/portfolio-rebuild-brief.md` | Keep | The brainstorm record |
| `docs/superpowers/plans/*.md`, `docs/superpowers/specs/*.md` | Keep | Historical plans for the old site |
| `design_draft.md`, `zoom_out_report.md`, `comprehension_report.md`, `critic_report.md`, `intermediate_zoom_out_report.md`, `implementation_readiness_report.md`, `consolidated_review_report.md` | Delete | Working files of the design process; removed once this design is approved |
| `media/desk/` | Keep, ignored by git | Reference photos; they show personal items and are not published |

#### Release 1 checks

*   `npm run lint`, `tsc -b`, `npm test`, `npm test` in `server/`,
    `npm run build`, `npm run check:limits` all pass.
*   With JavaScript off, each address shows its text and its links load.
*   With the server stopped, each page loads; the chat shows the offline
    notice; the feedback form reports failure.
*   Keyboard only: every project and experience page is reachable; focus is
    visible.
*   `prefers-reduced-motion: reduce` set in the browser's developer tools:
    effects 1 to 4 do not run.
*   Each theme: reload with CPU throttled 6x while recording a performance
    trace; no frame shows the other theme.
*   `/admin/feedback`: the real key lists server feedback; a wrong key shows
    "Key rejected".
*   Chat: "show me Reffy" loads `/projects/reffy` and the panel reopens with
    its messages.
*   After a deploy, a page opened before it still reaches other pages.
*   The Lighthouse report for `/` and `/projects/reffy/` is read and its
    numbers recorded in `README.md` beside the baseline.

### Release 2: the desk

| File | Action | Change |
| --- | --- | --- |
| `src/islands/desk/objects.ts` | Create | The object table as data: id, label, `{ href }` or `{ action: 'theme' \| 'chat' }`, hotspot rectangle in percent, 3D position |
| `src/islands/desk/gates.ts` | Create | `canRun3D(env)` returning true or false from the three gates |
| `src/islands/desk/probe.ts` | Create | `decide(frameTimes)` returning `keep` or `still` |
| `src/islands/desk/desk.test.ts` | Create | Each gate; averages of 29 and 31 frames per second |
| `src/islands/desk/DeskIsland.tsx` | Create | Canvas, camera, lighting per theme (listens to `onThemeChange`), probe, switch to drawing on change, removal on context loss, capture mode |
| `src/islands/desk/DeskObject.tsx` | Create | Hover and focus rise, label, click runs the object's link or action |
| `src/islands/desk/objects/Surface.tsx`, `Chair.tsx`, `Monitor.tsx`, `MacBook.tsx`, `IPad.tsx`, `Camera.tsx`, `Lamp.tsx`, `Duck.tsx`, `Keyboard.tsx`, `Mouse.tsx`, `Coaster.tsx`, `Charger.tsx`, `Headphones.tsx`, `Plant.tsx`, `Figure.tsx` | Create | One component each, from basic shapes and flat colours; the monitor and MacBook screens show project screenshots from `media/` |
| `src/components/DeskStill.tsx` | Create | The still for each theme with hotspots from the table; buttons are wired by `src/client.ts` |
| `media/desk-stills/desk-dark.png`, `desk-light.png` | Create | Saved from capture mode |
| `src/pages/Home.tsx` | Modify | The hero holds `DeskStill` and the desk island placeholder in a box with a fixed 16:9 ratio |
| `src/client.ts` | Modify | Run the gates before loading the desk island; wire the still's buttons |
| `src/islands/registry.ts` | Modify | Add `desk` |
| `scripts/check-limits.mjs` | Modify | Add the still limit; the desk group now has a manifest entry and is checked |
| `README.md` | Modify | Desk section: how to add an object, how to re-save the stills |

Order: `Surface` and `Monitor` first, then the trial gate on the owner's
phone, then the remaining objects, then the stills.

#### Release 2 checks

*   Release 1 checks still pass.
*   Owner's phone: the probe keeps the scene, or the still remains and its
    six hotspots work.
*   Desktop: each of the six objects shows its label on hover and on
    keyboard focus and performs its link or action.
*   Reduced motion, data saving, and WebGL disabled: no desk code is
    requested (seen in the network panel).
*   Development counters show at most 50 draw calls and 100,000 triangles.

--------------------------------------------------------------------------------

*Drafted with EGM*
