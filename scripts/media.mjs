// Media step: media/** -> public/m/<name>.<width>.<hash>.<ext> and .cache/media.json
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'media';
const OUT = 'public/m';
const WIDTHS = [480, 960, 1440];
const SKIP = ['desk']; // owner's reference photos; never published

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync('.cache', { recursive: true });

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP.includes(path.relative(SRC, p)) ? [] : walk(p);
    return /\.(png|jpe?g|mp4)$/i.test(e.name) ? [p] : [];
  });

const manifest = {};
const produced = new Set();

for (const file of walk(SRC)) {
  const key = path.relative(SRC, file).split(path.sep).join('/');
  const name = key.replace(/\.[^.]+$/, '').replace(/\//g, '-');
  const buffer = fs.readFileSync(file);
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 8);

  if (/\.mp4$/i.test(file)) {
    const out = `${name}.${hash}.mp4`;
    if (!fs.existsSync(path.join(OUT, out))) fs.writeFileSync(path.join(OUT, out), buffer);
    produced.add(out);
    manifest[key] = { file: `/m/${out}` };
    continue;
  }

  const meta = await sharp(buffer).metadata();
  const { width, height } = meta.autoOrient ?? meta; // honours camera rotation
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length) widths.push(width);
  const variants = [];
  for (const w of widths) {
    const variant = { w };
    for (const [ext, options] of [['avif', { quality: 50 }], ['webp', { quality: 60 }]]) {
      const out = `${name}.${w}.${hash}.${ext}`;
      // ponytail: reuse by content hash; delete public/m to force a re-encode
      if (!fs.existsSync(path.join(OUT, out))) {
        await sharp(buffer).rotate().resize({ width: w })[ext](options).toFile(path.join(OUT, out));
      }
      produced.add(out);
      variant[ext] = `/m/${out}`;
    }
    variants.push(variant);
  }
  const top = widths[widths.length - 1];
  manifest[key] = { width: top, height: Math.round((height * top) / width), variants };
}

for (const f of fs.readdirSync(OUT)) if (!produced.has(f)) fs.rmSync(path.join(OUT, f));
fs.writeFileSync('.cache/media.json', JSON.stringify(manifest, null, 2));
console.log(`media: ${Object.keys(manifest).length} sources, ${produced.size} files in ${OUT}`);
