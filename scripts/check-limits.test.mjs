import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { check } from './check-limits.mjs';

// Random bytes do not compress, so a file's gzip size is about its length.
function fakeDist({ entry = 1000, shared = 1000, chat = 1000, image = 1000, fonts = [1000], video = 1000 } = {}) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'limits-'));
  const write = (file, size) => {
    fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
    fs.writeFileSync(path.join(dist, file), crypto.randomBytes(size));
  };
  write('assets/entry.js', entry);
  write('assets/shared.js', shared);
  write('assets/chat.js', chat);
  write('m/photo.webp', image);
  write('m/clip.mp4', video);
  fonts.forEach((size, i) => write(`fonts/f${i}.woff2`, size));
  fs.mkdirSync(path.join(dist, '.vite'));
  fs.writeFileSync(
    path.join(dist, '.vite/manifest.json'),
    JSON.stringify({
      'index.html': { file: 'assets/entry.js', isEntry: true, dynamicImports: ['src/islands/ChatIsland.tsx'] },
      '_shared.js': { file: 'assets/shared.js' },
      'src/islands/ChatIsland.tsx': { file: 'assets/chat.js', imports: ['_shared.js'] },
    }),
  );
  fs.writeFileSync(path.join(dist, 'index.html'), '<script type="module" crossorigin src="/assets/entry.js"></script>');
  return dist;
}

const KB = 1024;

it('passes a build under every limit and skips the absent desk', () => {
  const { failures, report } = check(fakeDist());
  expect(failures).toEqual([]);
  expect(report.join('\n')).toContain('skip desk scene');
});

it.each([
  ['page JavaScript', { entry: 31 * KB }, /page JavaScript/],
  ['the chat island with its static imports', { chat: 100 * KB, shared: 60 * KB }, /chat island/],
  ['an image', { image: 201 * KB }, /image m\/photo.webp/],
  ['fonts in total', { fonts: [70 * KB, 60 * KB] }, /fonts is/],
  ['a third font file', { fonts: [10, 10, 10] }, /3 font files/],
  ['the video', { video: 4 * KB * KB + 1 }, /video m\/clip.mp4/],
])('fails on %s over its limit', (_name, sizes, message) => {
  const { failures } = check(fakeDist(sizes));
  expect(failures).toHaveLength(1);
  expect(failures[0]).toMatch(message);
});

it('does not count lazily loaded code against the page', () => {
  // 140 KB of chat code is fine for the chat limit and must not touch the 30 KB page limit.
  expect(check(fakeDist({ chat: 80 * KB, shared: 60 * KB })).failures).toEqual([]);
});
