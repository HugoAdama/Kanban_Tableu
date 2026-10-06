// Application Orchestrator: Initializes components, views and global shortcut listeners
import { store } from './core/store.js';
import { HeaderView } from './ui/headerView.js';
import { BoardView } from './ui/boardView.js';
import { notifications } from './services/notificationService.js';
import { dialogs } from './ui/dialogs.js';
import { EVENTS } from './core/types.js';

export class App {
  constructor(rootElement) {
    this.root = rootElement;
    this.headerView = null;
    this.boardView = null;
  }

  init() {
    this.root.className = 'app-container';
    this.root.innerHTML = `
      <header class="app-header" id="app-header" role="banner"></header>
      <main class="board-main" id="board-main" role="main"></main>
    `;

    const headerEl = this.root.querySelector('#app-header');
    const boardEl = this.root.querySelector('#board-main');

    this.headerView = new HeaderView(headerEl);
    this.boardView = new BoardView(boardEl);

    // Initial render
    this.headerView.render();
    this.boardView.render();

    this._bindGlobalShortcuts();
    this._bindStoreNotifications();
  }

  _bindGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing inside an input, textarea or select
      const activeEl = document.activeElement;
      const isInput = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z / Cmd+Z
      if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const undone = store.undo();
        if (undone) {
          notifications.show(`Deshecho: ${undone.description}`, { type: 'info' });
        }
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((isCtrlOrCmd && e.key.toLowerCase() === 'y') || (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        const redone = store.redo();
        if (redone) {
          notifications.show(`Rehecho: ${redone.description}`, { type: 'info' });
        }
        return;
      }

      // Shortcuts modal: '?'
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        dialogs.openShortcutsModal();
        return;
      }
    });
  }

  _bindStoreNotifications() {
    store.addEventListener(EVENTS.STATE_CHANGED, (e) => {
      if (e.detail?.message && !e.detail.cardId) {
        // Notifications are shown by individual action triggers or service events
      }
    });
  }
}
