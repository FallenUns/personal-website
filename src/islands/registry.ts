export type Island = { mount(el: HTMLElement, props: never, activated: boolean): void };

/** Island name (the `data-island` value) -> its code, loaded on demand. */
export const islands: Record<string, () => Promise<Island>> = {
  chat: () => import('./ChatIsland'),
  feedback: () => import('./FeedbackIsland'),
  chart: () => import('./ChartIsland'),
  'admin-feedback': () => import('./AdminFeedback'),
};
