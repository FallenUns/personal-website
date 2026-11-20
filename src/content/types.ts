export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export type ChartConfig = {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  xAxisKey: string;
  yAxisKeys: string[];
  colors?: string[];
};

export type Link = { label: string; url: string };

/** An image ready for a <picture>: `avif`/`webp` are srcset strings, absent for files served as they are. */
export type Picture = {
  src: string;
  width?: number;
  height?: number;
  avif?: string;
  webp?: string;
};

export const CATEGORIES = ['Mobile', 'Development', 'UI Library', 'Research', 'Data Science', 'Machine Learning'] as const;
export type Category = (typeof CATEGORIES)[number];

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  technologies: string[];
  order: number;
  featured: boolean;
  status: 'live' | 'coming-soon';
  cover?: Picture;
  coverDark?: Picture;
  coverAlt?: string;
  accent?: string;
  links: Link[];
  html: string;
  text: string;
};

export type Experience = {
  slug: string;
  role: string;
  company: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or "present"
  location: string;
  summary: string;
  skills: string[];
  links: Link[];
  cover?: Picture;
  coverAlt?: string;
  html: string;
  text: string;
};

export type About = { title: string; summary: string; portrait: Picture; html: string; text: string };

export type Content = { about: About; projects: Project[]; experiences: Experience[] };

export type KnowledgeEntry = { title: string; address: string; summary: string; text: string };

export type MediaManifest = Record<
  string,
  { width: number; height: number; variants: { w: number; avif: string; webp: string }[] } | { file: string }
>;
