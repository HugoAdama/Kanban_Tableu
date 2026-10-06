// SVG Icon Renderer using Lucide icons definition
import { icons } from 'lucide';

/**
 * Renders an inline SVG string for any Lucide icon
 * @param {string} iconName Name of the icon (e.g. 'Plus', 'Trash2', 'Calendar')
 * @param {object} options { size: number, className: string, strokeWidth: number }
 * @returns {string} SVG HTML string
 */
export function renderIconSvg(iconName, options = {}) {
  const {
    size = 18,
    className = '',
    strokeWidth = 2
  } = options;

  const iconDef = icons[iconName] || icons.HelpCircle || [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'M12 16v-4' }],
    ['path', { d: 'M12 8h.01' }]
  ];

  const childrenHtml = iconDef.map(([tag, attrs]) => {
    const attrString = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    return `<${tag} ${attrString}></${tag}>`;
  }).join('');

  const cleanName = iconName.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${cleanName} ${className}" aria-hidden="true">${childrenHtml}</svg>`;
}

/**
 * Creates an SVG DOM element
 */
export function createIconElement(iconName, options = {}) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderIconSvg(iconName, options);
  return wrapper.firstElementChild;
}
