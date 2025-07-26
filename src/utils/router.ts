// Navigation utilities for SPA routing
export const navigateTo = (path: string) => {
  // Use History API to navigate without page reload
  window.history.pushState({}, '', path);
  
  // Trigger a popstate event to notify the app of the route change
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  // Scroll to top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
