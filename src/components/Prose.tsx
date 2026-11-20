/** Outputs HTML produced by the content compiler from the owner's Markdown files. */
export function Prose({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
