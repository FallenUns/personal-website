/** Numbered index with dotted leaders: `[1] ........ About`. */
export function SectionIndex({ items }: { items: { href: string; label: string; note?: string }[] }) {
  return (
    <nav className="index" aria-label="On this page">
      <ol>
        {items.map((item, i) => (
          <li key={item.href}>
            <a href={item.href}>
              <span className="index-n" aria-hidden="true">
                [{i + 1}]
              </span>
              <span className="index-dots" aria-hidden="true" />
              <span className="index-label">{item.label}</span>
              {item.note && <span className="index-note">{item.note}</span>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
