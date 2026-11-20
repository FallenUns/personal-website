import type { KnowledgeEntry } from '../content/types';

const STOP_WORDS = new Set(
  'the a an and or but in on at to for of with by is are was were be been being have has had do does did will would could should can may might what when where why how who which that this these those i you he she it we they me him her us them my your his its our their tell about patrick projects project experience work'.split(
    ' ',
  ),
);

const keywords = (query: string) =>
  query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

/** Picks the entries that match the question. The caller cuts the result to 6,000 characters. */
export function getRelevantContext(query: string, knowledge: KnowledgeEntry[]): string {
  const words = keywords(query);
  const scored = knowledge
    .map((entry) => {
      const haystack = `${entry.title} ${entry.summary} ${entry.text}`.toLowerCase();
      return { entry, score: words.filter((w) => haystack.includes(w)).length };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (scored.length) {
    return scored
      .map(({ entry }) => `## ${entry.title} (${entry.address})\n${entry.summary}\n${entry.text.slice(0, 1300)}`)
      .join('\n\n');
  }
  // No match: who Patrick is, plus a list of everything on the site.
  const [about, ...rest] = knowledge;
  const list = rest.map((e) => `- ${e.title} (${e.address}): ${e.summary}`).join('\n');
  return `## ${about.title}\n${about.text.slice(0, 2500)}\n\n## On this site\n${list}`;
}
