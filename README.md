# patrickadrianus.com

Personal portfolio of Patrick Adrianus. Every page is a finished HTML file, so
text is readable before any JavaScript runs. Interactive parts (chat assistant,
feedback form, charts, admin page) load their own code only when used.

Design and decisions: [docs/designs/portfolio-rebuild-3d-desk.md](docs/designs/portfolio-rebuild-3d-desk.md).
This is Release 1 (the text site). Release 2 adds a 3D desk to the home page.

## Run

```bash
npm install
npm run dev          # site on http://localhost:5173
```

The chat and feedback features need the backend:

```bash
cd server && npm install
cp ../.env.example .env   # set LLM_API_KEY and ADMIN_API_KEY
npm start                 # http://localhost:3001; the dev site forwards /api to it
```

With the backend stopped the site still works; the chat and the feedback form
say they could not reach the server.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Resizes media, then serves pages rendered on request |
| `npm run build` | Media step, type check, browser build, build-side build, one HTML file per address in `dist/` |
| `npm test` | Vitest: content compiler, routes, theme, chat commands, size checker |
| `npm run lint` | ESLint |
| `npm run check:limits` | Fails when a size limit is exceeded (run after a build) |
| `npm test` in `server/` | Backend tests |

## How it is put together

```text
content/**/*.md ──> scripts/content/compile.ts ──> entries (HTML + fields)
media/**       ──> scripts/media.mjs ──────────> public/m/<name>.<width>.<hash>.avif|webp
src/pages/*    ──> src/entry-server.tsx renders each address to a string
               ──> scripts/prerender.mjs writes dist/<address>/index.html and dist/404.html
```

- `src/client.ts` is the only script every page loads. It wires the theme
  button and loads **islands**: elements marked `data-island`, whose code
  (`src/islands/`) loads on click, when scrolled into view, or at once.
- Pages are React components rendered at build time only. No page code ships
  to the browser.
- Links are ordinary page loads. Browsers that support cross-document View
  Transitions animate between pages.
- The theme is `dark` or `light` in `localStorage` under `theme`; with no saved
  choice it is dark from 17:00 to 05:00. `src/theme-inline.js` applies it before
  first paint. `nginx.conf` allows that script by hash, and a test fails when
  the two drift apart.

## Add a project

1. Put images in `media/` (PNG or JPEG; any size, they are resized).
2. Create `content/projects/<slug>.md`:

   ```markdown
   ---
   title: My project
   summary: One sentence, at most 200 characters.
   category: Mobile        # Mobile, Development, UI Library, Research, Data Science, Machine Learning
   technologies: [Swift, SwiftUI]
   order: 10               # lower shows first
   featured: true          # optional: show on the home page
   cover: my-shot.png      # optional; needs coverAlt
   coverAlt: What the picture shows
   links:
     - { label: Live site, url: https://example.com }
   ---

   Body in Markdown.

   ![What the picture shows](another-shot.png "Optional caption")

   ::video{src="demo.mp4" poster="demo-poster.jpg"}

   ::chart{id="accuracy"}
   ```

   A `::chart` marker names an entry in a `charts` list in the front matter
   (see `content/projects/life-expectancy-prediction.md`). An image path with a
   leading slash is a file in `public/` and is used as it is.

3. `npm run dev`. A missing field, an image with no description or an unknown
   category stops the build with the file name and the rule.

Experience entries live in `content/experience/` (`role`, `company`, `start`
and `end` as `YYYY-MM`, `location`, `summary`). `content/about.md` holds the
about text. The chat assistant reads all of it.

## Limits

`npm run check:limits` blocks a deploy when one is exceeded. Sizes are gzip
level 9 for JavaScript and file size for media.

| What | Limit | Release 1 build |
| --- | --- | --- |
| JavaScript a page loads before interaction | 30 KB | 1.9 KB |
| Chat island with its Markdown reader | 150 KB | 110 KB |
| Fonts | 2 files, 120 KB | 56 KB |
| Any image file | 200 KB | largest 177 KB |
| Video | 4 MB | 0.2 MB |
| Desk scene (Release 2) | 250 KB | not built yet |

The site before the rebuild loaded about 664 KB of gzip-compressed JavaScript
on every page and 3 to 6.5 MB per image.

Lighthouse runs in CI as a report that cannot fail the job. Numbers to record
here once measured: baseline of the old live site (not measured yet) and the
new site (not measured yet).

## Deploy

`.github/workflows/deploy.yml` has two jobs. `check` runs on every push: lint,
tests, server tests, build, size limits, Lighthouse report. `deploy` needs
`check` and runs only on `main`: it uploads `dist/` and `server/` to
`$DEPLOY_PATH/releases/<commit>`, points `current` and `html` at it, restarts
`portfolio-server`, and fails unless `/api/health` answers.

`nginx.conf` is uploaded but installed by hand. It serves both this build and
the build from before the rebuild, so install it before merging:

```bash
sudo cp "$DEPLOY_PATH/nginx.conf" /etc/nginx/sites-available/patrickadrianus.com
sudo nginx -t && sudo systemctl reload nginx
```

### Roll back

On the server:

```bash
DEPLOY_PATH=/var/www ./rollback.sh /var/www/archive/pre-rebuild
```

The first deploy of the rebuild copies the previous live release to
`archive/pre-rebuild`. Any folder under `releases/` works the same way.

## Backend

`server/index.js` (Express): `POST /api/llm/chat`, `POST /api/feedback`, and
admin routes `GET /api/feedback`, `GET /api/feedback/export-csv`,
`DELETE /api/feedback`, which need the `x-admin-api-key` header.
`/admin/feedback` asks for that key and keeps it in memory only.
Ctrl/Cmd + Shift + F opens that page.

The chat stops for the day after `LLM_DAILY_TOKEN_BUDGET` tokens (default
100,000). The count is kept in `DATA_DIR/llm-ledger.json`.

## Working inside iCloud Drive

If this folder is synced by iCloud, `node_modules` must stay out of sync or
builds stall. Keep the real folder as `node_modules.nosync` with a link:

```bash
mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules
```

`npm install` replaces the link with a real folder, so repeat the line above
after each install (and the same in `server/`).
