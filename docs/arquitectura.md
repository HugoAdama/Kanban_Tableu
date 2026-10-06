# Arquitectura de Software y Patrones de Diseño

Este documento describe la arquitectura modular, los patrones de diseño y el flujo de datos del proyecto **Kanban Tableu**, desarrollado íntegramente con estándares web nativos y JavaScript moderno sin frameworks.

---

## 1. Visión General de la Arquitectura

El proyecto implementa una **arquitectura por capas desacoplada** con estricta separación de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                 Capa de Presentación (UI)                   │
│   headerView.js  │  boardView.js  │  dialogs.js  │  icons.js│
└──────────────────────────────┬──────────────────────────────┘
                               │ Eventos de usuario / Invocación
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Capa de Servicios (Services)               │
│   dndService.js          │   keyboardA11yService.js         │
│   filterService.js       │   notificationService.js         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mutaciones / Consultas de estado
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Capa de Dominio (Core)                    │
│   store.js (EventTarget) │   history.js (Command Pattern)   │
│   storage.js (Sync/JSON) │   types.js & seedData.js         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Descripción de Capas

### 2.1. Capa de Dominio (`src/core/`)
Representa el corazón del sistema, independiente de la representación visual:

* **`store.js`**: Almacén reactivo singleton que extiende la clase nativa del navegador `EventTarget`.
  * Mantiene el estado en memoria de los tableros activos, tablero seleccionado y filtros aplicados.
  * Provee métodos puros de mutación (`createCard`, `updateCard`, `deleteCard`, `moveCard`, `createColumn`, etc.).
  * Dispara eventos personalizados (`CustomEvent`) para notificar a la interfaz de usuario ante cualquier cambio.
* **`history.js`**: Pila de historial bidireccional basada en instantáneas inmutables (*snapshots*).
  * Permite operaciones atómicas de **Deshacer (Undo)** y **Rehacer (Redo)**.
  * Soporta hasta 30 estados históricos preservando memoria y rendimiento.
* **`storage.js`**: Capa de abstracción de persistencia local.
  * Sincronización transparente con `window.localStorage`.
  * Generación y descarga de archivos de respaldo en formato `.json`.
  * Validación estructural y carga segura de copias de seguridad importadas.
* **`types.js`**: Definición canónica de prioridades (`baja`, `media`, `alta`, `urgente`), etiquetas predeterminadas y nombres de eventos.
* **`seedData.js`**: Datos de prueba completos y realistas (Sprint de desarrollo web) que se cargan automáticamente si no existe estado previo en el navegador.

---

### 2.2. Capa de Servicios (`src/services/`)
Encapsula la lógica de interacción compleja y comportamientos transversales:

* **`dndService.js`**: Controlador del motor nativo HTML5 Drag & Drop.
  * Gestiona los eventos `dragstart`, `dragover`, `dragleave` y `drop`.
  * Calcula la posición vertical relativa del cursor (`clientY` respecto a la mitad de la tarjeta) para proyectar líneas de inserción en tiempo real (`.drop-indicator-top` y `.drop-indicator-bottom`).
* **`keyboardA11yService.js`**: Controlador de accesibilidad motriz por teclado.
  * Modela la captura de tarjetas en modo "arrastre virtual" mediante teclas <kbd>Space</kbd> y <kbd>Enter</kbd>.
  * Maneja el reordenamiento con flechas direccionales y comunica cada cambio a través del sintetizador de accesibilidad.
* **`filterService.js`**: Motor de búsqueda y filtrado multicriterio.
  * Ejecuta comparaciones insensibles a mayúsculas sobre título y descripción.
  * Aplica filtros combinados por prioridad, etiqueta temática y fechas límite (vencidas / próximas a 3 días).
* **`notificationService.js`**: Sistema de notificaciones emergentes (*Toasts*) flotantes.
  * Soporta estados `success`, `info`, `warning` y `danger`.
  * Incluye botones de acción interactiva directa como *"Deshacer"* para revertir mutaciones recientes de inmediato.

---

### 2.3. Capa de Presentación (`src/ui/`)
Responsable de renderizar la interfaz de usuario a partir del estado:

* **`headerView.js`**: Renderiza la barra superior del espacio de trabajo.
  * Selector interactivo de tableros con creación, edición y borrado seguro.
  * Botón principal de nueva tarjeta, botones de historial (`Deshacer` / `Rehacer`) y barra de herramientas de 38px (atajos, exportación, importación y alternancia de tema).
  * Buscador en tiempo real, selector de filtros y barra de chips de filtrado rápido a 1-clic.
* **`boardView.js`**: Renderiza el lienzo principal del tablero Kanban.
  * Cabecera con título, descripción y métricas en vivo (contador de columnas, contador de tarjetas y acceso rápido a `+ Añadir Columna`).
  * Carril horizontal con soporte de desplazamiento suave conteniendo las columnas y sus respectivas tarjetas.
  * Tarjetas con diseño elevado, borde de prioridad, etiquetas temáticas, fechas relativas y botones de acción.
* **`dialogs.js`**: Gestor de diálogos nativos utilizando la API `<dialog>`.
  * Modal accesible de creación/edición de tarjeta con validación de campos obligatorios.
  * Modal de gestión de tablero y modal de confirmación destructiva.
  * Modal interactivo de atajos de teclado y ayuda de navegación.
* **`icons.js`**: Generador de iconos SVG vectoriales sin dependencias pesadas de runtime, basado en las definiciones de Lucide.
* **`a11yAnnouncer.js`**: Región viva accesible (`aria-live="polite"`) que narra eventos para lectores de pantalla en segundo plano sin interrumpir al usuario.

---

## 3. Patrones de Diseño Implementados

### 3.1. Patrón Observer / Reactive Event Bus
En lugar de pasar callbacks entre múltiples niveles de componentes o introducir librerías externas:
1. Las mutaciones ocurren en `store.js`.
2. El almacén emite eventos nativos:
   ```javascript
   this.dispatchEvent(new CustomEvent('kanban:state-changed', { detail: { action, payload } }));
   ```
3. Las vistas (`headerView`, `boardView`) escuchan este evento y refrescan sus partes correspondientes del DOM sin acoplarse directamente entre sí.

### 3.2. Patrón Command / Snapshot Stack (Historial)
Cada mutación registrable guarda un duplicado profundo del estado anterior:
```javascript
// Registro de acción reversible
this.history.push({
  description: 'Mover tarjeta a la columna "En curso"',
  state: structuredClone(previousBoards)
});
```
Al ejecutar `store.undo()`, el almacén extrae el último estado del stack y restaura la memoria y el almacenamiento sin recargar la página.

### 3.3. Patrón Factory para Iconos SVG
En lugar de inyectar fuentes tipográficas de iconos o etiquetas `<img src="...">` que aumentan las solicitudes HTTP, `src/ui/icons.js` actúa como una fábrica de elementos SVG limpios y configurables:
```javascript
export function renderIconSvg(name, { size = 16, className = '', strokeWidth = 2 } = {})
```
Esto permite controlar el color mediante `currentColor`, el tamaño exacto y el centrado geométrico.

---

## 4. Flujo de Datos Unidireccional

```
┌────────────────┐       1. Clic / Teclado       ┌──────────────────┐
│ Usuario / A11y │ ────────────────────────────> │ Componente UI    │
└────────────────┘                               └────────┬─────────┘
        ▲                                                 │ 2. Ejecuta acción
        │                                                 ▼
┌───────┴────────┐       4. Notifica Evento      ┌──────────────────┐
│ Render DOM /   │ <──────────────────────────── │ store.js         │
│ Notificación   │   (kanban:state-changed)      │ (Guarda Snapshot │
└────────────────┘                               │  y LocalStorage) │
                                                 └──────────────────┘
```

1. El usuario interactúa con la vista (arrastrar, atajo de teclado, envío de formulario).
2. El componente UI invoca el método correspondiente en `store.js` (o en los servicios de apoyo).
3. `store.js` crea una instantánea de historial, aplica la mutación pura en memoria y sincroniza `localStorage`.
4. El almacén despacha `kanban:state-changed`.
5. La vista se vuelve a renderizar con el estado actualizado de forma determinista y accesible.
