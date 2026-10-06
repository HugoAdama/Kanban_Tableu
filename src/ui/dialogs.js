// Native Accessible Dialog Manager for Cards, Boards, Columns, Confirmations & Shortcuts
import { store } from '../core/store.js';
import { notifications } from '../services/notificationService.js';
import {
  renderCardModalHtml,
  renderBoardModalHtml,
  renderColumnModalHtml,
  renderConfirmModalHtml,
  renderShortcutsModalHtml
} from './modalTemplates.js';

class DialogManager {
  constructor() {
    this.dialogEl = null;
    this._initDialog();
  }

  _initDialog() {
    if (this.dialogEl) return;
    this.dialogEl = document.createElement('dialog');
    this.dialogEl.id = 'app-accessible-dialog';
    document.body.appendChild(this.dialogEl);

    // Light dismiss: click on backdrop closes modal
    this.dialogEl.addEventListener('click', (e) => {
      const rect = this.dialogEl.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        this.close();
      }
    });

    // Handle Escape key naturally
    this.dialogEl.addEventListener('cancel', () => {
      this.close();
    });
  }

  close() {
    if (this.dialogEl && this.dialogEl.open) {
      this.dialogEl.close();
      this.dialogEl.innerHTML = '';
    }
  }

  /**
   * Opens Card Modal for creation or editing
   */
  openCardModal({ card = null, defaultColumnId = null } = {}) {
    this._initDialog();
    const isEdit = Boolean(card);
    const board = store.getActiveBoard();
    if (!board) return;

    let selectedTags = isEdit && card.tags ? [...card.tags] : [];

    this.dialogEl.innerHTML = renderCardModalHtml({
      card,
      defaultColumnId,
      board,
      selectedTags
    });

    // Tag toggle logic
    this.dialogEl.querySelectorAll('.tag-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tagId = btn.dataset.tagId;
        if (selectedTags.includes(tagId)) {
          selectedTags = selectedTags.filter(t => t !== tagId);
          btn.classList.remove('selected');
        } else {
          selectedTags.push(tagId);
          btn.classList.add('selected');
        }
      });
    });

    // Close handlers
    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    // Submit handler
    const form = this.dialogEl.querySelector('#card-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = form.querySelector('#card-title').value.trim();
      const description = form.querySelector('#card-desc').value.trim();
      const columnId = form.querySelector('#card-column').value;
      const priority = form.querySelector('#card-priority').value;
      const dueDate = form.querySelector('#card-due-date').value || null;

      if (!title) return;

      if (isEdit) {
        store.updateCard(board.id, card.id, {
          title,
          description,
          priority,
          tags: selectedTags,
          dueDate
        });

        // If column changed, transfer card
        const currentColumn = board.columns.find(col => col.cards.some(c => c.id === card.id));
        if (currentColumn && currentColumn.id !== columnId) {
          store.moveCard(board.id, card.id, columnId, 0);
        }

        notifications.show(`Tarjeta "${title}" actualizada`, { type: 'success', undoable: true });
      } else {
        store.createCard(board.id, columnId, {
          title,
          description,
          priority,
          tags: selectedTags,
          dueDate
        });
        notifications.show(`Tarjeta "${title}" creada`, { type: 'success', undoable: true });
      }

      this.close();
    });

    this.dialogEl.showModal();
  }

  /**
   * Opens Board Modal for creation or editing
   */
  openBoardModal({ board = null } = {}) {
    this._initDialog();
    const isEdit = Boolean(board);

    this.dialogEl.innerHTML = renderBoardModalHtml({ board });

    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    const form = this.dialogEl.querySelector('#board-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#board-name').value.trim();
      const description = form.querySelector('#board-desc').value.trim();
      if (!name) return;

      if (isEdit) {
        store.updateBoard(board.id, { name, description });
        notifications.show(`Tablero "${name}" actualizado`, { type: 'success', undoable: true });
      } else {
        store.createBoard(name, description);
        notifications.show(`Tablero "${name}" creado con éxito`, { type: 'success', undoable: true });
      }
      this.close();
    });

    this.dialogEl.showModal();
  }

  /**
   * Opens Column Modal to create or rename a column
   */
  openColumnModal({ column = null } = {}) {
    this._initDialog();
    const isEdit = Boolean(column);
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#38bdf8', '#8b5cf6', '#ef4444'];
    let selectedColor = column?.color || '#6366f1';

    this.dialogEl.innerHTML = renderColumnModalHtml({
      column,
      colors,
      selectedColor
    });

    this.dialogEl.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedColor = btn.dataset.color;
        this.dialogEl.querySelectorAll('.color-swatch-btn').forEach(b => {
          b.style.borderColor = b.dataset.color === selectedColor ? '#fff' : 'transparent';
        });
      });
    });

    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    const form = this.dialogEl.querySelector('#column-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#col-name').value.trim();
      if (!name) return;

      const boardId = store.getActiveBoardId();
      if (isEdit) {
        store.updateColumn(boardId, column.id, { name, color: selectedColor });
        notifications.show(`Columna "${name}" actualizada`, { type: 'success', undoable: true });
      } else {
        store.createColumn(boardId, name, selectedColor);
        notifications.show(`Columna "${name}" creada`, { type: 'success', undoable: true });
      }
      this.close();
    });

    this.dialogEl.showModal();
  }

  /**
   * Safe Confirmation Dialog
   */
  openConfirmModal({ title, message, confirmText = 'Eliminar', isDanger = true, onConfirm }) {
    this._initDialog();

    this.dialogEl.innerHTML = renderConfirmModalHtml({
      title,
      message,
      confirmText,
      isDanger
    });

    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    this.dialogEl.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      this.close();
      if (typeof onConfirm === 'function') onConfirm();
    });

    this.dialogEl.showModal();
  }

  /**
   * Keyboard Shortcuts Accessibility Modal
   */
  openShortcutsModal() {
    this._initDialog();

    this.dialogEl.innerHTML = renderShortcutsModalHtml();

    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    this.dialogEl.showModal();
  }
}

export const dialogs = new DialogManager();
