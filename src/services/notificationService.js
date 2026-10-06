// Toast Notification Service with Undo Action support
import { store } from '../core/store.js';
import { renderIconSvg } from '../ui/icons.js';

class NotificationService {
  constructor() {
    this.container = null;
    this._initContainer();
  }

  _initContainer() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  /**
   * Shows a notification toast
   * @param {string} message Text to display
   * @param {object} options { type: 'info'|'success'|'danger', duration: number, undoable: boolean }
   */
  show(message, options = {}) {
    this._initContainer();
    const { type = 'info', duration = 4500, undoable = false } = options;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'CheckCircle2';
    if (type === 'danger') iconName = 'AlertCircle';
    if (type === 'info') iconName = 'Info';

    const undoHtml = undoable && store.history.canUndo()
      ? `<button type="button" class="toast-undo-btn" aria-label="Deshacer última acción">Deshacer</button>`
      : '';

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon ${type}">${renderIconSvg(iconName, { size: 18 })}</span>
        <span class="toast-message">${message}</span>
      </div>
      <div class="toast-actions">
        ${undoHtml}
        <button type="button" class="toast-close-btn" aria-label="Cerrar notificación">
          ${renderIconSvg('X', { size: 16 })}
        </button>
      </div>
    `;

    // Hook undo button
    const undoBtn = toast.querySelector('.toast-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        store.undo();
        this.dismiss(toast);
      });
    }

    // Hook close button
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

export const notifications = new NotificationService();
