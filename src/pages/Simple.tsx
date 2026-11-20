export function AdminFeedbackShell() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Owner only</p>
        <h1 className="display">Feedback</h1>
      </header>
      <section className="section">
        <div data-island="admin-feedback" data-trigger="now">
          <p>This page needs JavaScript.</p>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <header className="page-head">
      <p className="eyebrow">404</p>
      <h1 className="display">Page not found</h1>
      <p className="lede">That address does not exist on this site.</p>
      <p className="actions">
        <a className="btn btn-solid" href="/">
          Home
        </a>
        <a className="btn" href="/projects">
          Projects
        </a>
        <a className="btn" href="/experience">
          Experience
        </a>
      </p>
    </header>
  );
}
