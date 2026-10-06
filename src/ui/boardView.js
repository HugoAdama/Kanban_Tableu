// Board View: Columns, Cards, Empty states, Quick actions and DnD attachment
import { store } from '../core/store.js';
import { PRIORITIES } from '../core/types.js';
import { renderIconSvg } from './icons.js';
import { dialogs } from './dialogs.js';
import { filterService } from '../services/filterService.js';
import { dndService } from '../services/dndService.js';
import { keyboardA11yService } from '../services/keyboardA11yService.js';
import { EVENTS } from '../core/types.js';

export class BoardView {
  constructor(boardContainerElement) {
    this.container = boardContainerElement;
    this._bindStoreEvents();
  }

  _bindStoreEvents() {
    store.addEventListener(EVENTS.STATE_CHANGED, () => this.render());
    store.addEventListener(EVENTS.ACTIVE_BOARD_CHANGED, () => this.render());
    store.addEventListener(EVENTS.FILTERS_CHANGED, () => this.render());
  }

  render() {
    const rawBoard = store.getActiveBoard();
    if (!rawBoard) {
      this.container.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
          <p>No hay tableros disponibles.</p>
        </div>
      `;
      return;
    }

    const filters = store.getFilters();
    const filteredBoard = filterService.applyFilters(rawBoard, filters);

    const statsText = filteredBoard.hasActiveFilters
      ? `${filteredBoard.visibleCardsCount} de ${filteredBoard.totalCardsCount} tarjetas visibles`
      : `${filteredBoard.totalCardsCount} tarjetas`;

    let columnsHtml = filteredBoard.columns.map(col => this._renderColumn(col)).join('');

    // Append "+ Añadir Columna" card
    columnsHtml += `
      <div class="add-column-card" id="btn-add-column-card" role="button" tabindex="0" aria-label="Añadir nueva columna">
        <span style="color: var(--accent-primary);">${renderIconSvg('Plus', { size: 28 })}</span>
        <span style="font-weight: 600; font-size: 0.9375rem;">Añadir Columna</span>
      </div>
    `;

    this.container.innerHTML = `
      <section class="board-top-info" aria-label="Información del tablero">
        <div class="board-meta">
          <h1 class="board-heading">
            ${escapeHtml(filteredBoard.name)}
          </h1>
          ${filteredBoard.description ? `<p class="board-desc">${escapeHtml(filteredBoard.description)}</p>` : ''}
        </div>
        <div class="board-stats">
          <span class="stat-chip">
            ${renderIconSvg('Layers', { size: 14 })}
            ${filteredBoard.columns.length} columnas
          </span>
          <span class="stat-chip">
            ${renderIconSvg('CheckCircle2', { size: 14 })}
            ${statsText}
          </span>
        </div>
      </section>

      <div class="columns-container" id="kanban-columns-track" role="region" aria-label="Columnas de tareas">
        ${columnsHtml}
      </div>
    `;

    // Re-initialize DnD and Keyboard A11y on fresh DOM elements
    const track = this.container.querySelector('#kanban-columns-track');
    dndService.init(track);
    keyboardA11yService.init(track);

    this._attachEventListeners();
  }

  _renderColumn(column) {
    const cardsHtml = column.cards.length > 0
      ? column.cards.map(card => this._renderCard(card)).join('')
      : `
        <div class="column-empty-state" aria-hidden="true">
          <span>${renderIconSvg('Inbox', { size: 24 })}</span>
          <span>No hay tarjetas aquí</span>
        </div>
      `;

    return `
      <section class="kanban-column" data-column-id="${column.id}" aria-labelledby="col-title-${column.id}">
        <header class="column-header">
          <div class="column-header-title-wrap">
            <span class="column-color-indicator" style="background-color: ${column.color || '#6366f1'};"></span>
            <h2 id="col-title-${column.id}" class="column-title" title="${escapeHtml(column.name)}">${escapeHtml(column.name)}</h2>
            <span class="column-count-badge" aria-label="${column.cards.length} tarjetas">${column.cards.length}</span>
          </div>

          <div class="column-header-actions">
            <button type="button" class="btn btn-ghost btn-icon-only btn-col-add-card" data-col-id="${column.id}" title="Añadir tarjeta a ${escapeHtml(column.name)}" aria-label="Añadir tarjeta a ${escapeHtml(column.name)}">
              ${renderIconSvg('Plus', { size: 15 })}
            </button>
            <button type="button" class="btn btn-ghost btn-icon-only btn-col-edit" data-col-id="${column.id}" title="Renombrar columna" aria-label="Renombrar columna">
              ${renderIconSvg('Edit2', { size: 14 })}
            </button>
            <button type="button" class="btn btn-ghost btn-icon-only btn-col-delete" data-col-id="${column.id}" title="Eliminar columna" aria-label="Eliminar columna">
              ${renderIconSvg('Trash2', { size: 14 })}
            </button>
          </div>
        </header>

        <div class="column-cards-container" data-column-id="${column.id}">
          ${cardsHtml}
        </div>

        <footer class="column-footer">
          <button type="button" class="btn btn-ghost btn-add-card" data-col-id="${column.id}">
            ${renderIconSvg('Plus', { size: 15 })}
            <span>Añadir tarjeta</span>
          </button>
        </footer>
      </section>
    `;
  }

  _renderCard(card) {
    const priorityObj = PRIORITIES[card.priority?.toUpperCase()] || PRIORITIES.MEDIA;
    const dateStatus = filterService.getDueDateStatus(card.dueDate);

    const tagsHtml = Array.isArray(card.tags) && card.tags.length > 0
      ? `<div class="card-tags">
          ${card.tags.map(tagId => `
            <span class="tag-badge ${tagId}">
              ${renderIconSvg('Tag', { size: 10 })}
              ${capitalize(tagId)}
            </span>
          `).join('')}
        </div>`
      : '';

    let dueDateHtml = '';
    if (card.dueDate) {
      let extraClass = '';
      if (dateStatus.isOverdue) extraClass = 'is-overdue';
      else if (dateStatus.isSoon) extraClass = 'is-soon';

      dueDateHtml = `
        <span class="due-date-badge ${extraClass}" title="Fecha límite: ${card.dueDate}">
          ${renderIconSvg('Calendar', { size: 12 })}
          <span>${dateStatus.text}</span>
        </span>
      `;
    }

    return `
      <article
        class="kanban-card"
        data-card-id="${card.id}"
        draggable="true"
        tabindex="0"
        role="button"
        aria-roledescription="Tarjeta Kanban"
        aria-label="Tarjeta: ${escapeHtml(card.title)}"
      >
        <div class="keyboard-active-badge">
          ${renderIconSvg('Move', { size: 12 })}
          <span>Modo Mover</span>
        </div>

        ${tagsHtml}

        <div class="card-header">
          <h3 class="card-title">${escapeHtml(card.title)}</h3>
          <div class="card-actions-menu">
            <button type="button" class="card-action-btn btn-card-edit" data-card-id="${card.id}" title="Editar tarjeta" aria-label="Editar tarjeta">
              ${renderIconSvg('Edit2', { size: 13 })}
            </button>
            <button type="button" class="card-action-btn delete-btn btn-card-delete" data-card-id="${card.id}" title="Eliminar tarjeta" aria-label="Eliminar tarjeta">
              ${renderIconSvg('Trash2', { size: 13 })}
            </button>
          </div>
        </div>

        ${card.description ? `<p class="card-desc">${escapeHtml(card.description)}</p>` : ''}

        <footer class="card-footer">
          <span class="priority-badge ${priorityObj.id}" title="Prioridad: ${priorityObj.label}">
            ${renderIconSvg(priorityObj.icon, { size: 12 })}
            <span>${priorityObj.label}</span>
          </span>
          ${dueDateHtml}
        </footer>
      </article>
    `;
  }

  _attachEventListeners() {
    // Add Column card click
    const addColCard = this.container.querySelector('#btn-add-column-card');
    if (addColCard) {
      addColCard.addEventListener('click', () => dialogs.openColumnModal());
      addColCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dialogs.openColumnModal();
        }
      });
    }

    // Column edit buttons
    this.container.querySelectorAll('.btn-col-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colId = btn.dataset.colId;
        const board = store.getActiveBoard();
        const column = board?.columns.find(c => c.id === colId);
        if (column) dialogs.openColumnModal({ column });
      });
    });

    // Column delete buttons
    this.container.querySelectorAll('.btn-col-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colId = btn.dataset.colId;
        const board = store.getActiveBoard();
        const column = board?.columns.find(c => c.id === colId);
        if (!column) return;

        const count = column.cards.length;
        const countWarning = count > 0 ? ` Esta columna contiene ${count} tarjetas que también serán eliminadas.` : '';

        dialogs.openConfirmModal({
          title: `¿Eliminar columna "${column.name}"?`,
          message: `¿Estás seguro de que deseas eliminar esta columna?${countWarning} Esta acción puede ser deshecha con el botón Deshacer.`,
          confirmText: 'Eliminar Columna',
          isDanger: true,
          onConfirm: () => {
            store.deleteColumn(board.id, column.id);
          }
        });
      });
    });

    // Add card buttons (both in column header and column footer)
    this.container.querySelectorAll('.btn-col-add-card, .btn-add-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colId = btn.dataset.colId;
        dialogs.openCardModal({ defaultColumnId: colId });
      });
    });

    // Card edit buttons
    this.container.querySelectorAll('.btn-card-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = btn.dataset.cardId;
        const board = store.getActiveBoard();
        let targetCard = null;
        for (const col of board.columns) {
          const found = col.cards.find(c => c.id === cardId);
          if (found) {
            targetCard = found;
            break;
          }
        }
        if (targetCard) dialogs.openCardModal({ card: targetCard });
      });
    });

    // Card delete buttons
    this.container.querySelectorAll('.btn-card-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = btn.dataset.cardId;
        const board = store.getActiveBoard();
        let targetCard = null;
        for (const col of board.columns) {
          const found = col.cards.find(c => c.id === cardId);
          if (found) {
            targetCard = found;
            break;
          }
        }
        if (!targetCard) return;

        dialogs.openConfirmModal({
          title: '¿Eliminar tarjeta?',
          message: `¿Estás seguro de eliminar "${targetCard.title}"? Podrás deshacer esta acción si lo deseas.`,
          confirmText: 'Eliminar',
          isDanger: true,
          onConfirm: () => {
            store.deleteCard(board.id, targetCard.id);
          }
        });
      });
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
