# Kanban Tableu

> A high-performance, accessible, and modular Kanban board built with modern Vanilla JavaScript, CSS Design Tokens, and native web APIs. Designed with zero runtime framework dependencies, full WCAG 2.1 AA keyboard accessibility, native Drag and Drop, multi-board management, multi-criteria filtering, and an Undo/Redo history stack.

[![Live Demo](https://img.shields.io/badge/demo-live%20preview-6366f1?style=for-the-badge)](https://hugoadama.github.io/Kanban_Tableu/)

🔗 **Live Demo**: [https://hugoadama.github.io/Kanban_Tableu/](https://hugoadama.github.io/Kanban_Tableu/)

---

## Highlights & Portfolio Value

* **Zero-Framework Architecture**: Built with modular ES2023+ JavaScript, decoupled event-driven reactive state (`EventTarget`), and standard CSS Custom Properties.
* **Standout Keyboard Accessibility (a11y)**: Complete card reordering and cross-column movement using only the keyboard (`Space` / `Enter` to grab/drop, `Arrow Keys` to reorder or transfer, `Esc` to cancel), accompanied by real-time `aria-live` screen reader announcements.
* **Native HTML5 Drag & Drop**: Fluid mouse drag-and-drop with real-time midpoint insertion indicators (`.drop-indicator-top` and `.drop-indicator-bottom`).
* **Command Pattern Undo & Redo**: Full action stack (`Ctrl + Z` / `Ctrl + Y`), toolbar history controls, and interactive Toast notifications with direct "Undo" actions.
* **Multi-Board Support & Adaptive Column Actions**: Seamless switching between boards, column creation from both the horizontal track and header metrics pill (`+ Añadir Columna`), color coding, and renaming.
* **Advanced Multi-Criteria Filtering & Quick Chips**: Instant search across titles and descriptions combined with priority, tag, and due date filters alongside 1-click quick-filter chips (`Todos`, `Urgente`, `Alta`, `Próximas`, `Vencidas`, `Bugs`).
* **Precision Vector Iconography & Pixel Alignment**: SVG iconography powered by Lucide with standardized 38px utility groups, semantic buttons, and flex alignment.
* **Accessible Dark & Light Themes**: HSL-based design system with persistent theme preference and WCAG AA contrast compliance (7:1+ contrast ratios).
* **Local Persistence & Portability**: Automatic `localStorage` synchronization with JSON export and import for demos and backups.

---

## Keyboard Navigation & Accessibility Guide

| Action | Shortcut |
| :--- | :--- |
| **Grab / Drop Card (Move Mode)** | `Space` or `Enter` |
| **Reorder within Column** | `↑` / `↓` |
| **Move to Previous / Next Column** | `←` / `→` |
| **Cancel Movement & Revert** | `Esc` |
| **Undo Last Action** | `Ctrl` + `Z` |
| **Redo Action** | `Ctrl` + `Y` |
| **Keyboard Shortcuts Help** | `?` |
| **Navigate Elements** | `Tab` / `Shift` + `Tab` |

---

## Project Architecture

```text
KANBAN_TABLEU/
├── docs/
│   ├── tecnologias.md          # Technical stack, browser APIs & justification
│   └── aprendizajes.md         # Architecture decisions, state complexity & a11y
├── src/
│   ├── core/
│   │   ├── types.js            # Priorities, default tags, and event definitions
│   │   ├── seedData.js         # Realistic initial data for portfolio showcases
│   │   ├── storage.js          # LocalStorage persistence & JSON export/import
│   │   ├── history.js          # Command/Snapshot stack for Undo & Redo
│   │   └── store.js            # Central reactive store extending EventTarget
│   ├── services/
│   │   ├── dndService.js       # Native HTML5 Drag and Drop engine
│   │   ├── keyboardA11yService.js # Accessible keyboard drag & move controller
│   │   ├── filterService.js    # Search matching, tag filtering & due date logic
│   │   └── notificationService.js # Toasts with integrated undo trigger
│   ├── ui/
│   │   ├── icons.js            # Clean Lucide SVG icon renderer
│   │   ├── dialogs.js          # Accessible native <dialog> modals
│   │   ├── headerView.js       # App header, board switcher, search & filters
│   │   ├── boardView.js        # Column swimlanes, card components & dropzones
│   │   └── a11yAnnouncer.js    # ARIA live region narrator for screen readers
│   ├── styles/
│   │   ├── variables.css       # Design tokens, HSL colors & theme definitions
│   │   ├── reset.css           # Accessible reset & custom scrollbars
│   │   ├── layout.css          # App layout, header & controls
│   │   ├── board.css           # Kanban columns & horizontal track
│   │   ├── card.css            # Cards, badges, tags & drag/grab states
│   │   ├── dialog.css          # Native <dialog> modals & form styling
│   │   ├── toast.css           # Floating notifications
│   │   ├── a11y.css            # Floating keyboard bar & focus indicators
│   │   └── main.css            # Style aggregator
│   ├── app.js                  # Main app orchestrator & global shortcuts
│   └── main.js                 # Entry point
├── index.html
└── package.json
```

---

## Getting Started

### Prerequisites

* Node.js v18+ (tested on v24+)
* npm v9+

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/HugoAdama/Kanban_Tableu.git
   cd Kanban_Tableu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

---

## Deployment & CI/CD

The application is deployed live to GitHub Pages using two automated avenues:
* **GitHub Actions Workflow** (`.github/workflows/deploy.yml`): Automatically triggers upon pushes to the `main` branch, installing dependencies, compiling production bundles with Vite (`base: '/Kanban_Tableu/'`), and deploying directly to GitHub Pages.
* **gh-pages CLI integration**: Fast local deployment command (`npm run deploy`) that builds and pushes the production `dist/` directory to the `gh-pages` branch.

---

## Documentation Suite

Detailed architectural notes, design decisions, and guides are available in the `docs/` folder:
* **[docs/tecnologias.md](docs/tecnologias.md)**: Deep dive into the chosen technologies, native browser APIs, responsive design tokens, and architectural rationale.
* **[docs/arquitectura.md](docs/arquitectura.md)**: Layered software architecture (`core`, `services`, `ui`), unidirectional data flow, reactive `EventTarget` store, and Command pattern.
* **[docs/accesibilidad.md](docs/accesibilidad.md)**: Comprehensive WCAG 2.1 AA accessibility guide, virtual grab keyboard navigation, ARIA live narrator, and high-contrast color ratios.
* **[docs/aprendizajes.md](docs/aprendizajes.md)**: Lessons learned in managing complex state, solving cross-browser `<label>` vs `<button>` alignment nuances, and action discovery patterns.
* **[docs/guia_desarrollo.md](docs/guia_desarrollo.md)**: Developer setup, extension recipes (custom tags/priorities), manual QA checklist, and CI/CD pipelines.

---

## License

MIT License. Free to use and adapt for your own portfolio projects.
