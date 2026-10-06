// Undo & Redo History Manager using Command / Snapshot pattern

export class HistoryManager {
  constructor(maxDepth = 30) {
    this.maxDepth = maxDepth;
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      lastAction: this.getLastAction()
    }));
  }

  /**
   * Pushes a new state transition to history.
   * @param {string} description Human-readable description of the action (e.g. "Tarjeta movida a En curso")
   * @param {object} previousState Deep copy of state before the change
   */
  push(description, previousState) {
    this.undoStack.push({
      description,
      state: JSON.parse(JSON.stringify(previousState)),
      timestamp: Date.now()
    });

    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }

    // A new action invalidates the redo branch
    this.redoStack = [];
    this.notify();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  getLastAction() {
    if (this.undoStack.length === 0) return null;
    return this.undoStack[this.undoStack.length - 1].description;
  }

  /**
   * Undoes the last action and returns the restored state
   * @param {object} currentState Current state to save for redo
   */
  undo(currentState) {
    if (!this.canUndo()) return null;

    const action = this.undoStack.pop();
    this.redoStack.push({
      description: action.description,
      state: JSON.parse(JSON.stringify(currentState)),
      timestamp: Date.now()
    });

    this.notify();
    return {
      state: action.state,
      description: action.description
    };
  }

  /**
   * Redoes the last undone action
   * @param {object} currentState Current state to save back into undo
   */
  redo(currentState) {
    if (!this.canRedo()) return null;

    const action = this.redoStack.pop();
    this.undoStack.push({
      description: action.description,
      state: JSON.parse(JSON.stringify(currentState)),
      timestamp: Date.now()
    });

    this.notify();
    return {
      state: action.state,
      description: action.description
    };
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }
}
