// Main Entrypoint
import './styles/main.css';
import { App } from './app.js';

function bootstrap() {
  const root = document.querySelector('#app');
  if (root) {
    const app = new App(root);
    app.init();
  }
}

// Ensure execution even if DOMContentLoaded already fired before module evaluation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
