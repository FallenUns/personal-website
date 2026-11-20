const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/#contact', label: 'Contact' },
];

export function SiteNav({ current }: { current: string }) {
  const links = LINKS.map((l) => (
    <a key={l.href} href={l.href} aria-current={current.startsWith(l.href) ? 'page' : undefined}>
      {l.label}
    </a>
  ));
  return (
    <header className="nav">
      <a className="nav-name" href="/" aria-label="Patrick Adrianus, home">
        <span aria-hidden="true">P/A</span> Patrick Adrianus
      </a>
      <nav className="nav-links" aria-label="Main">
        {links}
      </nav>
      <button className="theme-btn" type="button" data-theme-toggle aria-label="Switch between day and night theme">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
        </svg>
      </button>
      <details className="nav-menu">
        <summary>Menu</summary>
        <nav aria-label="Main, compact">{links}</nav>
      </details>
    </header>
  );
}
