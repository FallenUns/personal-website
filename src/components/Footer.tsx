export const CONTACT = {
  email: 'patrickadrianus04@gmail.com',
  linkedin: 'https://linkedin.com/in/patrick-adrianus',
  github: 'https://github.com/FallenUns',
  resume: '/Patrick%20Adrianus%20-%20Resume.pdf',
};

export function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Patrick Adrianus</p>
      <nav aria-label="Contact links">
        <a href={`mailto:${CONTACT.email}`}>Email</a>
        <a href={CONTACT.linkedin} rel="noopener">LinkedIn</a>
        <a href={CONTACT.github} rel="noopener">GitHub</a>
        <a href={CONTACT.resume}>Resume (PDF)</a>
      </nav>
    </footer>
  );
}
