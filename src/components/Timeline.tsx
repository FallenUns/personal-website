import { formatPeriod } from '../content/dates';
import type { Experience } from '../content/types';

export function Timeline({ entries, heading: Heading = 'h3' }: { entries: Experience[]; heading?: 'h2' | 'h3' }) {
  return (
    <ol className="timeline">
      {entries.map((e) => (
        <li key={e.slug} className="timeline-item reveal">
          <p className="eyebrow">
            <time>{formatPeriod(e.start, e.end)}</time>
          </p>
          <div>
            <Heading className="timeline-role">
              <a href={`/experience/${e.slug}`}>{e.role}</a>
            </Heading>
            <p className="timeline-company">
              {e.company} · {e.location}
            </p>
            <p>{e.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
