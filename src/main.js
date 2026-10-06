// Main Entrypoint
import './styles/main.css';
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app');
  if (root) {
    const app = new App(root);
    app.init();
  }
});
