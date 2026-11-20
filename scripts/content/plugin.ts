// Vite plugin: serves the compiled content as two virtual modules.
//   virtual:content   - entries with their HTML; imported by build-side code only
//   virtual:knowledge - plain text per entry; imported by the chat island only
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { compileAll, toKnowledge } from './compile';

const IDS = ['virtual:content', 'virtual:knowledge'];

export function content(): Plugin {
  let root = process.cwd();
  const load = () => {
    const manifestFile = path.join(root, '.cache/media.json');
    if (!fs.existsSync(manifestFile)) throw new Error('.cache/media.json is missing. Run "npm run media" first.');
    return compileAll(path.join(root, 'content'), JSON.parse(fs.readFileSync(manifestFile, 'utf8')));
  };
  return {
    name: 'content',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (IDS.includes(id)) return '\0' + id;
    },
    load(id) {
      if (id === '\0virtual:content') {
        const c = load();
        return `export const about = ${JSON.stringify(c.about)};\nexport const projects = ${JSON.stringify(c.projects)};\nexport const experiences = ${JSON.stringify(c.experiences)};`;
      }
      if (id === '\0virtual:knowledge') return `export default ${JSON.stringify(toKnowledge(load()))};`;
    },
    configureServer(server) {
      const dir = path.join(root, 'content');
      server.watcher.add(dir);
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(dir)) return;
        for (const id of IDS) {
          const mod = server.moduleGraph.getModuleById('\0' + id);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
