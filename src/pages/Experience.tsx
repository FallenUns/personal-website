import { Picture } from '../components/Picture';
import { Prose } from '../components/Prose';
import { Timeline } from '../components/Timeline';
import { formatPeriod } from '../content/dates';
import type { Experience as Entry } from '../content/types';
import { EntryLinks, PrevNext } from './ProjectPage';

export function Experience({ experiences }: { experiences: Entry[] }) {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{experiences.length} entries</p>
        <h1 className="display">Experience</h1>
      </header>
      <section className="section">
        <Timeline entries={experiences} heading="h2" />
      </section>
    </>
  );
}

export function ExperiencePage({ experience: e, prev, next }: { experience: Entry; prev?: Entry; next?: Entry }) {
  const link = (x?: Entry) => x && { href: `/experience/${x.slug}`, title: x.role };
  return (
    <article className="entry">
      <header className="page-head">
        <p className="eyebrow">
          <a href="/experience">Experience</a> / <time>{formatPeriod(e.start, e.end)}</time>
        </p>
        <h1 className="display entry-title">{e.role}</h1>
        <p className="lede">
          {e.company} · {e.location}
        </p>
        <ul className="tags" aria-label="Skills">
          {e.skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <EntryLinks links={e.links} />
      </header>
      {e.cover && (
        <div className="entry-cover">
          <Picture picture={e.cover} alt={e.coverAlt ?? ''} sizes="(min-width: 72rem) 68rem, 100vw" eager />
        </div>
      )}
      <Prose html={e.html} />
      <PrevNext prev={link(prev)} next={link(next)} />
    </article>
  );
}
