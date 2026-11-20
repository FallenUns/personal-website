// Writes one HTML file per address from the build-side bundle.
// Runs after `vite build` (dist/index.html is the template) and the --ssr build.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { render, addresses } = await import(pathToFileURL(path.resolve('build/server/entry-server.js')).href);
const template = fs.readFileSync('dist/index.html', 'utf8');
const theme = fs.readFileSync('src/theme-inline.js', 'utf8');

const page = (address) => {
  const { head, html } = render(address);
  return template
    .replace('<!--app-head-->', () => `${head}<script>${theme}</script>`)
    .replace('<!--app-html-->', () => html);
};

for (const address of addresses) {
  const file = path.join('dist', address, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(address));
}
fs.writeFileSync('dist/404.html', page('/404'));
console.log(`prerender: ${addresses.length} pages and 404.html`);
