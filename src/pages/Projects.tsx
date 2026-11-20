import { ProjectCard } from '../components/ProjectCard';
import { CATEGORIES, type Project } from '../content/types';

export const categoryId = (category: string) => category.toLowerCase().replace(/\s+/g, '-');

export function Projects({ projects }: { projects: Project[] }) {
  const groups = CATEGORIES.map((c) => ({ category: c, items: projects.filter((p) => p.category === c) })).filter(
    (g) => g.items.length,
  );
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{projects.length} entries</p>
        <h1 className="display">Projects</h1>
        <nav className="chips" aria-label="Categories">
          {groups.map((g) => (
            <a key={g.category} href={`#${categoryId(g.category)}`}>
              {g.category}
            </a>
          ))}
        </nav>
      </header>
      {groups.map((g) => (
        <section key={g.category} id={categoryId(g.category)} className="section">
          <h2 className="group-title">{g.category}</h2>
          <div className="grid">
            {g.items.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
