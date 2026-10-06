// Modal HTML Templates for Cards, Boards, Columns, Confirmations & Shortcuts
import { renderIconSvg } from './icons.js';
import { PRIORITIES, DEFAULT_TAGS } from '../core/types.js';
import { escapeHtml } from '../core/utils.js';

export function renderCardModalHtml({ card = null, defaultColumnId = null, board, selectedTags = [] }) {
  const isEdit = Boolean(card);

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

  return `
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
          <div class="form-group" style="flex: 1;">
            <label for="card-column" class="form-label">Columna</label>
            <select id="card-column">
              ${columnsOptions}
            </select>
          </div>

          <div class="form-group" style="flex: 1;">
            <label for="card-priority" class="form-label">Prioridad</label>
            <select id="card-priority">
              ${prioritiesOptions}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="card-due-date" class="form-label">Fecha límite</label>
          <input type="date" id="card-due-date" value="${card?.dueDate || ''}" />
        </div>

        <div class="form-group">
          <span class="form-label">Etiquetas</span>
          <div class="tags-selector">
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
}

export function renderBoardModalHtml({ board = null }) {
  const isEdit = Boolean(board);

  return `
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
}

export function renderColumnModalHtml({ column = null, colors, selectedColor }) {
  const isEdit = Boolean(column);

  const colorSwatchesHtml = colors.map(c => `
    <button type="button" class="color-swatch-btn ${c === selectedColor ? 'selected' : ''}" data-color="${c}" style="background-color: ${c}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid ${c === selectedColor ? '#fff' : 'transparent'}; cursor: pointer;">
    </button>
  `).join('');

  return `
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
}

export function renderConfirmModalHtml({ title, message, confirmText = 'Eliminar', isDanger = true }) {
  return `
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title" style="color: ${isDanger ? 'var(--color-danger)' : 'var(--text-primary)'}">
          ${renderIconSvg(isDanger ? 'AlertTriangle' : 'HelpCircle', { size: 20 })}
          ${escapeHtml(title)}
        </h2>
        <button type="button" class="modal-close-btn" aria-label="Cerrar ventana">
          ${renderIconSvg('X', { size: 18 })}
        </button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5;">${escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost modal-cancel-btn">Cancelar</button>
        <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} modal-confirm-btn">
          ${escapeHtml(confirmText)}
        </button>
      </div>
    </div>
  `;
}

export function renderShortcutsModalHtml() {
  return `
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
}
