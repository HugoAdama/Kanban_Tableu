// HTML5 Native Drag & Drop Service with Dynamic Insertion Indicators
import { store } from '../core/store.js';
import { notifications } from './notificationService.js';
import { announcer } from '../ui/a11yAnnouncer.js';

class DragAndDropService {
  constructor() {
    this.currentDrag = null; // { cardId, sourceColId, boardId }
    this.dropTargetCard = null;
    this.dropPosition = 'after'; // 'before' | 'after'
  }

  init(containerElement) {
    if (!containerElement) return;

    // Remove old listeners if re-initializing
    this.destroy(containerElement);

    // Bind event handlers
    this._handleDragStart = this.onDragStart.bind(this);
    this._handleDragEnd = this.onDragEnd.bind(this);
    this._handleDragOver = this.onDragOver.bind(this);
    this._handleDragLeave = this.onDragLeave.bind(this);
    this._handleDrop = this.onDrop.bind(this);

    containerElement.addEventListener('dragstart', this._handleDragStart);
    containerElement.addEventListener('dragend', this._handleDragEnd);
    containerElement.addEventListener('dragover', this._handleDragOver);
    containerElement.addEventListener('dragleave', this._handleDragLeave);
    containerElement.addEventListener('drop', this._handleDrop);

    this.container = containerElement;
  }

  destroy(containerElement) {
    const el = containerElement || this.container;
    if (!el) return;
    if (this._handleDragStart) el.removeEventListener('dragstart', this._handleDragStart);
    if (this._handleDragEnd) el.removeEventListener('dragend', this._handleDragEnd);
    if (this._handleDragOver) el.removeEventListener('dragover', this._handleDragOver);
    if (this._handleDragLeave) el.removeEventListener('dragleave', this._handleDragLeave);
    if (this._handleDrop) el.removeEventListener('drop', this._handleDrop);
  }

  onDragStart(e) {
    const cardEl = e.target.closest('.kanban-card');
    if (!cardEl) return;

    const cardId = cardEl.dataset.cardId;
    const colEl = cardEl.closest('.kanban-column');
    const sourceColId = colEl ? colEl.dataset.columnId : null;
    const boardId = store.getActiveBoardId();

    if (!cardId || !sourceColId) return;

    this.currentDrag = { cardId, sourceColId, boardId };

    // Setup dataTransfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);

    // Style card
    setTimeout(() => {
      cardEl.classList.add('is-dragging');
    }, 0);

    const title = cardEl.querySelector('.card-title')?.textContent || 'Tarjeta';
    announcer.announce(`Iniciado arrastre de la tarjeta: ${title}`);
  }

  onDragOver(e) {
    if (!this.currentDrag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Find column
    const colEl = e.target.closest('.kanban-column');
    if (colEl) {
      colEl.classList.add('drag-target-column');
      const cardsContainer = colEl.querySelector('.column-cards-container');
      if (cardsContainer) cardsContainer.classList.add('drag-over');
    }

    // Find target card if hovering over one
    const targetCardEl = e.target.closest('.kanban-card');
    this._clearIndicators();

    if (targetCardEl && targetCardEl.dataset.cardId !== this.currentDrag.cardId) {
      this.dropTargetCard = targetCardEl;
      const rect = targetCardEl.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      if (e.clientY < midpoint) {
        this.dropPosition = 'before';
        targetCardEl.classList.add('drop-indicator-top');
      } else {
        this.dropPosition = 'after';
        targetCardEl.classList.add('drop-indicator-bottom');
      }
    } else {
      this.dropTargetCard = null;
    }
  }

  onDragLeave(e) {
    const relatedTarget = e.relatedTarget;
    const colEl = e.target.closest('.kanban-column');
    if (colEl && (!relatedTarget || !colEl.contains(relatedTarget))) {
      colEl.classList.remove('drag-target-column');
      const cardsContainer = colEl.querySelector('.column-cards-container');
      if (cardsContainer) cardsContainer.classList.remove('drag-over');
    }
  }

  onDrop(e) {
    if (!this.currentDrag) return;
    e.preventDefault();

    const colEl = e.target.closest('.kanban-column');
    if (!colEl) {
      this.onDragEnd();
      return;
    }

    const targetColId = colEl.dataset.columnId;
    const { cardId, sourceColId, boardId } = this.currentDrag;

    // Calculate insertion index
    let targetIndex = -1;
    if (this.dropTargetCard) {
      const targetCardId = this.dropTargetCard.dataset.cardId;
      const activeBoard = store.getActiveBoard();
      const targetCol = activeBoard?.columns.find(c => c.id === targetColId);

      if (targetCol) {
        const foundIdx = targetCol.cards.findIndex(c => c.id === targetCardId);
        if (foundIdx !== -1) {
          targetIndex = this.dropPosition === 'before' ? foundIdx : foundIdx + 1;

          // Adjust if moving within the same column downwards
          if (sourceColId === targetColId) {
            const currentIdx = targetCol.cards.findIndex(c => c.id === cardId);
            if (currentIdx < targetIndex) {
              targetIndex -= 1;
            }
          }
        }
      }
    }

    const moved = store.moveCard(boardId, sourceColId, targetColId, cardId, targetIndex);

    if (moved) {
      const activeBoard = store.getActiveBoard();
      const destCol = activeBoard?.columns.find(c => c.id === targetColId);
      const colName = destCol ? destCol.name : 'columna destino';
      notifications.show(`Tarjeta movida a "${colName}"`, { type: 'success', undoable: true });
      announcer.announce(`Tarjeta soltada en columna "${colName}"`);
    }

    this.onDragEnd();
  }

  onDragEnd() {
    this._clearIndicators();
    document.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging'));
    document.querySelectorAll('.drag-target-column').forEach(el => el.classList.remove('drag-target-column'));
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    this.currentDrag = null;
    this.dropTargetCard = null;
  }

  _clearIndicators() {
    document.querySelectorAll('.drop-indicator-top').forEach(el => el.classList.remove('drop-indicator-top'));
    document.querySelectorAll('.drop-indicator-bottom').forEach(el => el.classList.remove('drop-indicator-bottom'));
  }
}

export const dndService = new DragAndDropService();
