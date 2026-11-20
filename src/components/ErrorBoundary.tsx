import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/** Wraps each island so one failing part does not blank the others. */
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  public override state = { failed: false };

  public static getDerivedStateFromError() {
    return { failed: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Island failed:', error, info);
  }

  public override render() {
    if (this.state.failed) return <p role="alert">This part of the page failed to load. Reload to try again.</p>;
    return this.props.children;
  }
}

export default ErrorBoundary;
