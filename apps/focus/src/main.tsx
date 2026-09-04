import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const rootEl = document.getElementById('root')!;

function show(msg: string) {
  rootEl.style.cssText = 'padding:40px;font-family:monospace;font-size:14px;color:#8A4A3E;white-space:pre-wrap;';
  rootEl.textContent = msg;
}

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (e) {
  show('BOOT ERROR:\n' + String(e) + '\n' + ((e as Error).stack ?? ''));
}

window.addEventListener('error', e => show('RUNTIME ERROR:\n' + e.message + '\n' + (e.error?.stack ?? '')));
window.addEventListener('unhandledrejection', e => show('PROMISE ERROR:\n' + String(e.reason)));
