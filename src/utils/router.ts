// Navigation utilities for SPA routing.
// Detail pages render as a `fixed inset-0` overlay so we deliberately do NOT
// touch scroll on push — that lets the underlying page keep its scroll
// position behind the overlay, so closing the overlay returns the user to
// exactly where they were instead of jumping back to top and re-scrolling.
export const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const navigateBack = () => {
  window.history.back();
};

export const getCurrentPath = () => {
  return window.location.pathname;
};

export const isProjectDetailPage = (path: string) => {
  return path.startsWith('/projects/') && path !== '/projects/';
};

export const getProjectSlug = (path: string) => {
  if (isProjectDetailPage(path)) {
    return path.split('/').pop() || null;
  }
  return null;
};

export const isExperienceDetailPage = (path: string) => {
  return path.startsWith('/experience/') && path !== '/experience/';
};

export const getExperienceSlug = (path: string) => {
  if (isExperienceDetailPage(path)) {
    return path.split('/').pop() || null;
  }
  return null;
};

export const isBirthdayPage = (path: string) => {
  return path === '/birthday' || window.location.hostname === 'birthday.patrickadrianus.com';
};
