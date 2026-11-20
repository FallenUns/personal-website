import { Cover } from '../components/Picture';
import { Prose } from '../components/Prose';
import type { Link, Project } from '../content/types';

export function EntryLinks({ links }: { links: Link[] }) {
  if (!links.length) return null;
  return (
    <p className="actions">
      {links.map((l) => (
        <a key={l.url} className="btn" href={l.url} rel="noopener">
          {l.label}
        </a>
      ))}
    </p>
  );
}

export function PrevNext({ prev, next }: { prev?: { href: string; title: string }; next?: { href: string; title: string } }) {
  return (
    <nav className="prevnext" aria-label="More entries">
      {prev ? (
        <a href={prev.href} rel="prev">
          <span className="eyebrow">Previous</span>
          {prev.title}
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a href={next.href} rel="next">
          <span className="eyebrow">Next</span>
          {next.title}
        </a>
      )}
    </nav>
  );
}

export function ProjectPage({ project: p, prev, next }: { project: Project; prev?: Project; next?: Project }) {
  const link = (x?: Project) => x && { href: `/projects/${x.slug}`, title: x.title };
  return (
    <article className="entry">
      <header className="page-head">
        <p className="eyebrow">
          <a href="/projects">Projects</a> / {p.category}
          {p.status === 'coming-soon' && ' · Coming soon'}
        </p>
        <h1 className="display entry-title">{p.title}</h1>
        <p className="lede">{p.summary}</p>
        <ul className="tags" aria-label="Technologies">
          {p.technologies.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <EntryLinks links={p.links} />
      </header>
      {p.cover && (
        <div className="entry-cover" style={{ viewTransitionName: `cover-${p.slug}` }}>
          <Cover cover={p.cover} coverDark={p.coverDark} alt={p.coverAlt ?? ''} sizes="(min-width: 72rem) 68rem, 100vw" eager />
        </div>
      )}
      <Prose html={p.html} />
      <PrevNext prev={link(prev)} next={link(next)} />
    </article>
  );
}
