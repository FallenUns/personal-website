import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from '../components/ErrorBoundary';

/** Replaces the element's static content with a React tree. */
export function mountIsland(el: HTMLElement, node: ReactNode) {
  createRoot(el).render(<ErrorBoundary>{node}</ErrorBoundary>);
}
