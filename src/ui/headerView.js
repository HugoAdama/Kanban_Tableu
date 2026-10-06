// Header View: Brand, Board selector, Filters, Undo/Redo & Utility actions
import { store } from '../core/store.js';
import { renderIconSvg } from './icons.js';
import { dialogs } from './dialogs.js';
import { filterService } from '../services/filterService.js';
import { PRIORITIES, DEFAULT_TAGS, EVENTS } from '../core/types.js';
import { notifications } from '../services/notificationService.js';

export class HeaderView {
  constructor(headerElement) {
    this.element = headerElement;
    this._bindStoreEvents();
  }

  _bindStoreEvents() {
    store.addEventListener(EVENTS.STATE_CHANGED, () => this.render());
    store.addEventListener(EVENTS.FILTERS_CHANGED, () => this.render());
    store.history.onChange(() => this.updateHistoryButtons());
  }

  render() {
    const boards = store.getBoards();
    const activeBoard = store.getActiveBoard();
    const filters = store.getFilters();
    const theme = store.getTheme();

    const boardsOptions = boards.map(b => `
      <option value="${b.id}" ${b.id === activeBoard?.id ? 'selected' : ''}>
        ${escapeHtml(b.name)}
      </option>
    `).join('');

    const priorityOptions = [
      { id: 'all', label: 'Todas las prioridades' },
      ...Object.values(PRIORITIES)
    ].map(p => `
      <option value="${p.id}" ${filters.priority === p.id ? 'selected' : ''}>
        ${p.label}
      </option>
    `).join('');

    const tagOptions = [
      { id: 'all', name: 'Todas las etiquetas' },
      ...DEFAULT_TAGS
    ].map(t => `
      <option value="${t.id}" ${filters.tag === t.id ? 'selected' : ''}>
        ${t.name}
      </option>
    `).join('');

    const dueDateOptions = [
      { id: 'all', label: 'Todas las fechas' },
      { id: 'soon', label: 'Próximas a vencer (≤ 3d)' },
      { id: 'overdue', label: 'Vencidas' },
      { id: 'hasDate', label: 'Con fecha límite' }
    ].map(d => `
      <option value="${d.id}" ${filters.dueDate === d.id ? 'selected' : ''}>
        ${d.label}
      </option>
    `).join('');

    const hasActiveFilters = filterService.getActiveFilterCount(filters) > 0;

    this.element.innerHTML = `
      <div class="header-primary">
        <div class="brand-section">
          <div class="brand-icon" aria-hidden="true">
            ${renderIconSvg('Kanban', { size: 22 })}
          </div>
          <span class="brand-title">Kanban Tableu</span>

          <div class="board-selector-wrap" title="Cambiar de tablero">
            <label for="board-select" class="sr-only">Seleccionar tablero</label>
            <select id="board-select" class="board-select">
              ${boardsOptions}
            </select>
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-new-board" title="Crear nuevo tablero" aria-label="Crear nuevo tablero">
              ${renderIconSvg('Plus', { size: 16 })}
            </button>
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-edit-board" title="Editar tablero actual" aria-label="Editar tablero actual">
              ${renderIconSvg('Edit2', { size: 15 })}
            </button>
            ${boards.length > 1 ? `
              <button type="button" class="btn btn-ghost btn-icon-only btn-delete-board" title="Eliminar tablero actual" aria-label="Eliminar tablero actual">
                ${renderIconSvg('Trash2', { size: 15 })}
              </button>
            ` : ''}
          </div>
        </div>

        <div class="header-actions">
          <button type="button" class="btn btn-primary" id="btn-new-card">
            ${renderIconSvg('Plus', { size: 16 })}
            <span>Nueva Tarjeta</span>
          </button>

          <div class="history-group" role="group" aria-label="Historial de acciones">
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-undo" title="Deshacer (Ctrl+Z)" aria-label="Deshacer última acción" ${!store.history.canUndo() ? 'disabled' : ''}>
              ${renderIconSvg('Undo2', { size: 16 })}
            </button>
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-redo" title="Rehacer (Ctrl+Y)" aria-label="Rehacer acción" ${!store.history.canRedo() ? 'disabled' : ''}>
              ${renderIconSvg('Redo2', { size: 16 })}
            </button>
          </div>

          <div class="toolbar-group" role="group" aria-label="Herramientas y ajustes">
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-shortcuts" title="Atajos de teclado y accesibilidad (?)" aria-label="Ver atajos de teclado">
              ${renderIconSvg('Keyboard', { size: 16 })}
            </button>
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-export" title="Exportar copia de seguridad (JSON)" aria-label="Exportar copia de seguridad">
              ${renderIconSvg('Download', { size: 16 })}
            </button>
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-import-trigger" title="Importar copia de seguridad (JSON)" aria-label="Importar copia de seguridad">
              ${renderIconSvg('Upload', { size: 16 })}
            </button>
            <input type="file" id="file-import" accept=".json" style="display: none;" />
            <button type="button" class="btn btn-ghost btn-icon-only" id="btn-toggle-theme" title="${theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}" aria-label="Cambiar tema claro u oscuro">
              ${renderIconSvg(theme === 'dark' ? 'Sun' : 'Moon', { size: 16 })}
            </button>
          </div>
        </div>
      </div>

      <div class="header-secondary">
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">${renderIconSvg('Search', { size: 16 })}</span>
            <input
              type="text"
              id="search-input"
              class="search-input"
              placeholder="Buscar tarjetas por título o contenido..."
              value="${escapeHtml(filters.search)}"
              aria-label="Buscar tarjetas"
            />
            ${filters.search ? `
              <button type="button" class="clear-search-btn" id="btn-clear-search" aria-label="Limpiar búsqueda">
                ${renderIconSvg('X', { size: 14 })}
              </button>
            ` : ''}
          </div>

          <div class="filter-controls">
            <label for="filter-priority" class="sr-only">Filtrar por prioridad</label>
            <select id="filter-priority" class="filter-dropdown-select">
              ${priorityOptions}
            </select>

            <label for="filter-tag" class="sr-only">Filtrar por etiqueta</label>
            <select id="filter-tag" class="filter-dropdown-select">
              ${tagOptions}
            </select>

            <label for="filter-due-date" class="sr-only">Filtrar por fecha límite</label>
            <select id="filter-due-date" class="filter-dropdown-select">
              ${dueDateOptions}
            </select>
          </div>

          <div class="quick-filter-chips" role="group" aria-label="Filtros rápidos">
            <button type="button" class="quick-chip ${filters.priority === 'all' && filters.tag === 'all' && filters.dueDate === 'all' && !filters.search ? 'active' : ''}" data-filter-type="reset">
              Todos
            </button>
            <button type="button" class="quick-chip ${filters.priority === 'urgente' ? 'active' : ''}" data-filter-type="priority" data-filter-val="urgente">
              ${renderIconSvg('AlertTriangle', { size: 12 })} Urgente
            </button>
            <button type="button" class="quick-chip ${filters.priority === 'alta' ? 'active' : ''}" data-filter-type="priority" data-filter-val="alta">
              ${renderIconSvg('ArrowUp', { size: 12 })} Alta
            </button>
            <button type="button" class="quick-chip ${filters.dueDate === 'soon' ? 'active' : ''}" data-filter-type="dueDate" data-filter-val="soon">
              ${renderIconSvg('Clock', { size: 12 })} Próximas
            </button>
            <button type="button" class="quick-chip ${filters.dueDate === 'overdue' ? 'active' : ''}" data-filter-type="dueDate" data-filter-val="overdue">
              ${renderIconSvg('Calendar', { size: 12 })} Vencidas
            </button>
            <button type="button" class="quick-chip ${filters.tag === 'bug' ? 'active' : ''}" data-filter-type="tag" data-filter-val="bug">
              ${renderIconSvg('Tag', { size: 12 })} Bugs
            </button>
          </div>
        </div>

        ${hasActiveFilters ? `
          <div class="active-filters-row">
            <span>Filtros activos:</span>
            ${filters.search ? `<span class="filter-tag-pill">"${escapeHtml(filters.search)}"</span>` : ''}
            ${filters.priority !== 'all' ? `<span class="filter-tag-pill">Prioridad: ${filters.priority}</span>` : ''}
            ${filters.tag !== 'all' ? `<span class="filter-tag-pill">Tag: ${filters.tag}</span>` : ''}
            ${filters.dueDate !== 'all' ? `<span class="filter-tag-pill">Fecha: ${filters.dueDate}</span>` : ''}
            <button type="button" class="btn btn-ghost" id="btn-reset-filters" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">
              ${renderIconSvg('X', { size: 12 })} Limpiar filtros
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    // Board select change
    const boardSelect = this.element.querySelector('#board-select');
    if (boardSelect) {
      boardSelect.addEventListener('change', (e) => {
        store.setActiveBoard(e.target.value);
      });
    }

    // New board
    const newBoardBtn = this.element.querySelector('#btn-new-board');
    if (newBoardBtn) {
      newBoardBtn.addEventListener('click', () => dialogs.openBoardModal());
    }

    // Edit board
    const editBoardBtn = this.element.querySelector('#btn-edit-board');
    if (editBoardBtn) {
      editBoardBtn.addEventListener('click', () => {
        const active = store.getActiveBoard();
        if (active) dialogs.openBoardModal({ board: active });
      });
    }

    // Delete board
    const deleteBoardBtn = this.element.querySelector('.btn-delete-board');
    if (deleteBoardBtn) {
      deleteBoardBtn.addEventListener('click', () => {
        const active = store.getActiveBoard();
        if (!active) return;
        dialogs.openConfirmModal({
          title: '¿Eliminar este tablero?',
          message: `¿Estás seguro de que deseas eliminar permanentemente el tablero "${active.name}" con todas sus columnas y tarjetas? Esta acción se puede deshacer.`,
          confirmText: 'Eliminar Tablero',
          isDanger: true,
          onConfirm: () => {
            store.deleteBoard(active.id);
            notifications.show(`Tablero "${active.name}" eliminado`, { type: 'info', undoable: true });
          }
        });
      });
    }

    // New card
    const newCardBtn = this.element.querySelector('#btn-new-card');
    if (newCardBtn) {
      newCardBtn.addEventListener('click', () => dialogs.openCardModal());
    }

    // Undo / Redo
    const undoBtn = this.element.querySelector('#btn-undo');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => store.undo());
    }

    const redoBtn = this.element.querySelector('#btn-redo');
    if (redoBtn) {
      redoBtn.addEventListener('click', () => store.redo());
    }

    // Shortcuts modal
    const shortcutsBtn = this.element.querySelector('#btn-shortcuts');
    if (shortcutsBtn) {
      shortcutsBtn.addEventListener('click', () => dialogs.openShortcutsModal());
    }

    // Theme toggle
    const themeBtn = this.element.querySelector('#btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => store.toggleTheme());
    }

    // Export JSON
    const exportBtn = this.element.querySelector('#btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        store.exportData();
        notifications.show('Copia de respaldo exportada en JSON', { type: 'success' });
      });
    }

    // Import JSON
    const importTriggerBtn = this.element.querySelector('#btn-import-trigger');
    const importInput = this.element.querySelector('#file-import');
    if (importTriggerBtn && importInput) {
      importTriggerBtn.addEventListener('click', () => {
        importInput.click();
      });
    }

    if (importInput) {
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          await store.importData(file);
          notifications.show('Tableros importados exitosamente', { type: 'success' });
        } catch (err) {
          notifications.show(err.message || 'Error al importar archivo', { type: 'danger' });
        }
        importInput.value = '';
      });
    }

    // Search input
    const searchInput = this.element.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.setFilters({ search: e.target.value });
      });
    }

    // Clear search
    const clearSearchBtn = this.element.querySelector('#btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        store.setFilters({ search: '' });
      });
    }

    // Filter Priority
    const filterPriority = this.element.querySelector('#filter-priority');
    if (filterPriority) {
      filterPriority.addEventListener('change', (e) => {
        store.setFilters({ priority: e.target.value });
      });
    }

    // Filter Tag
    const filterTag = this.element.querySelector('#filter-tag');
    if (filterTag) {
      filterTag.addEventListener('change', (e) => {
        store.setFilters({ tag: e.target.value });
      });
    }

    // Filter Due Date
    const filterDueDate = this.element.querySelector('#filter-due-date');
    if (filterDueDate) {
      filterDueDate.addEventListener('change', (e) => {
        store.setFilters({ dueDate: e.target.value });
      });
    }

    // Reset all filters
    const resetFiltersBtn = this.element.querySelector('#btn-reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        store.resetFilters();
      });
    }

    // Quick filter chips clicks
    this.element.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.filterType;
        const val = chip.dataset.filterVal;
        if (type === 'reset') {
          store.resetFilters();
        } else if (type === 'priority') {
          const current = store.getFilters().priority;
          store.setFilters({ priority: current === val ? 'all' : val });
        } else if (type === 'dueDate') {
          const current = store.getFilters().dueDate;
          store.setFilters({ dueDate: current === val ? 'all' : val });
        } else if (type === 'tag') {
          const current = store.getFilters().tag;
          store.setFilters({ tag: current === val ? 'all' : val });
        }
      });
    });
  }

  updateHistoryButtons() {
    const undoBtn = this.element.querySelector('#btn-undo');
    const redoBtn = this.element.querySelector('#btn-redo');
    if (undoBtn) undoBtn.disabled = !store.history.canUndo();
    if (redoBtn) redoBtn.disabled = !store.history.canRedo();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
