// Reactive State Store with EventTarget and History integration
import { storage } from './storage.js';
import { HistoryManager } from './history.js';
import { EVENTS } from './types.js';

class Store extends EventTarget {
  constructor() {
    super();
    this.history = new HistoryManager();
    this.filters = {
      search: '',
      priority: 'all',
      tag: 'all',
      dueDate: 'all'
    };
    this.theme = storage.loadTheme();
    this.data = storage.loadData();

    // Verify active board exists
    if (!this.getActiveBoard()) {
      if (this.data.boards.length > 0) {
        this.data.activeBoardId = this.data.boards[0].id;
      }
    }

    // Sync theme to document element
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  // ---- Getters ----
  getState() {
    return this.data;
  }

  getBoards() {
    return this.data.boards;
  }

  getActiveBoard() {
    return this.data.boards.find(b => b.id === this.data.activeBoardId) || null;
  }

  getActiveBoardId() {
    return this.data.activeBoardId;
  }

  getFilters() {
    return { ...this.filters };
  }

  getTheme() {
    return this.theme;
  }

  // ---- Internal State Mutation & History Helpers ----
  _recordAction(description) {
    this.history.push(description, this.data);
  }

  _persistAndNotify(eventName = EVENTS.STATE_CHANGED, detail = {}) {
    storage.saveData(this.data);
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
    this.dispatchEvent(new CustomEvent(EVENTS.STATE_CHANGED, { detail }));
  }

  // ---- Board Operations ----
  setActiveBoard(boardId) {
    if (this.data.activeBoardId === boardId) return;
    const exists = this.data.boards.some(b => b.id === boardId);
    if (!exists) return;

    this.data.activeBoardId = boardId;
    this._persistAndNotify(EVENTS.ACTIVE_BOARD_CHANGED, { boardId });
  }

  createBoard(name, description = '') {
    this._recordAction(`Crear tablero "${name}"`);
    const newBoard = {
      id: 'board-' + crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      columns: [
        { id: 'col-' + crypto.randomUUID(), name: 'Por hacer', color: '#6366f1', cards: [] },
        { id: 'col-' + crypto.randomUUID(), name: 'En curso', color: '#f59e0b', cards: [] },
        { id: 'col-' + crypto.randomUUID(), name: 'Hecho', color: '#10b981', cards: [] }
      ]
    };

    this.data.boards.push(newBoard);
    this.data.activeBoardId = newBoard.id;
    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Tablero "${name}" creado` });
    return newBoard;
  }

  updateBoard(boardId, updates) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;

    this._recordAction(`Editar tablero "${board.name}"`);
    if (updates.name) board.name = updates.name.trim();
    if (updates.description !== undefined) board.description = updates.description.trim();

    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: 'Tablero actualizado' });
  }

  deleteBoard(boardId) {
    if (this.data.boards.length <= 1) {
      throw new Error('No se puede eliminar el único tablero.');
    }
    const boardIndex = this.data.boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) return;

    const boardName = this.data.boards[boardIndex].name;
    this._recordAction(`Eliminar tablero "${boardName}"`);

    this.data.boards.splice(boardIndex, 1);
    if (this.data.activeBoardId === boardId) {
      this.data.activeBoardId = this.data.boards[0].id;
    }

    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Tablero "${boardName}" eliminado` });
  }

  // ---- Column Operations ----
  createColumn(boardId, name, color = '#6366f1') {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;

    this._recordAction(`Añadir columna "${name}"`);
    const newColumn = {
      id: 'col-' + crypto.randomUUID(),
      name: name.trim(),
      color: color || '#6366f1',
      cards: []
    };

    board.columns.push(newColumn);
    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Columna "${name}" creada` });
    return newColumn;
  }

  updateColumn(boardId, columnId, updates) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;
    const col = board.columns.find(c => c.id === columnId);
    if (!col) return;

    this._recordAction(`Renombrar columna a "${updates.name || col.name}"`);
    if (updates.name) col.name = updates.name.trim();
    if (updates.color) col.color = updates.color;

    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: 'Columna actualizada' });
  }

  deleteColumn(boardId, columnId) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;
    const colIndex = board.columns.findIndex(c => c.id === columnId);
    if (colIndex === -1) return;

    const colName = board.columns[colIndex].name;
    this._recordAction(`Eliminar columna "${colName}"`);

    board.columns.splice(colIndex, 1);
    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Columna "${colName}" eliminada` });
  }

  // ---- Card Operations ----
  createCard(boardId, columnId, cardData) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;
    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;

    this._recordAction(`Crear tarjeta "${cardData.title}"`);
    const newCard = {
      id: 'card-' + crypto.randomUUID(),
      title: cardData.title.trim(),
      description: (cardData.description || '').trim(),
      priority: cardData.priority || 'media',
      tags: Array.isArray(cardData.tags) ? cardData.tags : [],
      dueDate: cardData.dueDate || '',
      createdAt: new Date().toISOString()
    };

    column.cards.unshift(newCard); // Añade al inicio de la columna
    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Tarjeta "${newCard.title}" creada` });
    return newCard;
  }

  updateCard(boardId, cardId, cardData) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;

    let targetCard = null;
    let targetCol = null;

    for (const col of board.columns) {
      const found = col.cards.find(c => c.id === cardId);
      if (found) {
        targetCard = found;
        targetCol = col;
        break;
      }
    }

    if (!targetCard) return;

    this._recordAction(`Editar tarjeta "${targetCard.title}"`);

    if (cardData.title !== undefined) targetCard.title = cardData.title.trim();
    if (cardData.description !== undefined) targetCard.description = cardData.description.trim();
    if (cardData.priority !== undefined) targetCard.priority = cardData.priority;
    if (cardData.tags !== undefined) targetCard.tags = cardData.tags;
    if (cardData.dueDate !== undefined) targetCard.dueDate = cardData.dueDate;

    // Si cambió de columna desde el modal de edición
    if (cardData.columnId && cardData.columnId !== targetCol.id) {
      const newCol = board.columns.find(c => c.id === cardData.columnId);
      if (newCol) {
        targetCol.cards = targetCol.cards.filter(c => c.id !== cardId);
        newCol.cards.push(targetCard);
      }
    }

    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Tarjeta "${targetCard.title}" actualizada` });
  }

  deleteCard(boardId, cardId) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return;

    for (const col of board.columns) {
      const idx = col.cards.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        const title = col.cards[idx].title;
        this._recordAction(`Eliminar tarjeta "${title}"`);
        col.cards.splice(idx, 1);
        this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Tarjeta "${title}" eliminada` });
        return;
      }
    }
  }

  /**
   * Move or reorder a card between columns or within the same column.
   */
  moveCard(boardId, sourceColId, targetColId, cardId, targetIndex) {
    const board = this.data.boards.find(b => b.id === boardId);
    if (!board) return false;

    const sourceCol = board.columns.find(c => c.id === sourceColId);
    const targetCol = board.columns.find(c => c.id === targetColId);
    if (!sourceCol || !targetCol) return false;

    const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = sourceCol.cards[cardIndex];
    const isSameColumn = sourceColId === targetColId;

    // Check if position actually changes
    if (isSameColumn && (cardIndex === targetIndex || (targetIndex === -1 && cardIndex === sourceCol.cards.length - 1))) {
      return false;
    }

    const actionText = isSameColumn
      ? `Reordenar tarjeta "${card.title}"`
      : `Mover "${card.title}" a "${targetCol.name}"`;

    this._recordAction(actionText);

    // Remove from source
    sourceCol.cards.splice(cardIndex, 1);

    // Insert into target at calculated index
    if (targetIndex === -1 || targetIndex >= targetCol.cards.length) {
      targetCol.cards.push(card);
    } else {
      const safeIndex = Math.max(0, targetIndex);
      targetCol.cards.splice(safeIndex, 0, card);
    }

    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: actionText, cardId, targetColId });
    return true;
  }

  // ---- Undo & Redo ----
  undo() {
    const result = this.history.undo(this.data);
    if (!result) return null;

    this.data = result.state;
    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Deshecho: ${result.description}` });
    return result;
  }

  redo() {
    const result = this.history.redo(this.data);
    if (!result) return null;

    this.data = result.state;
    this._persistAndNotify(EVENTS.STATE_CHANGED, { message: `Rehecho: ${result.description}` });
    return result;
  }

  // ---- Filters ----
  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.dispatchEvent(new CustomEvent(EVENTS.FILTERS_CHANGED, { detail: this.filters }));
  }

  resetFilters() {
    this.filters = {
      search: '',
      priority: 'all',
      tag: 'all',
      dueDate: 'all'
    };
    this.dispatchEvent(new CustomEvent(EVENTS.FILTERS_CHANGED, { detail: this.filters }));
  }

  // ---- Theme Toggle ----
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    storage.saveTheme(this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    this.dispatchEvent(new CustomEvent(EVENTS.STATE_CHANGED, { detail: { theme: this.theme } }));
    return this.theme;
  }

  // ---- Backup & Restore ----
  exportData() {
    storage.exportAsJSON(this.data);
  }

  async importData(file) {
    try {
      const imported = await storage.importFromJSONFile(file);
      this._recordAction('Importar datos desde archivo JSON');
      this.data = imported;
      this.history.clear();
      this._persistAndNotify(EVENTS.STATE_CHANGED, { message: 'Datos importados correctamente' });
      return true;
    } catch (err) {
      throw err;
    }
  }
}

export const store = new Store();
