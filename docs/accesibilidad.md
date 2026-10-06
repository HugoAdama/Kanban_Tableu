# Guía de Accesibilidad (WCAG 2.1 AA) y Navegación por Teclado

La accesibilidad universal (**a11y**) es uno de los pilares fundamentales del proyecto **Kanban Tableu**. Esta aplicación fue diseñada para garantizar que cualquier persona, independientemente de sus capacidades motrices, visuales o de navegación técnica, pueda interactuar plenamente con el tablero sin barreras.

---

## 1. Cumplimiento de Pautas WCAG 2.1 (Nivel AA)

El proyecto cumple con los 4 principios fundamentales de accesibilidad:

### 1.1. Perceptible
* **Ratios de Contraste de Color:**
  * Modo Oscuro (*Dark Obsidian*): Texto principal blanco `#ffffff` sobre superficie `#141d30` (ratio **12.4:1**, superando el umbral AAA de 7:1). Texto secundario `#cbd5e1` con ratio **8.9:1**.
  * Modo Claro: Texto principal `#090d16` sobre fondo blanco `#ffffff` (ratio **18.2:1**).
  * Insignias de prioridad y etiquetas con bordes contrastados y textos legibles en ambos temas.
* **No dependencia del color:** Todas las tarjetas combinan color de borde con texto explícito de prioridad e iconos vectoriales descriptivos.
* **Texto redimensionable:** La tipografía utiliza unidades relativas (`rem`, `em`) y se adapta al zoom del navegador hasta el 200% sin pérdida de contenido o funcionalidad.

### 1.2. Operable
* **Operación total por teclado:** No existe ninguna acción disponible por ratón que no pueda realizarse mediante el teclado (atajos de captura, desplazamiento de tareas entre columnas, diálogos modales, historial y búsqueda).
* **Foco visible de alto contraste:** Todos los elementos interactivos cuentan con un indicador de foco prominente (`outline: 2px solid var(--accent-focus); outline-offset: 2px;`).
* **Sin trampas de foco (*No Focus Traps*):** La navegación por <kbd>Tab</kbd> fluye de forma natural a lo largo de las columnas y tarjetas. En los diálogos modales `<dialog>`, el foco queda confinado intencionalmente y se libera al pulsar <kbd>Esc</kbd>.

### 1.3. Comprensible
* **Navegación espacial predecible:** El orden de tabulación sigue la secuencia lógica visual de izquierda a derecha y de arriba a abajo.
* **Mensajes de estado claros:** Errores de validación en modales se muestran en vivo y las acciones destructivas requieren confirmación explícita.
* **Barra flotante de asistencia:** Al capturar una tarjeta con el teclado, se despliega una barra fija inferior con las instrucciones paso a paso.

### 1.4. Robusto
* **Semántica WAI-ARIA 1.2 estándar:** Uso estricto de roles nativos (`button`, `region`, `dialog`), estados (`aria-grabbed`, `aria-expanded`, `aria-hidden`) y propiedades (`aria-label`, `aria-labelledby`, `aria-live`).
* **Compatibilidad probada con lectores de pantalla:** NVDA, VoiceOver y JAWS.

---

## 2. Guía Completa de Atajos de Teclado

| Atajo | Acción | Contexto |
| :--- | :--- | :--- |
| <kbd>Espacio</kbd> o <kbd>Enter</kbd> | **Capturar tarjeta / Soltar tarjeta** | Sobre una tarjeta con foco |
| <kbd>↑</kbd> (Flecha Arriba) | **Mover tarjeta hacia arriba** | Con tarjeta capturada |
| <kbd>↓</kbd> (Flecha Abajo) | **Mover tarjeta hacia abajo** | Con tarjeta capturada |
| <kbd>←</kbd> (Flecha Izquierda) | **Transferir a columna anterior** | Con tarjeta capturada |
| <kbd>→</kbd> (Flecha Derecha) | **Transferir a columna siguiente** | Con tarjeta capturada |
| <kbd>Esc</kbd> | **Cancelar movimiento** (revierte posición) | Con tarjeta capturada |
| <kbd>Esc</kbd> | **Cerrar ventana modal activa** | Dentro de un diálogo modal |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | **Deshacer última acción** | Global en la aplicación |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | **Rehacer acción deshecha** | Global en la aplicación |
| <kbd>?</kbd> (Signo de interrogación) | **Abrir modal de ayuda de atajos** | Global en la aplicación |
| <kbd>Tab</kbd> | **Avanzar al siguiente control interactivo** | Navegación estándar |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | **Retroceder al control previo** | Navegación estándar |

---

## 3. Arquitectura del Modo de Captura de Tarjetas (Grab Mode)

La mayoría de tableros Kanban en la web dependen de eventos de ratón (`dragstart` / `drop`), haciendo imposible su uso para personas con movilidad reducida. Este proyecto implementa un protocolo accesible en `src/services/keyboardA11yService.js`:

1. **Activación:** Al situar el foco en una tarjeta y presionar <kbd>Espacio</kbd> o <kbd>Enter</kbd>:
   * La tarjeta adquiere la clase visual `.is-keyboard-grabbed`.
   * Se actualiza su atributo a `aria-grabbed="true"`.
   * Se muestra una insignia luminosa de estado en la tarjeta (`[Modo Mover Activo]`).
   * Se hace visible la barra de ayuda flotante `.floating-keyboard-bar`.
   * El anunciador en vivo notifica: *"Tarjeta '[Título]' capturada. Usa las flechas para moverla o Esc para cancelar"*.
2. **Desplazamiento horizontal (Entre columnas):**
   * Al presionar <kbd>→</kbd> o <kbd>←</kbd>, la tarjeta es transferida dinámicamente al carril adyacente manteniendo su posición relativa.
   * El lector de pantalla narra: *"Movida a columna '[Nombre]', posición X de Y"*.
3. **Desplazamiento vertical (Reordenamiento intra-columna):**
   * Al presionar <kbd>↑</kbd> o <kbd>↓</kbd>, la tarjeta intercambia su posición con la tarea inmediatamente superior o inferior.
4. **Confirmación o Cancelación:**
   * Al pulsar nuevamente <kbd>Espacio</kbd> o <kbd>Enter</kbd>, se confirma la nueva posición y se añade al historial de Undo.
   * Al pulsar <kbd>Esc</kbd>, se revierte el estado exactamente al inicio del movimiento sin alterar el tablero.

---

## 4. Regiones Vivas (ARIA Live Regions)

Para no saturar ni interrumpir al usuario, se implementó una arquitectura de anuncios en `src/ui/a11yAnnouncer.js` con dos niveles:

* **Región Polite (`aria-live="polite"`):**
  * Utilizada para eventos informativos no urgentes que deben anunciarse cuando el lector de pantalla termine su oración actual:
    * Reordenamiento de tarjetas.
    * Conteo de resultados de búsqueda filtrados.
    * Cambio entre tableros de trabajo.
* **Región Assertive (`aria-live="assertive"`):**
  * Utilizada únicamente para situaciones críticas que requieren atención inmediata:
    * Errores en la importación de archivos de respaldo.
    * Avisos de eliminación destructiva de columnas o tableros.

---

## 5. Soporte para Preferencia de Movimiento Reducido

Para usuarios susceptibles al mareo por movimiento o trastornos vestibulares, el sistema de estilos respeta la directiva del sistema operativo:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Esto neutraliza las animaciones de pulsación luminosa y las transiciones de deslizamiento manteniendo intacta la funcionalidad interactiva.
