import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';
import { MenetapConvexProvider } from './convex';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MenetapConvexProvider><App /></MenetapConvexProvider>
  </StrictMode>,
);
