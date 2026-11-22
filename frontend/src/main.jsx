import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Safely handle environments where ServiceWorker protocol is not supported (Electron / custom schemes)
if (typeof window !== 'undefined' && (window.location.protocol === 'iitsm:' || window.location.protocol === 'file:' || navigator.userAgent.includes('Electron'))) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register = () => Promise.reject(new Error('Service workers not applicable in desktop environment.'));
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
