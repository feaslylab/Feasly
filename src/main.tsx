import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ViewModeProvider } from '@/lib/view-mode';
import { initSentry, initPostHog } from './lib/analytics';
import App from './App.tsx'
import './index.css'

// Initialize analytics
initSentry();
initPostHog();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ViewModeProvider>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <ThemeProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </ThemeProvider>
          </BrowserRouter>
        </I18nextProvider>
      </ViewModeProvider>
    </AuthProvider>
  </StrictMode>
);
