# Guía de Desarrollo, Configuración y Despliegue

Esta guía está dirigida a desarrolladores y evaluadores que deseen ejecutar, inspeccionar, extender o desplegar el proyecto **Kanban Tableu**.

---

## 1. Requisitos Previos

* **Node.js**: Versión 18.0.0 o superior (verificado con Node v20 y v24 LTS).
* **NPM**: Versión 9.0.0 o superior.
* **Navegador Web Moderno**: Chrome 110+, Firefox 115+, Safari 16+ o Edge 110+ (con soporte para `<dialog>`, CSS Custom Properties, y Drag & Drop API).

---

## 2. Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/HugoAdama/Kanban_Tableu.git
   cd Kanban_Tableu
   ```

2. **Instalar dependencias de desarrollo:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   * Accede a la URL local (generalmente `http://localhost:5173/`).
   * La aplicación cuenta con Hot Module Replacement (HMR) instantáneo.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   * Genera la carpeta `dist/` con los archivos HTML, CSS minificado y JS empaquetado.

5. **Previsualizar la compilación de producción localmente:**
   ```bash
   npm run preview
   ```

---

## 3. Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite con recarga rápida. |
| `npm run build` | Compila y optimiza los recursos para despliegue en producción. |
| `npm run preview` | Sirve localmente los archivos generados en `dist/`. |
| `npm run deploy` | Compila y publica automáticamente la carpeta `dist/` a la rama `gh-pages` de GitHub. |

---

## 4. Guía para Extender el Proyecto

### 4.1. Cómo añadir una nueva etiqueta temática (Tag)
1. En [src/core/types.js](file:///e:/KANBAN_TABLEU/src/core/types.js), agrega la nueva clave al objeto `DEFAULT_TAGS`:
   ```javascript
   export const DEFAULT_TAGS = {
     // ...etiquetas existentes
     qa: { id: 'qa', label: 'QA / Testing', color: '#14b8a6', icon: 'CheckSquare' }
   };
   ```
2. En [src/styles/variables.css](file:///e:/KANBAN_TABLEU/src/styles/variables.css), añade los tokens de color correspondientes:
   ```css
   --tag-qa: #14b8a6;
   --tag-qa-bg: rgba(20, 184, 166, 0.15);
   ```
3. En [src/styles/card.css](file:///e:/KANBAN_TABLEU/src/styles/card.css), define la regla del selector:
   ```css
   .tag-badge.qa {
     background-color: var(--tag-qa-bg);
     color: var(--tag-qa);
     border: 1px solid rgba(20, 184, 166, 0.28);
   }
   ```

### 4.2. Cómo añadir una nueva acción reversible al historial
Todas las mutaciones reversibles en `src/core/store.js` deben registrar una instantánea antes de modificar el estado:
```javascript
this.history.push({
  description: 'Descripción amigable para el usuario',
  state: structuredClone(this.state.boards)
});
```

---

## 5. Lista de Verificación de Calidad (QA Checklist)

Antes de realizar una entrega o actualización, comprueba los siguientes puntos:

- [ ] **Drag & Drop:** Las tarjetas pueden arrastrarse entre columnas y los indicadores superior/inferior se muestran con precisión.
- [ ] **Navegación por Teclado:** Se puede mover una tarjeta con <kbd>Espacio</kbd> + <kbd>Flechas</kbd> y cancelar con <kbd>Esc</kbd>.
- [ ] **Historial Undo/Redo:** `Ctrl + Z` y `Ctrl + Y` revierten y re-aplican cambios de movimiento, creación y edición.
- [ ] **Filtros Combinados:** El buscador de texto y los filtros de prioridad/etiqueta/vencimiento funcionan simultáneamente.
- [ ] **Persistencia:** Al recargar la página (`F5`), el tablero mantiene exactamente las tarjetas y el tema seleccionado.
- [ ] **Exportación/Importación:** La copia de seguridad en JSON se descarga correctamente y se puede restaurar sin errores.
- [ ] **Alineación Visual:** Los 4 botones de la barra de utilidades (`[Teclado] [Exportar] [Importar] [Tema]`) tienen la misma altura de 38px y los iconos se encuentran perfectamente centrados.

---

## 6. Despliegue en GitHub Pages

El proyecto está configurado con **doble vía de despliegue**:

1. **Vía Automática (GitHub Actions):**
   * El archivo `.github/workflows/deploy.yml` detecta cualquier `git push` a la rama `main`.
   * Instala dependencias con `npm ci`, ejecuta `npm run build` y publica automáticamente el artefacto en el entorno de GitHub Pages.
2. **Vía Manual CLI:**
   * Ejecutando `npm run deploy` en la terminal local, la herramienta `gh-pages` compilará y subirá la versión a la rama `gh-pages`.
