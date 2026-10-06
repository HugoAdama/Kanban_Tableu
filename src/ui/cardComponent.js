// Card Component: Encapsulates Card DOM template, Badges, Tags & Priority rendering
import { PRIORITIES } from '../core/types.js';
import { renderIconSvg } from './icons.js';
import { filterService } from '../services/filterService.js';
import { escapeHtml, capitalize } from '../core/utils.js';

/**
 * Renders the HTML markup for an individual Kanban card.
 * @param {object} card - The card data model
 * @returns {string} Sanitized HTML string
 */
export function renderCardHtml(card) {
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
      data-priority="${card.priority?.toLowerCase() || 'media'}"
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
