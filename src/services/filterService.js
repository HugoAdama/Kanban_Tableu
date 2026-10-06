// Filter & Search Service for Kanban Boards

export const filterService = {
  /**
   * Evaluates due date status relative to today
   * @param {string} dueDateStr ISO date string (YYYY-MM-DD)
   */
  getDueDateStatus(dueDateStr) {
    if (!dueDateStr) return { isOverdue: false, isSoon: false, text: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffMs = target - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let text = target.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    if (diffDays < 0) {
      return { isOverdue: true, isSoon: false, text: `Vencida (${text})`, diffDays };
    } else if (diffDays === 0) {
      return { isOverdue: false, isSoon: true, text: 'Vence hoy', diffDays };
    } else if (diffDays === 1) {
      return { isOverdue: false, isSoon: true, text: 'Vence mañana', diffDays };
    } else if (diffDays <= 3) {
      return { isOverdue: false, isSoon: true, text: `En ${diffDays} días`, diffDays };
    } else {
      return { isOverdue: false, isSoon: false, text, diffDays };
    }
  },

  /**
   * Filters cards inside board columns according to filter criteria
   * @param {object} board Board object
   * @param {object} filters Active filters
   * @returns {object} Cloned board with filtered cards and count metadata
   */
  applyFilters(board, filters) {
    if (!board) return null;

    const searchTerm = (filters.search || '').trim().toLowerCase();
    const priorityFilter = filters.priority || 'all';
    const tagFilter = filters.tag || 'all';
    const dueDateFilter = filters.dueDate || 'all';

    let totalCardsCount = 0;
    let visibleCardsCount = 0;

    const filteredColumns = board.columns.map(column => {
      totalCardsCount += column.cards.length;

      const matchingCards = column.cards.filter(card => {
        // 1. Text Search (matches title or description)
        if (searchTerm) {
          const matchTitle = card.title.toLowerCase().includes(searchTerm);
          const matchDesc = (card.description || '').toLowerCase().includes(searchTerm);
          if (!matchTitle && !matchDesc) return false;
        }

        // 2. Priority Filter
        if (priorityFilter !== 'all' && card.priority !== priorityFilter) {
          return false;
        }

        // 3. Tag Filter
        if (tagFilter !== 'all') {
          if (!card.tags || !card.tags.includes(tagFilter)) {
            return false;
          }
        }

        // 4. Due Date Filter
        if (dueDateFilter !== 'all') {
          const dateStatus = this.getDueDateStatus(card.dueDate);
          if (dueDateFilter === 'overdue' && !dateStatus.isOverdue) return false;
          if (dueDateFilter === 'soon' && !dateStatus.isSoon) return false;
          if (dueDateFilter === 'hasDate' && !card.dueDate) return false;
        }

        return true;
      });

      visibleCardsCount += matchingCards.length;

      return {
        ...column,
        cards: matchingCards,
        totalInColumn: column.cards.length
      };
    });

    return {
      ...board,
      columns: filteredColumns,
      totalCardsCount,
      visibleCardsCount,
      hasActiveFilters: Boolean(
        searchTerm || priorityFilter !== 'all' || tagFilter !== 'all' || dueDateFilter !== 'all'
      )
    };
  },

  getActiveFilterCount(filters) {
    let count = 0;
    if (filters.search && filters.search.trim()) count++;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.tag && filters.tag !== 'all') count++;
    if (filters.dueDate && filters.dueDate !== 'all') count++;
    return count;
  }
};
