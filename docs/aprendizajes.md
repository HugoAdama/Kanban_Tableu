# Aprendizajes y Decisiones Arquitectónicas del Tablero Kanban

El desarrollo de este Tablero Kanban representa un ejercicio de ingeniería de software frontend avanzado. A continuación se documentan las principales decisiones de diseño, los desafíos técnicos resueltos y las lecciones aprendidas durante la construcción del proyecto.

---

## 1. Arquitectura y Separación de Responsabilidades

Uno de los errores más comunes en proyectos de portafolio es acoplar la manipulación del DOM, el almacenamiento y la lógica de negocio en un único archivo. En este proyecto se aplicó una arquitectura en capas claramente diferenciada:

```text
src/
├── core/         # Capa de dominio: Store reactivo, historial (Undo/Redo), persistencia y datos iniciales
├── services/     # Lógica de aplicación: Drag & drop nativo, accesibilidad por teclado, filtros y notificaciones
├── ui/           # Capa de presentación: Vistas desacopladas (Header, Board), diálogos nativos y renderizador de iconos
└── styles/       # Sistema de diseño: Tokens, reset accesible, layouts y componentes
```

### Beneficios obtenidos

* **Mantenibilidad**: Si se requiere cambiar el motor de almacenamiento de `localStorage` a una API REST o IndexedDB, únicamente se modifica `src/core/storage.js` sin alterar las vistas ni los componentes.
* **Testabilidad**: Los servicios como `filterService` o `history.js` son funciones puras o clases sin dependencias del DOM, lo que permite pruebas unitarias inmediatas.

---

## 2. Gestión de Estado Complejo y Reactividad con `EventTarget`

Para evitar introducir bibliotecas de gestión de estado externas (como Redux o Zustand), el `Store` se implementó extendiendo la clase estándar del navegador `EventTarget`:

* **Patrón Publicador / Suscriptor**: Cualquier mutación en tableros, columnas o tarjetas despacha un `CustomEvent` específico (`kanban:state-changed`, `kanban:filters-changed`).
* **Sincronización automática**: Las vistas se suscriben a estos eventos y re-renderizan su interfaz de forma reactiva y predecible.
* **Persistencia transparente**: Cada acción confirmada en el almacén persiste automáticamente el estado serializado en el almacenamiento local.

---

## 3. Patrón Command y Pila de Historial (Deshacer / Rehacer)

Implementar una función fiable de **Deshacer (Undo)** y **Rehacer (Redo)** en un tablero Kanban con múltiples columnas, tarjetas y reordenamientos requiere una estrategia robusta:

* **Instantáneas de estado (*State Snapshots*)**: Antes de aplicar una mutación (mover tarjeta, editar, eliminar o crear columna), se guarda una instantánea profunda del estado previo junto a una descripción amigable para el usuario (por ejemplo: `"Mover tarjeta a En curso"`).
* **Control de profundidad**: Se limitó la pila a un máximo de 30 acciones para optimizar el consumo de memoria.
* **Integración con Toast y Atajos**: El usuario puede deshacer la acción mediante la combinación global `Ctrl + Z`, desde el botón dedicado en la barra de herramientas o haciendo clic en el enlace `"Deshacer"` dentro de la notificación emergente (*Toast*).

---

## 4. Accesibilidad (a11y) y Movimiento de Tarjetas por Teclado

### El desafío de la industria

El 95% de los tableros Kanban en portafolios web dependen exclusivamente de eventos de puntero (ratón o pantalla táctil), excluyendo por completo a usuarios con discapacidades motrices o aquellos que navegan mediante tecnología asistiva.

### La solución implementada

1. **Modo de captura accesible (*Grab Mode*)**:
   * Las tarjetas son elementos interactivos con `tabindex="0"`, `role="button"` y `aria-roledescription="Tarjeta Kanban"`.
   * Al pulsar `Espacio` o `Enter`, la tarjeta entra en estado capturado (`aria-grabbed="true"`).
2. **Reordenamiento espacial con flechas**:
   * `Flecha Arriba` / `Flecha Abajo`: Reordena la posición de la tarjeta dentro de la columna actual.
   * `Flecha Izquierda` / `Flecha Derecha`: Transfiere la tarjeta a la columna contigua (anterior o siguiente).
3. **Anunciador en vivo (*ARIA Live Region*)**:
   * Una región `aria-live="polite"` centralizada narra cada movimiento en tiempo real: *"Tarjeta movida a columna Hecho, posición 3 de 5"*.
4. **Cancelación segura**:
   * Pulsar `Escape` cancela la operación y revierte la tarjeta exactamente a su columna y posición original, anunciándolo al lector de pantalla.
5. **Barra de ayuda flotante**:
   * Mientras una tarjeta está capturada, una barra flotante muestra los atajos disponibles para proporcionar orientación visual inmediata.

---

## 5. Búsqueda y Filtrado Multicriterio en Tiempo Real

El filtrado en tableros Kanban presenta el reto de mantener la coherencia de las columnas sin romper los índices reales de las tareas:

* El servicio `filterService` genera una proyección filtrada del tablero sin mutar el estado original en el almacén.
* Soporta filtrado simultáneo por:
  * **Texto libre** (coincidencia en título y descripción).
  * **Prioridad** (Baja, Media, Alta, Urgente).
  * **Etiquetas temáticas** (Frontend, Backend, Bug, Diseño, Feature, DevOps, Docs).
  * **Estado de fecha límite** (Todas, Vencidas, Próximas a vencer en 3 días o menos).
* Informa al usuario cuántas tarjetas coinciden frente al total del tablero.

---

## 6. Consistencia Visual, Alineación Pixel-Perfect y Descubrimiento de Acciones

Durante el pulido de la interfaz y la experiencia de usuario surgieron desafíos específicos de maquetación avanzada:

### El dilema del botón de subida de archivos frente a botones semánticos

* **El problema:** Al integrar un botón para importar respaldos JSON en la barra de herramientas, se utilizó inicialmente una etiqueta `<label>` conteniendo un `<input type="file" style="display:none">`. Los navegadores aplican por defecto a los elementos `<label>` una alineación de línea base (`baseline`) de texto, a diferencia de los elementos `<button>` estilizados con `display: inline-flex; align-items: center;`. Esta discrepancia provocaba que el icono SVG de subida flotara varios píxeles más arriba que los botones vecinos de exportación, atajos y tema.
* **La solución arquitectónica:** Se sustituyó el `<label>` por un `<button type="button">` semántico idéntico a sus pares y se desacopló el `<input type="file">` invisible. Un controlador de eventos dispara `.click()` sobre el input programáticamente. Además, se forzó en CSS una altura estricta unificada (38px), centrado flex y `margin: auto; display: block;` en todos los SVGs de la barra.

### Acciones críticas y diseño responsive de tableros anchos

* **El problema:** En resoluciones medias o ventanas no maximizadas, la columna especial `+ Añadir Columna` ubicada al extremo derecho del contenedor horizontal quedaba fuera del campo visual inmediato, obligando al usuario a desplazarse lateralmente para percatarse de su existencia.
* **La solución:** Se diseñó un patrón de acceso dual: un botón de acción rápida `+ Añadir Columna` destacado en la cabecera del tablero junto al contador de columnas y tarjetas, sincronizado visualmente con el botón del final del carril.

### Despliegue estático con Vite en GitHub Pages

* **El desafío:** El enrutamiento de activos relativos en GitHub Pages requiere una sub-ruta fija (`/Kanban_Tableu/`). Se configuró la opción `base` en `vite.config.js` y se automatizó la compilación mediante GitHub Actions para garantizar compilaciones reproducibles en cada commit.

---

## 7. Conclusión y Valor para el Portafolio Profesional

Este proyecto demuestra que no es necesario recurrir a grandes marcos de trabajo para construir aplicaciones web complejas, rápidas y accesibles. Demuestra:

* Dominio exhaustivo de estándares web modernos (HTML5 Drag & Drop, Dialog API, CSS Custom Properties).
* Compromiso real con la accesibilidad universal (WCAG 2.1 AA) tanto por teclado como para lectores de pantalla.
* Arquitectura de software modular, limpia y escalable.
* Atención minuciosa a la estética, micro-interacciones, consistencia pixel-perfect y experiencia de usuario profesional.
