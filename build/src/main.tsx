import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/router/ErrorBoundary';
import { AppearanceSync } from '@/components/AppearanceSync';

/**
 * Application bootstrap — providers are layered inside-out:
 *
 *  StrictMode
 *   └── BrowserRouter          (routing context)
 *        └── AuthProvider      (global auth state)
 *             └── ErrorBoundary (catches render crashes)
 *                  └── App     (route definitions + lazy pages)
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppearanceSync />
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
