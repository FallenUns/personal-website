/** Every address the site serves, given the content slugs. */
export function addresses(slugs: { projects: string[]; experiences: string[] }): string[] {
  return [
    '/',
    '/projects',
    ...slugs.projects.map((s) => `/projects/${s}`),
    '/experience',
    ...slugs.experiences.map((s) => `/experience/${s}`),
    '/admin/feedback',
  ];
}
