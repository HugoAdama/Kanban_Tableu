# Tecnologías Utilizadas en el Proyecto Tablero Kanban

Este documento detalla las tecnologías, estándares web y herramientas implementadas en el desarrollo del Tablero Kanban, así como la justificación técnica de su elección frente a soluciones tradicionales basadas en frameworks pesados.

---

## 1. Núcleo Tecnológico (Core Stack)

### JavaScript Moderno (ES2023+ / ES Modules)

* **Propósito**: Lógica de negocio, gestión de estado y manipulación del DOM.
* **Justificación**: Se implementó una arquitectura orientada a módulos nativos (`import` / `export`) sin depender de frameworks reactivos pesados (como React o Angular). Esto demuestra un dominio profundo de los fundamentos del lenguaje, el ciclo de vida del DOM, delegación de eventos y patrones de diseño modernos.
* **Características utilizadas**:
  * Clases con herencia de `EventTarget` para reactividad nativa desacoplada.
  * Inmutabilidad y clonado profundo mediante `structuredClone` y serialización segura.
  * Generación de identificadores únicos universales con `crypto.randomUUID()`.

### Vanilla CSS & Sistema de Tokens de Diseño

* **Propósito**: Estilización visual, sistema de temas (oscuro/claro), adaptabilidad responsive y micro-interacciones.
* **Justificación**: En lugar de sobrecargar la aplicación con bibliotecas utilitarias como TailwindCSS, se diseñó un sistema propio basado en **CSS Custom Properties (Variables CSS)**. Esto garantiza máxima flexibilidad, rendimiento óptimo sin tiempo de purga y soporte nativo para cambios de tema en tiempo real.
* **Técnicas clave**:
  * Paleta de colores HSL estructurada para contrastes accesibles y transiciones armónicas (ratios superiores a 7:1 en fondos oscuros y claros).
  * *Glassmorphism* controlado mediante `backdrop-filter: blur(12px)`.
  * Elevaciones y sombras con profundidad gradual (`--shadow-sm` hasta `--shadow-xl`).
  * Estandarización de componentes de control en cabecera con altura estricta unificada (38px) y alineación flex centralizada.
  * Consultas de accesibilidad `@media (prefers-reduced-motion: reduce)` para usuarios con sensibilidad al movimiento.
  * Reglas responsive modulares (`max-width: 1024px`, `768px`, `480px`) con scrollbars personalizados y preservación del flujo horizontal.

### HTML5 Semántico & WAI-ARIA 1.2

* **Propósito**: Estructura de documentos, semántica accesible y lectores de pantalla.
* **Justificación**: Cumplimiento riguroso de las pautas de accesibilidad **WCAG 2.1 nivel AA**.
* **Elementos y atributos destacados**:
  * Etiquetas semánticas: `<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<kbd>`.
  * Botones semánticos nativos `<button type="button">`: Se evita el uso de `<label>` inline para controles de barra de herramientas (como importación de archivos), garantizando consistencia en el box-model, alineación vertical exacta y soporte completo de teclado.
  * Roles ARIA: `role="region"`, `role="status"`, `role="alert"`, `aria-roledescription="Tarjeta Kanban"`.
  * Live Regions: `aria-live="polite"` y `aria-live="assertive"` para narrar eventos dinámicos.

---

## 2. APIs Nativas del Navegador

### API Nativa de Drag and Drop (HTML5 DnD)

* **Propósito**: Arrastre y colocación de tarjetas entre columnas y reordenamiento vertical con el cursor.
* **Ventaja**: Cero dependencias externas para la funcionalidad táctil/ratón básica. Se implementaron indicadores visuales dinámicos de inserción (`.drop-indicator-top` y `.drop-indicator-bottom`) calculando el punto medio (`clientY`) de la tarjeta sobrevolada.

### API Nativa para Diálogos Modales (Dialog API)

* **Propósito**: Ventanas modales para creación y edición de tarjetas, gestión de tableros y panel de atajos.
* **Ventaja**: El método nativo `.showModal()` aísla automáticamente el contenido exterior colocándolo en estado `inert`, bloquea el foco dentro del diálogo sin requerir bibliotecas externas complejas y gestiona la tecla `Escape` y el cierre con clic en el fondo de forma estandarizada.

### Web Storage API (LocalStorage)

* **Propósito**: Persistencia de datos, tableros y preferencia de tema del usuario.
* **Implementación**: Capa de abstracción con validación de esquemas JSON, tolerancia a fallos, recuperación automática con datos de prueba (*seed data*) y funciones de importación/exportación de copias de seguridad en formato `.json`.

---

## 3. Iconografía y Herramientas

### Lucide Icons (Renderizado SVG Vectorial Puro)

* **Propósito**: Iconografía vectorial profesional, limpia y coherente basada en SVG.
* **Implementación**: Renderizador de SVG nativo que extrae las especificaciones vectoriales de Lucide y genera elementos SVG optimizados con control de tamaño, grosor de trazo (`stroke-width`) y soporte de color mediante `currentColor`. Se garantiza centrado perfecto mediante `margin: auto; display: block;` para evitar desplazamientos verticales.

### Vite (Build Tool & Servidor de Desarrollo)

* **Propósito**: Empaquetado ultrarrápido, recarga en caliente de módulos (HMR) y compilación optimizada para producción.
* **Configuración de ruta base**: `base: '/Kanban_Tableu/'` configurado en `vite.config.js` para asegurar la resolución correcta de activos relativos en GitHub Pages.
* **Métricas de compilación**:
  * Tamaño CSS comprimido: ~6.4 kB (gzip).
  * Cero sobrecarga de runtime: arranque instantáneo en menos de 250 ms.

---

## 4. CI/CD y Despliegue en Producción

### GitHub Actions & GitHub Pages

* **Automatización**: Flujo continuo definido en `.github/workflows/deploy.yml` que compila el bundle estático en cada push a la rama `main` y lo publica automáticamente en GitHub Pages.
* **Despliegue local alternativo**: Script `npm run deploy` utilizando la utilidad `gh-pages` para publicar directamente la carpeta `dist/` a la rama `gh-pages`.
* **URL de producción**: [https://hugoadama.github.io/Kanban_Tableu/](https://hugoadama.github.io/Kanban_Tableu/)
