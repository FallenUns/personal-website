import type { CSSProperties } from 'react';
import type { Project } from '../content/types';
import { Cover } from './Picture';

/** Static card. Its cover shares a view-transition name with the project page's cover. */
export function ProjectCard({ project: p, index, heading: Heading = 'h3' }: { project: Project; index?: number; heading?: 'h2' | 'h3' }) {
  return (
    <article
      className="card reveal"
      data-light
      style={{ '--i': index ?? 0, '--card-accent': p.accent } as CSSProperties}
    >
      <div className="card-body">
        <p className="eyebrow">
          {p.category}
          {p.status === 'coming-soon' && ' · Coming soon'}
        </p>
        <Heading className="card-title">
          <a href={`/projects/${p.slug}`}>{p.title}</a>
        </Heading>
        <p className="card-summary">{p.summary}</p>
        <ul className="tags" aria-label="Technologies">
          {p.technologies.slice(0, 5).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      {p.cover && (
        <div className="card-cover" style={{ viewTransitionName: `cover-${p.slug}` }}>
          <Cover cover={p.cover} coverDark={p.coverDark} alt={p.coverAlt ?? ''} sizes="(min-width: 60rem) 28rem, 90vw" />
        </div>
      )}
    </article>
  );
}
