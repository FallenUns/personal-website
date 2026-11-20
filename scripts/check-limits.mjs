// Fails the build when a size limit from the design's Non-Functional
// Requirements is exceeded. JavaScript sizes are gzip level 9.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import zlib from 'node:zlib';

const KB = 1024;
export const LIMITS = {
  pageJs: 30 * KB,
  chat: 150 * KB,
  desk: 250 * KB,
  fonts: 120 * KB,
  fontFiles: 2,
  image: 200 * KB,
  video: 4 * KB * KB,
};

const GROUPS = [
  ['chat island', 'src/islands/ChatIsland.tsx', 'chat'],
  ['desk scene', 'src/islands/desk/DeskIsland.tsx', 'desk'], // absent until Release 2: skipped
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const kb = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

/** Returns { failures, report }; an empty failures list means every limit holds. */
export function check(dist) {
  const failures = [];
  const report = [];
  const measure = (label, size, limit) => {
    report.push(`${size > limit ? 'FAIL' : 'ok  '} ${label}: ${kb(size)} of ${kb(limit)}`);
    if (size > limit) failures.push(`${label} is ${kb(size)}; the limit is ${kb(limit)}`);
  };

  const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));
  const gzip = (file) => zlib.gzipSync(fs.readFileSync(path.join(dist, file)), { level: 9 }).length;
  // A chunk plus everything it statically imports: what the browser must fetch to run it.
  const group = (key, seen = new Set()) => {
    if (seen.has(key) || !manifest[key]) return 0;
    seen.add(key);
    return gzip(manifest[key].file) + (manifest[key].imports ?? []).reduce((sum, k) => sum + group(k, seen), 0);
  };
  const keyOf = (file) => Object.keys(manifest).find((k) => manifest[k].file === file);

  const files = walk(dist);
  const rel = (f) => path.relative(dist, f).split(path.sep).join('/');

  // JavaScript a page loads before the visitor interacts
  let worst = { size: 0, page: '' };
  for (const html of files.filter((f) => f.endsWith('.html'))) {
    const scripts = [...fs.readFileSync(html, 'utf8').matchAll(/<script[^>]+type="module"[^>]+src="\/([^"]+)"/g)];
    const seen = new Set();
    const size = scripts.reduce((sum, m) => sum + group(keyOf(m[1]), seen), 0);
    if (size >= worst.size) worst = { size, page: rel(html) };
  }
  measure(`page JavaScript (largest: ${worst.page})`, worst.size, LIMITS.pageJs);

  for (const [label, key, limit] of GROUPS) {
    if (manifest[key]) measure(label, group(key), LIMITS[limit]);
    else report.push(`skip ${label}: not in this build`);
  }

  const fonts = files.filter((f) => /\.(woff2?|ttf|otf)$/.test(f));
  measure('fonts', fonts.reduce((sum, f) => sum + fs.statSync(f).size, 0), LIMITS.fonts);
  if (fonts.length > LIMITS.fontFiles) failures.push(`${fonts.length} font files; the limit is ${LIMITS.fontFiles}`);

  for (const f of files) {
    const size = fs.statSync(f).size;
    if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(f) && size > LIMITS.image) measure(`image ${rel(f)}`, size, LIMITS.image);
    if (/\.mp4$/i.test(f) && size > LIMITS.video) measure(`video ${rel(f)}`, size, LIMITS.video);
  }
  return { failures, report };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { failures, report } = check('dist');
  console.log(report.join('\n'));
  if (failures.length) {
    console.error(`\ncheck-limits: ${failures.length} limit(s) exceeded\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  console.log('\ncheck-limits: all limits hold');
}
