// Content compiler: Markdown files with front matter -> entries (HTML + fields).
// Pure functions; the Vite plugin and the tests both call them.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import {
  CATEGORIES,
  type About,
  type ChartConfig,
  type Content,
  type Experience,
  type KnowledgeEntry,
  type Link,
  type MediaManifest,
  type Picture,
  type Project,
} from '../../src/content/types';

type Data = Record<string, unknown>;
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const fail = (file: string, message: string): never => {
  throw new Error(`${file}: ${message}`);
};

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const text = (d: Data, key: string, file: string): string => {
  const v = d[key];
  if (typeof v !== 'string' || !v.trim()) return fail(file, `"${key}" is required and must be text`);
  return v.trim();
};

const textList = (d: Data, key: string, file: string, required: boolean): string[] => {
  const v = d[key];
  if (v === undefined && !required) return [];
  if (!Array.isArray(v) || v.some((i) => typeof i !== 'string')) return fail(file, `"${key}" must be a list of text`);
  return v as string[];
};

const links = (d: Data, file: string): Link[] => {
  const v = d.links;
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((l) => typeof l?.label !== 'string' || typeof l?.url !== 'string'))
    return fail(file, '"links" must be a list of { label, url }');
  return v as Link[];
};

/** A path with a leading slash is a file in public/, used as it is. Anything else is looked up in media/. */
export function resolveImage(ref: string, manifest: MediaManifest, file: string): Picture {
  if (ref.startsWith('/')) return { src: ref };
  const m = manifest[ref];
  if (!m || !('variants' in m)) return fail(file, `image "${ref}" not found in media/`);
  const srcset = (kind: 'avif' | 'webp') => m.variants.map((v) => `${v[kind]} ${v.w}w`).join(', ');
  return {
    src: m.variants[m.variants.length - 1].webp,
    width: m.width,
    height: m.height,
    avif: srcset('avif'),
    webp: srcset('webp'),
  };
}

const SIZES = '(min-width: 60rem) 56rem, 100vw';

function figureHtml(p: Picture, alt: string, caption?: string): string {
  const size = p.width ? ` width="${p.width}" height="${p.height}"` : '';
  const img = `<img src="${escapeHtml(p.src)}" alt="${escapeHtml(alt)}"${size} loading="lazy" decoding="async">`;
  const picture = p.avif
    ? `<picture><source type="image/avif" srcset="${p.avif}" sizes="${SIZES}"><source type="image/webp" srcset="${p.webp}" sizes="${SIZES}">${img}</picture>`
    : img;
  return `<figure>${picture}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
}

const attrs = (s: string) => Object.fromEntries([...s.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

/** Replaces `::video{...}` and `::chart{...}` lines with HTML before Markdown runs. */
function directives(body: string, charts: ChartConfig[], manifest: MediaManifest, file: string): string {
  return body.replace(/^::(video|chart)\{(.*)\}[ \t]*$/gm, (_line, kind: string, raw: string) => {
    const a = attrs(raw);
    if (kind === 'chart') {
      const chart = charts.find((c) => c.id === a.id);
      if (!chart) return fail(file, `chart marker "${a.id}" has no matching entry in "charts"`);
      return `\n<div class="chart-slot" data-island="chart" data-trigger="visible" data-props="${escapeHtml(JSON.stringify(chart))}"><p>${escapeHtml(chart.title)} (chart, needs JavaScript)</p></div>\n`;
    }
    const video = manifest[a.src];
    if (!video || !('file' in video)) return fail(file, `video "${a.src}" not found in media/`);
    const poster = a.poster ? ` poster="${resolveImage(a.poster, manifest, file).src}"` : '';
    return `\n<video controls playsinline preload="none"${poster}><source src="${video.file}" type="video/mp4"></video>\n`;
  });
}

/** Turns every Markdown image into a <figure>; a paragraph holding only an image is replaced by it. */
function images(manifest: MediaManifest, file: string) {
  const toFigure = (img: HastNode): HastNode => {
    const { src, alt, title } = img.properties as { src: string; alt?: string; title?: string };
    if (!alt?.trim()) fail(file, `image "${src}" has no description`);
    return { type: 'raw', value: figureHtml(resolveImage(src, manifest, file), alt!, title) };
  };
  const isImg = (n: HastNode) => n.type === 'element' && n.tagName === 'img';
  const walk = (node: HastNode) => {
    node.children = node.children?.map((child) => {
      if (isImg(child)) return toFigure(child);
      const solid = child.children?.filter((c) => c.type !== 'text' || c.value?.trim()) ?? [];
      if (child.tagName === 'p' && solid.length === 1 && isImg(solid[0])) return toFigure(solid[0]);
      walk(child);
      return child;
    });
  };
  return () => (tree: HastNode) => walk(tree);
}

function markdown(body: string, charts: ChartConfig[], manifest: MediaManifest, file: string) {
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(images(manifest, file) as never)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(directives(body, charts, manifest, file)),
  );
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;|&#x22;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return { html, text: plain };
}

function charts(d: Data, file: string): ChartConfig[] {
  const v = d.charts;
  if (v === undefined) return [];
  if (!Array.isArray(v)) return fail(file, '"charts" must be a list');
  for (const c of v as ChartConfig[]) {
    const ok =
      typeof c?.id === 'string' &&
      typeof c.type === 'string' &&
      typeof c.title === 'string' &&
      Array.isArray(c.data) &&
      typeof c.xAxisKey === 'string' &&
      Array.isArray(c.yAxisKeys);
    if (!ok) fail(file, 'each chart needs id, type, title, data, xAxisKey and yAxisKeys');
  }
  return v as ChartConfig[];
}

const optionalImage = (d: Data, key: string, manifest: MediaManifest, file: string) =>
  d[key] === undefined ? undefined : resolveImage(text(d, key, file), manifest, file);

/** A cover needs a description like any other image. */
const cover = (d: Data, manifest: MediaManifest, file: string) => {
  if (d.cover === undefined) return {};
  if (typeof d.coverAlt !== 'string' || !d.coverAlt.trim()) fail(file, `image "${d.cover}" has no description (add coverAlt)`);
  return { cover: optionalImage(d, 'cover', manifest, file), coverAlt: (d.coverAlt as string).trim() };
};

export type Entry =
  | ({ kind: 'project' } & Project)
  | ({ kind: 'experience' } & Experience)
  | ({ kind: 'about' } & About);

/** `file` is the path relative to the content folder, for example `projects/reffy.md`. */
export function compileEntry(file: string, source: string, manifest: MediaManifest): Entry {
  const { data, content } = matter(source) as { data: Data; content: string };
  const slug = path.basename(file, '.md');

  if (file === 'about.md') {
    return {
      kind: 'about',
      title: text(data, 'title', file),
      summary: text(data, 'summary', file),
      portrait: resolveImage(text(data, 'portrait', file), manifest, file),
      ...markdown(content, [], manifest, file),
    };
  }

  if (file.startsWith('projects/')) {
    const summary = text(data, 'summary', file);
    if (summary.length > 200) fail(file, `"summary" is ${summary.length} characters; the limit is 200`);
    const category = text(data, 'category', file) as Project['category'];
    if (!CATEGORIES.includes(category)) fail(file, `unknown category "${category}"`);
    if (typeof data.order !== 'number') fail(file, '"order" is required and must be a number');
    const status = data.status ?? 'live';
    if (status !== 'live' && status !== 'coming-soon') fail(file, '"status" must be live or coming-soon');
    const chartList = charts(data, file);
    return {
      kind: 'project',
      slug,
      title: text(data, 'title', file),
      summary,
      category,
      technologies: textList(data, 'technologies', file, true),
      order: data.order as number,
      featured: data.featured === true,
      status: status as Project['status'],
      ...cover(data, manifest, file),
      coverDark: optionalImage(data, 'coverDark', manifest, file),
      accent: data.accent === undefined ? undefined : text(data, 'accent', file),
      links: links(data, file),
      ...markdown(content, chartList, manifest, file),
    };
  }

  if (file.startsWith('experience/')) {
    const month = (key: string, allowPresent: boolean) => {
      const v = String(data[key] ?? '');
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v) && !(allowPresent && v === 'present'))
        fail(file, `"${key}" must be YYYY-MM${allowPresent ? ' or present' : ''}`);
      return v;
    };
    return {
      kind: 'experience',
      slug,
      role: text(data, 'role', file),
      company: text(data, 'company', file),
      start: month('start', false),
      end: month('end', true),
      location: text(data, 'location', file),
      summary: text(data, 'summary', file),
      skills: textList(data, 'skills', file, false),
      links: links(data, file),
      ...cover(data, manifest, file),
      ...markdown(content, [], manifest, file),
    };
  }

  return fail(file, 'content files belong in about.md, projects/ or experience/');
}

export function compileAll(dir: string, manifest: MediaManifest): Content {
  const read = (file: string) => compileEntry(file, fs.readFileSync(path.join(dir, file), 'utf8'), manifest);
  const folder = (name: string) =>
    fs
      .readdirSync(path.join(dir, name))
      .filter((f) => f.endsWith('.md'))
      .map((f) => read(`${name}/${f}`));
  const strip = <T extends { kind: string }>({ kind, ...rest }: T) => (void kind, rest);
  return {
    about: strip(read('about.md')) as About,
    projects: (folder('projects').map(strip) as Project[]).sort((a, b) => a.order - b.order),
    experiences: (folder('experience').map(strip) as Experience[]).sort((a, b) => b.start.localeCompare(a.start)),
  };
}

/** Plain text per entry for the chat assistant. */
export function toKnowledge(c: Content): KnowledgeEntry[] {
  return [
    { title: c.about.title, address: '/#about', summary: c.about.summary, text: c.about.text },
    ...c.projects.map((p) => ({
      title: p.title,
      address: `/projects/${p.slug}`,
      summary: p.summary,
      text: `Project (${p.category}). Technologies: ${p.technologies.join(', ')}. ${p.text}`,
    })),
    ...c.experiences.map((e) => ({
      title: `${e.role} at ${e.company}`,
      address: `/experience/${e.slug}`,
      summary: e.summary,
      text: `Experience, ${e.start} to ${e.end}, ${e.location}. Skills: ${e.skills.join(', ')}. ${e.text}`,
    })),
  ];
}
