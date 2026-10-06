// Native Accessible Dialogs for Cards, Boards, Columns, Confirmations & Shortcuts
import { store } from '../core/store.js';
import { PRIORITIES, DEFAULT_TAGS } from '../core/types.js';
import { renderIconSvg } from './icons.js';
import { notifications } from '../services/notificationService.js';

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

    const columnsOptions = board.columns.map(col => `
      <option value="${col.id}" ${(card ? col.cards.some(c => c.id === card.id) : col.id === defaultColumnId) ? 'selected' : ''}>
        ${col.name}
      </option>
    `).join('');

    const prioritiesOptions = Object.values(PRIORITIES).map(p => `
      <option value="${p.id}" ${card?.priority === p.id ? 'selected' : (!card && p.id === 'media') ? 'selected' : ''}>
        ${p.label}
      </option>
    `).join('');

    const tagsHtml = DEFAULT_TAGS.map(t => {
      const isSelected = selectedTags.includes(t.id);
      return `
        <button type="button" class="tag-option-btn ${isSelected ? 'selected' : ''}" data-tag-id="${t.id}">
          ${renderIconSvg('Tag', { size: 12 })}
          ${t.name}
        </button>
      `;
    }).join('');

    this.dialogEl.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">
            ${renderIconSvg(isEdit ? 'Edit2' : 'Plus', { size: 20 })}
            ${isEdit ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
          </h2>
          <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">
            ${renderIconSvg('X', { size: 18 })}
          </button>
        </div>
        <form id="card-form" class="modal-body">
          <div class="form-group">
            <label for="card-title" class="form-label">Título de la tarjeta *</label>
            <input type="text" id="card-title" required autofocus placeholder="Ej: Implementar autenticación..." value="${card ? escapeHtml(card.title) : ''}" />
          </div>

          <div class="form-group">
            <label for="card-desc" class="form-label">Descripción o detalles</label>
            <textarea id="card-desc" placeholder="Añade notas, especificaciones o enlaces...">${card ? escapeHtml(card.description || '') : ''}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="card-col" class="form-label">Columna</label>
              <select id="card-col">${columnsOptions}</select>
            </div>
            <div class="form-group">
              <label for="card-priority" class="form-label">Prioridad</label>
              <select id="card-priority">${prioritiesOptions}</select>
            </div>
          </div>

          <div class="form-group">
            <label for="card-due-date" class="form-label">Fecha límite</label>
            <input type="date" id="card-due-date" value="${card?.dueDate || ''}" />
          </div>

          <div class="form-group">
            <span class="form-label">Etiquetas</span>
            <div class="tag-selector-container">
              ${tagsHtml}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-ghost modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              ${renderIconSvg('Check', { size: 16 })}
              ${isEdit ? 'Guardar Cambios' : 'Crear Tarjeta'}
            </button>
          </div>
        </form>
      </div>
    `;

    // Interactive tag toggles
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

    // Close buttons
    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    // Submit form
    const form = this.dialogEl.querySelector('#card-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = form.querySelector('#card-title').value.trim();
      const description = form.querySelector('#card-desc').value.trim();
      const columnId = form.querySelector('#card-col').value;
      const priority = form.querySelector('#card-priority').value;
      const dueDate = form.querySelector('#card-due-date').value;

      if (!title) return;

      const boardId = store.getActiveBoardId();

      if (isEdit) {
        store.updateCard(boardId, card.id, {
          title,
          description,
          columnId,
          priority,
          tags: selectedTags,
          dueDate
        });
        notifications.show(`Tarjeta "${title}" actualizada`, { type: 'success', undoable: true });
      } else {
        store.createCard(boardId, columnId, {
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
   * Opens Board Modal to create a new board or edit existing
   */
  openBoardModal({ board = null } = {}) {
    this._initDialog();
    const isEdit = Boolean(board);

    this.dialogEl.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">
            ${renderIconSvg('Kanban', { size: 20 })}
            ${isEdit ? 'Editar Tablero' : 'Nuevo Tablero'}
          </h2>
          <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">
            ${renderIconSvg('X', { size: 18 })}
          </button>
        </div>
        <form id="board-form" class="modal-body">
          <div class="form-group">
            <label for="board-name" class="form-label">Nombre del tablero *</label>
            <input type="text" id="board-name" required autofocus placeholder="Ej: Lanzamiento Q1..." value="${board ? escapeHtml(board.name) : ''}" />
          </div>
          <div class="form-group">
            <label for="board-desc" class="form-label">Descripción</label>
            <textarea id="board-desc" placeholder="Objetivo general o alcance del proyecto...">${board ? escapeHtml(board.description || '') : ''}</textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              ${renderIconSvg('Check', { size: 16 })}
              ${isEdit ? 'Guardar Cambios' : 'Crear Tablero'}
            </button>
          </div>
        </form>
      </div>
    `;

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
        const created = store.createBoard(name, description);
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

    const colorSwatchesHtml = colors.map(c => `
      <button type="button" class="color-swatch-btn ${c === selectedColor ? 'selected' : ''}" data-color="${c}" style="background-color: ${c}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid ${c === selectedColor ? '#fff' : 'transparent'}; cursor: pointer;">
      </button>
    `).join('');

    this.dialogEl.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">
            ${renderIconSvg('Columns', { size: 20 })}
            ${isEdit ? 'Renombrar Columna' : 'Nueva Columna'}
          </h2>
          <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">
            ${renderIconSvg('X', { size: 18 })}
          </button>
        </div>
        <form id="column-form" class="modal-body">
          <div class="form-group">
            <label for="col-name" class="form-label">Nombre de la columna *</label>
            <input type="text" id="col-name" required autofocus placeholder="Ej: En QA, Bloqueado..." value="${column ? escapeHtml(column.name) : ''}" />
          </div>
          <div class="form-group">
            <span class="form-label">Color identificador</span>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.25rem;">
              ${colorSwatchesHtml}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost modal-cancel-btn">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              ${renderIconSvg('Check', { size: 16 })}
              ${isEdit ? 'Guardar Cambios' : 'Crear Columna'}
            </button>
          </div>
        </form>
      </div>
    `;

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

    this.dialogEl.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title" style="color: ${isDanger ? 'var(--color-danger)' : 'var(--text-primary)'}">
            ${renderIconSvg(isDanger ? 'AlertTriangle' : 'HelpCircle', { size: 20 })}
            ${title}
          </h2>
          <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">
            ${renderIconSvg('X', { size: 18 })}
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5;">${message}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost modal-cancel-btn">Cancelar</button>
          <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} modal-confirm-btn">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

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

    this.dialogEl.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">
            ${renderIconSvg('Keyboard', { size: 20 })}
            Atajos de Teclado y Accesibilidad
          </h2>
          <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">
            ${renderIconSvg('X', { size: 18 })}
          </button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-list">
            <div class="shortcut-row">
              <span>Seleccionar / Soltar tarjeta (Modo mover)</span>
              <div class="shortcut-keys"><kbd>Espacio</kbd> o <kbd>Enter</kbd></div>
            </div>
            <div class="shortcut-row">
              <span>Reordenar tarjeta arriba / abajo</span>
              <div class="shortcut-keys"><kbd>↑</kbd> <kbd>↓</kbd></div>
            </div>
            <div class="shortcut-row">
              <span>Mover tarjeta a columna anterior / siguiente</span>
              <div class="shortcut-keys"><kbd>←</kbd> <kbd>→</kbd></div>
            </div>
            <div class="shortcut-row">
              <span>Cancelar movimiento de tarjeta</span>
              <div class="shortcut-keys"><kbd>Esc</kbd></div>
            </div>
            <div class="shortcut-row">
              <span>Deshacer última acción</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Z</kbd></div>
            </div>
            <div class="shortcut-row">
              <span>Rehacer acción</span>
              <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Y</kbd></div>
            </div>
            <div class="shortcut-row">
              <span>Navegar entre tarjetas y controles</span>
              <div class="shortcut-keys"><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary modal-cancel-btn">Entendido</button>
        </div>
      </div>
    `;

    this.dialogEl.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.dialogEl.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    this.dialogEl.showModal();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const dialogs = new DialogManager();
