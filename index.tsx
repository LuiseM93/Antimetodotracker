import './index.css';
// @ts-nocheck
window.addEventListener('error', e => {
  if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
  }
});

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && /Could not establish connection/.test(args[0])) {
    return;
  }
  originalError.apply(console, args);
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppContextProvider } from './contexts/AppContext.tsx'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);