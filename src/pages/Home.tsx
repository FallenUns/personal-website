import { CONTACT } from '../components/Footer';
import { Picture } from '../components/Picture';
import { ProjectCard } from '../components/ProjectCard';
import { Prose } from '../components/Prose';
import { SectionIndex } from '../components/SectionIndex';
import { Timeline } from '../components/Timeline';
import type { Content, Picture as PictureData } from '../content/types';

export function Home({ content, portrait }: { content: Content; portrait: PictureData }) {
  const featured = content.projects.filter((p) => p.featured);
  return (
    <>
      <section className="hero" data-light>
        <p className="eyebrow">Data scientist · Developer · Melbourne</p>
        <h1 className="display hero-title">
          Patrick
          <br />
          Adrianus
        </h1>
        <p className="lede">
          I build apps, data tools and research systems, and I keep experimenting with new technology.
        </p>
        <p className="actions">
          <a className="btn btn-solid" href="/projects">
            See the projects
          </a>
          <a className="btn" href={CONTACT.resume}>
            Resume (PDF)
          </a>
        </p>
        {/* Release 2 puts the desk here. */}
        <div className="horizon" aria-hidden="true" />
      </section>

      <SectionIndex
        items={[
          { href: '#about', label: 'About' },
          { href: '#projects', label: 'Projects', note: `${content.projects.length} entries` },
          { href: '#experience', label: 'Experience', note: `${content.experiences.length} entries` },
          { href: '#contact', label: 'Contact' },
        ]}
      />

      <section id="about" className="section">
        <h2 className="display reveal">About</h2>
        <div className="about">
          <Picture
            picture={portrait}
            alt="Patrick Adrianus standing with hands in pockets, wearing sunglasses and a cream jumper"
            sizes="(min-width: 60rem) 20rem, 60vw"
            className="about-portrait"
          />
          <Prose html={content.about.html} />
        </div>
      </section>

      <section id="projects" className="section">
        <h2 className="display reveal">Selected projects</h2>
        <div className="stack">
          {featured.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
        <p className="actions">
          <a className="btn" href="/projects">
            All {content.projects.length} projects
          </a>
        </p>
      </section>

      <section id="experience" className="section">
        <h2 className="display reveal">Experience</h2>
        <Timeline entries={content.experiences.slice(0, 3)} />
        <p className="actions">
          <a className="btn" href="/experience">
            Full timeline
          </a>
        </p>
      </section>

      <section id="contact" className="section contact" data-light>
        <h2 className="display reveal">Say hello</h2>
        <p className="lede">Questions, roles or project ideas are all welcome.</p>
        <p className="actions">
          <a className="btn btn-solid" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          <a className="btn" href={CONTACT.linkedin} rel="noopener">
            LinkedIn
          </a>
          <a className="btn" href={CONTACT.github} rel="noopener">
            GitHub
          </a>
        </p>
      </section>
    </>
  );
}
