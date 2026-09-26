import { StrictMode } from 'react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';
import { MenetapConvexProvider } from './convex';

class AppErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Menetap application error', { message: error.message, componentStack: info.componentStack });
  }
  render() {
    if (this.state.hasError) return <main className="page centered"><h1>Something went wrong</h1><p className="muted">Please refresh and try again. If the problem continues, contact support.</p><button onClick={() => window.location.reload()}>Refresh page</button></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MenetapConvexProvider><AppErrorBoundary><App /></AppErrorBoundary></MenetapConvexProvider>
  </StrictMode>,
);
