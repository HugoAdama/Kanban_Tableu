// Accessible Keyboard Navigation & Drag/Reorder Service
import { store } from '../core/store.js';
import { notifications } from './notificationService.js';
import { announcer } from '../ui/a11yAnnouncer.js';
import { renderIconSvg } from '../ui/icons.js';

class KeyboardA11yService {
  constructor() {
    this.grabbed = null; // { cardId, sourceColId, originalIndex, currentColId, currentIndex, cardTitle }
    this.helperBar = null;
    this._initHelperBar();
  }

  _initHelperBar() {
    if (this.helperBar) return;
    this.helperBar = document.createElement('div');
    this.helperBar.className = 'keyboard-move-helper-bar';
    this.helperBar.setAttribute('role', 'status');
    this.helperBar.setAttribute('aria-live', 'polite');
    this.helperBar.innerHTML = `
      <div class="helper-text">
        <span>${renderIconSvg('Keyboard', { size: 16 })}</span>
        <span class="helper-status-msg">Modo mover activo</span>
      </div>
      <div class="helper-instructions">
        <span class="helper-chip"><kbd>↑</kbd><kbd>↓</kbd> Reordenar</span>
        <span class="helper-chip"><kbd>←</kbd><kbd>→</kbd> Mover columna</span>
        <span class="helper-chip"><kbd>Enter</kbd> Fijar</span>
        <span class="helper-chip"><kbd>Esc</kbd> Cancelar</span>
      </div>
      <button type="button" class="btn-cancel-keyboard-move" aria-label="Cancelar movimiento de tarjeta">
        Cancelar
      </button>
    `;

    document.body.appendChild(this.helperBar);

    this.helperBar.querySelector('.btn-cancel-keyboard-move').addEventListener('click', () => {
      this.cancelGrab();
    });
  }

  init(containerElement) {
    if (!containerElement) return;
    this.destroy(containerElement);

    this._handleKeyDown = this.onKeyDown.bind(this);
    containerElement.addEventListener('keydown', this._handleKeyDown);
    this.container = containerElement;
  }

  destroy(containerElement) {
    const el = containerElement || this.container;
    if (el && this._handleKeyDown) {
      el.removeEventListener('keydown', this._handleKeyDown);
    }
  }

  isGrabbed() {
    return Boolean(this.grabbed);
  }

  onKeyDown(e) {
    // If user presses Escape while grabbed, cancel
    if (this.grabbed && e.key === 'Escape') {
      e.preventDefault();
      this.cancelGrab();
      return;
    }

    // Check if focused on a card
    const cardEl = e.target.closest('.kanban-card');
    if (!cardEl) return;

    // Ignore if target is an interactive child like a button or input
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
      return;
    }

    const cardId = cardEl.dataset.cardId;
    const colEl = cardEl.closest('.kanban-column');
    const colId = colEl ? colEl.dataset.columnId : null;

    // Space or Enter: Toggle Grab / Drop
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      if (!this.grabbed) {
        this.startGrab(cardEl, cardId, colId);
      } else if (this.grabbed.cardId === cardId) {
        this.commitDrop();
      }
      return;
    }

    // If card is grabbed, handle arrow movements
    if (this.grabbed && this.grabbed.cardId === cardId) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        this.handleMove(e.key);
      }
    }
  }

  startGrab(cardEl, cardId, colId) {
    const board = store.getActiveBoard();
    if (!board) return;

    const column = board.columns.find(c => c.id === colId);
    if (!column) return;

    const cardIndex = column.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = column.cards[cardIndex];

    this.grabbed = {
      cardId,
      sourceColId: colId,
      originalIndex: cardIndex,
      currentColId: colId,
      currentIndex: cardIndex,
      cardTitle: card.title
    };

    // Style card and update ARIA attributes
    cardEl.classList.add('is-keyboard-grabbed');
    cardEl.setAttribute('aria-grabbed', 'true');

    // Show floating bar
    this.helperBar.classList.add('active');
    const msg = `Tarjeta "${card.title}" seleccionada en columna "${column.name}". Usa flechas para mover, Enter para fijar o Escape para cancelar.`;
    announcer.announce(msg);
  }

  handleMove(key) {
    if (!this.grabbed) return;
    const board = store.getActiveBoard();
    if (!board) return;

    const { cardId, currentColId, currentIndex } = this.grabbed;
    const currentColumn = board.columns.find(c => c.id === currentColId);
    const currentColIndex = board.columns.findIndex(c => c.id === currentColId);

    if (!currentColumn) return;

    let targetColId = currentColId;
    let targetIndex = currentIndex;

    if (key === 'ArrowUp') {
      // Reorder up in same column
      if (currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else {
        announcer.announce(`La tarjeta ya está en la primera posición de "${currentColumn.name}".`);
        return;
      }
    } else if (key === 'ArrowDown') {
      // Reorder down in same column
      if (currentIndex < currentColumn.cards.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        announcer.announce(`La tarjeta ya está en la última posición de "${currentColumn.name}".`);
        return;
      }
    } else if (key === 'ArrowLeft') {
      // Move to previous column
      if (currentColIndex > 0) {
        const prevCol = board.columns[currentColIndex - 1];
        targetColId = prevCol.id;
        targetIndex = Math.min(currentIndex, prevCol.cards.length);
      } else {
        announcer.announce('No hay más columnas a la izquierda.');
        return;
      }
    } else if (key === 'ArrowRight') {
      // Move to next column
      if (currentColIndex < board.columns.length - 1) {
        const nextCol = board.columns[currentColIndex + 1];
        targetColId = nextCol.id;
        targetIndex = Math.min(currentIndex, nextCol.cards.length);
      } else {
        announcer.announce('No hay más columnas a la derecha.');
        return;
      }
    }

    // Execute move in store
    const boardId = store.getActiveBoardId();
    store.moveCard(boardId, currentColId, targetColId, cardId, targetIndex);

    // Update state
    this.grabbed.currentColId = targetColId;
    this.grabbed.currentIndex = targetIndex;

    // Read new column and total cards
    const newBoard = store.getActiveBoard();
    const newCol = newBoard.columns.find(c => c.id === targetColId);
    const newColName = newCol ? newCol.name : '';
    const newTotal = newCol ? newCol.cards.length : 0;

    const announceMsg = `Movida a columna "${newColName}", posición ${targetIndex + 1} de ${newTotal}.`;
    announcer.announce(announceMsg);

    // Re-focus the card in new position
    setTimeout(() => {
      const updatedCardEl = document.querySelector(`.kanban-card[data-card-id="${cardId}"]`);
      if (updatedCardEl) {
        updatedCardEl.classList.add('is-keyboard-grabbed');
        updatedCardEl.setAttribute('aria-grabbed', 'true');
        updatedCardEl.focus();
      }
    }, 50);
  }

  commitDrop() {
    if (!this.grabbed) return;

    const { cardId, currentColId, currentIndex, cardTitle, sourceColId, originalIndex } = this.grabbed;
    const board = store.getActiveBoard();
    const currentColumn = board?.columns.find(c => c.id === currentColId);
    const colName = currentColumn ? currentColumn.name : '';

    const hasChanged = currentColId !== sourceColId || currentIndex !== originalIndex;

    this._cleanup();

    if (hasChanged) {
      notifications.show(`Tarjeta "${cardTitle}" fijada en "${colName}"`, {
        type: 'success',
        undoable: true
      });
      announcer.announce(`Tarjeta soltada con éxito en columna "${colName}", posición ${currentIndex + 1}.`);
    } else {
      announcer.announce(`Tarjeta fijada en su posición.`);
    }

    // Keep focus on the card
    setTimeout(() => {
      const cardEl = document.querySelector(`.kanban-card[data-card-id="${cardId}"]`);
      if (cardEl) cardEl.focus();
    }, 50);
  }

  cancelGrab() {
    if (!this.grabbed) return;

    const { cardId, sourceColId, originalIndex, currentColId, currentIndex, cardTitle } = this.grabbed;

    // If moved, revert back to original column & index
    if (sourceColId !== currentColId || originalIndex !== currentIndex) {
      const boardId = store.getActiveBoardId();
      store.moveCard(boardId, currentColId, sourceColId, cardId, originalIndex);
    }

    this._cleanup();
    announcer.announce(`Movimiento cancelado. La tarjeta "${cardTitle}" regresó a su posición original.`);

    setTimeout(() => {
      const cardEl = document.querySelector(`.kanban-card[data-card-id="${cardId}"]`);
      if (cardEl) cardEl.focus();
    }, 50);
  }

  _cleanup() {
    document.querySelectorAll('.is-keyboard-grabbed').forEach(el => {
      el.classList.remove('is-keyboard-grabbed');
      el.removeAttribute('aria-grabbed');
    });

    if (this.helperBar) {
      this.helperBar.classList.remove('active');
    }

    this.grabbed = null;
  }
}

export const keyboardA11yService = new KeyboardA11yService();
