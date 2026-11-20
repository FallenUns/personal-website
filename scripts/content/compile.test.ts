import { describe, expect, it } from 'vitest';
import type { MediaManifest } from '../../src/content/types';
import { compileEntry } from './compile';

const manifest: MediaManifest = {
  'shot.png': { width: 960, height: 540, variants: [{ w: 960, avif: '/m/shot.960.aa.avif', webp: '/m/shot.960.aa.webp' }] },
  'demo.mp4': { file: '/m/demo.aa.mp4' },
};

const project = (front = '', body = 'Body text.') => `---
title: Demo
summary: A demo project.
category: Mobile
technologies: [Swift]
order: 1
${front}---

${body}
`;

const compile = (source: string, file = 'projects/demo.md') => compileEntry(file, source, manifest);

describe('compileEntry', () => {
  it('compiles a project with image, video and chart', () => {
    const chart = 'charts:\n  - { id: acc, type: bar, title: Accuracy, data: [{ n: a, v: 1 }], xAxisKey: n, yAxisKeys: [v] }\n';
    const entry = compile(
      project(`cover: shot.png\ncoverAlt: A cover\n${chart}`, '![A screenshot](shot.png "Caption")\n\n::video{src="demo.mp4"}\n\n::chart{id="acc"}'),
    );
    if (entry.kind !== 'project') throw new Error('expected a project');
    expect(entry.slug).toBe('demo');
    expect(entry.cover?.avif).toBe('/m/shot.960.aa.avif 960w');
    expect(entry.html).toContain('<figure><picture>');
    expect(entry.html).toContain('alt="A screenshot" width="960" height="540"');
    expect(entry.html).toContain('<figcaption>Caption</figcaption>');
    expect(entry.html).toContain('<source src="/m/demo.aa.mp4"');
    expect(entry.html).toContain('data-island="chart"');
    expect(entry.html).not.toContain('<p><figure>');
    expect(entry.text).toContain('Caption');
  });

  it('uses a leading-slash image path as it is', () => {
    const entry = compile(project('', '![Logo](/logo.svg)'));
    expect(entry.html).toContain('<img src="/logo.svg" alt="Logo"');
  });

  it('compiles an experience and the about file', () => {
    const exp = compile(
      '---\nrole: Intern\ncompany: Acme\nstart: 2022-12\nend: present\nlocation: Melbourne\nsummary: Did things.\n---\n\nText.',
      'experience/acme.md',
    );
    expect(exp).toMatchObject({ kind: 'experience', slug: 'acme', end: 'present', skills: [] });
    expect(compile('---\ntitle: About\nsummary: Me.\nportrait: shot.png\n---\n\nHello.', 'about.md')).toMatchObject({ kind: 'about', text: 'Hello.' });
  });

  it.each([
    ['a missing required field', project().replace('title: Demo\n', ''), /"title" is required/],
    ['a field of the wrong type', project().replace('order: 1', 'order: first'), /"order" is required and must be a number/],
    ['a summary over 200 characters', project().replace('A demo project.', 'x'.repeat(201)), /limit is 200/],
    ['an unknown category', project().replace('Mobile', 'Gardening'), /unknown category "Gardening"/],
    ['an image with no description', project('', '![](shot.png)'), /has no description/],
    ['a cover with no description', project('cover: shot.png\n'), /has no description/],
    ['an image not in media/', project('', '![Missing](nope.png)'), /"nope.png" not found in media/],
    ['a chart marker with no chart', project('', '::chart{id="nope"}'), /chart marker "nope"/],
  ])('rejects %s and names the file', (_name, source, message) => {
    expect(() => compile(source)).toThrow(message);
    expect(() => compile(source)).toThrow(/^projects\/demo\.md: /);
  });

  it('rejects a bad experience month', () => {
    const bad = '---\nrole: R\ncompany: C\nstart: 2022-13\nend: present\nlocation: L\nsummary: S\n---\n';
    expect(() => compile(bad, 'experience/x.md')).toThrow(/"start" must be YYYY-MM/);
  });
});
