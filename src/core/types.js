// Core types, constants and definitions

export const PRIORITIES = {
  BAJA: { id: 'baja', label: 'Baja', order: 1, icon: 'ArrowDown' },
  MEDIA: { id: 'media', label: 'Media', order: 2, icon: 'Minus' },
  ALTA: { id: 'alta', label: 'Alta', order: 3, icon: 'ArrowUp' },
  URGENTE: { id: 'urgente', label: 'Urgente', order: 4, icon: 'AlertTriangle' }
};

export const DEFAULT_TAGS = [
  { id: 'frontend', name: 'Frontend', className: 'frontend' },
  { id: 'backend', name: 'Backend', className: 'backend' },
  { id: 'bug', name: 'Bug', className: 'bug' },
  { id: 'design', name: 'Diseño', className: 'design' },
  { id: 'feature', name: 'Feature', className: 'feature' },
  { id: 'devops', name: 'DevOps', className: 'devops' },
  { id: 'docs', name: 'Docs', className: 'docs' }
];

export const EVENTS = {
  STATE_CHANGED: 'kanban:state-changed',
  ACTIVE_BOARD_CHANGED: 'kanban:board-changed',
  FILTERS_CHANGED: 'kanban:filters-changed',
  HISTORY_CHANGED: 'kanban:history-changed',
  NOTIFICATION: 'kanban:notification',
  KEYBOARD_MOVE_START: 'kanban:keyboard-move-start',
  KEYBOARD_MOVE_END: 'kanban:keyboard-move-end'
};

export const STORAGE_KEY = 'kanban_tableu_data_v1';
export const THEME_KEY = 'kanban_theme_preference';
