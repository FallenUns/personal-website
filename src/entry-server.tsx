// Build-side entry. Renders one address to static HTML; no page code ships to the browser.
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { about, experiences, projects } from 'virtual:content';
import { Experience, ExperiencePage } from './pages/Experience';
import { Home } from './pages/Home';
import { Layout } from './pages/Layout';
import { ProjectPage } from './pages/ProjectPage';
import { Projects } from './pages/Projects';
import { AdminFeedbackShell, NotFound } from './pages/Simple';
import { addresses as listAddresses } from './routes';

const SITE = 'https://patrickadrianus.com';
const NAME = 'Patrick Adrianus';

export const addresses = listAddresses({
  projects: projects.map((p) => p.slug),
  experiences: experiences.map((e) => e.slug),
});

type Page = { title: string; description: string; body: ReactElement; status?: 404; noindex?: boolean };

function match(address: string): Page {
  const [, section, slug] = address.split('/');
  if (address === '/') {
    return {
      title: `${NAME} · Data scientist and developer`,
      description: about.summary,
      body: <Home content={{ about, projects, experiences }} portrait={about.portrait} />,
    };
  }
  if (address === '/projects') {
    return {
      title: `Projects · ${NAME}`,
      description: `${projects.length} projects by ${NAME}: mobile apps, data science, machine learning and research.`,
      body: <Projects projects={projects} />,
    };
  }
  if (address === '/experience') {
    return {
      title: `Experience · ${NAME}`,
      description: `Work, programs and hackathons ${NAME} has taken part in.`,
      body: <Experience experiences={experiences} />,
    };
  }
  if (address === '/admin/feedback') {
    return { title: `Feedback · ${NAME}`, description: 'Owner page.', body: <AdminFeedbackShell />, noindex: true };
  }
  if (section === 'projects') {
    const i = projects.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      const p = projects[i];
      return { title: `${p.title} · ${NAME}`, description: p.summary, body: <ProjectPage project={p} prev={projects[i - 1]} next={projects[i + 1]} /> };
    }
  }
  if (section === 'experience') {
    const i = experiences.findIndex((e) => e.slug === slug);
    if (i >= 0) {
      const e = experiences[i];
      return {
        title: `${e.role} · ${NAME}`,
        description: e.summary,
        body: <ExperiencePage experience={e} prev={experiences[i - 1]} next={experiences[i + 1]} />,
      };
    }
  }
  return { title: `Page not found · ${NAME}`, description: 'This address does not exist.', body: <NotFound />, status: 404, noindex: true };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function render(address: string): { html: string; head: string; status: number } {
  const page = match(address);
  const url = SITE + (address === '/' ? '' : address);
  const title = esc(page.title);
  const description = esc(page.description);
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${NAME}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${SITE}/og.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${SITE}/og.png">`,
  ].join('\n    ');
  const html = renderToStaticMarkup(<Layout address={address}>{page.body}</Layout>);
  return { html, head, status: page.status ?? 200 };
}
