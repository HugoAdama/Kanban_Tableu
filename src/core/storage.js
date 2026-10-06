// LocalStorage persistence service and backup exporter/importer
import { STORAGE_KEY, THEME_KEY } from './types.js';
import { generateSeedData } from './seedData.js';

export const storage = {
  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = generateSeedData();
        this.saveData(initial);
        return initial;
      }
      const data = JSON.parse(raw);
      if (!data.boards || !Array.isArray(data.boards) || data.boards.length === 0) {
        const initial = generateSeedData();
        this.saveData(initial);
        return initial;
      }
      return data;
    } catch (err) {
      console.error('[Storage] Error loading data from localStorage, resetting to defaults:', err);
      const initial = generateSeedData();
      this.saveData(initial);
      return initial;
    }
  },

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('[Storage] Failed to save data to localStorage:', err);
      return false;
    }
  },

  loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      console.error('[Storage] Failed to save theme:', err);
    }
  },

  exportAsJSON(data, filename = 'kanban-tablero-backup.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importFromJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.boards || !Array.isArray(parsed.boards)) {
            throw new Error('Estructura de archivo inválida. Se esperaba un arreglo de tableros.');
          }
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsText(file);
    });
  }
};
