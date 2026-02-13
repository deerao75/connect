import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// We wait for the DOM to be ready
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("The 'root' element was not found in index.html");
}