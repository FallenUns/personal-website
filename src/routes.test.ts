import { expect, it } from 'vitest';
import { addresses } from './routes';

it('returns every address once', () => {
  const list = addresses({ projects: ['a', 'b'], experiences: ['x'] });
  expect(list).toEqual(['/', '/projects', '/projects/a', '/projects/b', '/experience', '/experience/x', '/admin/feedback']);
  expect(new Set(list).size).toBe(list.length);
});
