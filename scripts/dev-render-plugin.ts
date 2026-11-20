// Development only: answers page requests with the same render() the build uses.
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export function injectPage(template: string, page: { head: string; html: string }, themeScript: string) {
  return template
    .replace('<!--app-head-->', () => `${page.head}<script>${themeScript}</script>`)
    .replace('<!--app-html-->', () => page.html);
}

export function devRender(): Plugin {
  return {
    name: 'dev-render',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '/').split('?')[0];
        const wantsPage = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html');
        if (!wantsPage || path.extname(url) || url.startsWith('/@') || url.startsWith('/api')) return next();
        try {
          const root = server.config.root;
          const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
          const page = render(url.length > 1 ? url.replace(/\/$/, '') : '/');
          const template = await server.transformIndexHtml(url, fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
          const theme = fs.readFileSync(path.join(root, 'src/theme-inline.js'), 'utf8');
          res.statusCode = page.status;
          res.setHeader('Content-Type', 'text/html');
          res.end(injectPage(template, page, theme));
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          next(error);
        }
      });
    },
  };
}
