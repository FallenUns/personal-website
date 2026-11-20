/// <reference types="vite/client" />

declare module 'virtual:content' {
  export const about: import('./content/types').About;
  export const projects: import('./content/types').Project[];
  export const experiences: import('./content/types').Experience[];
}

declare module 'virtual:knowledge' {
  const knowledge: import('./content/types').KnowledgeEntry[];
  export default knowledge;
}
