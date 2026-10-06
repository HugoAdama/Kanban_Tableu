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
* **Multi-Board Support**: Seamless switching between different project boards, custom column creation, color coding, renaming, and safe deletion.
* **Advanced Multi-Criteria Filtering**: Instant real-time search across titles and descriptions combined with priority, tag, and due date filters (overdue and upcoming alerts).
* **Vector Iconography**: Professional and consistent SVG iconography powered by Lucide.
* **Accessible Dark & Light Themes**: HSL-based design system with persistent theme preference and WCAG AA contrast compliance.
* **Local Persistence & Portability**: Automatic `localStorage` synchronization with JSON export and import for demos and backups.

---

## Keyboard Navigation & Accessibility Guide

| Action | Shortcut |
| :--- | :--- |
| **Grab / Drop Card (Move Mode)** | <kbd>Space</kbd> or <kbd>Enter</kbd> |
| **Reorder within Column** | <kbd>↑</kbd> / <kbd>↓</kbd> |
| **Move to Previous / Next Column** | <kbd>←</kbd> / <kbd>→</kbd> |
| **Cancel Movement & Revert** | <kbd>Esc</kbd> |
| **Undo Last Action** | <kbd>Ctrl</kbd> + <kbd>Z</kbd> |
| **Redo Action** | <kbd>Ctrl</kbd> + <kbd>Y</kbd> |
| **Keyboard Shortcuts Help** | <kbd>?</kbd> |
| **Navigate Elements** | <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> |

---

## Project Architecture

```
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
   git clone https://github.com/your-username/kanban-tableu.git
   cd kanban-tableu
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

5. Preview production build:
   ```bash
   npm run preview
   ```

---

## Documentation

Detailed architectural notes and learnings are available in the `docs/` folder:
* **[docs/tecnologias.md](docs/tecnologias.md)**: Deep dive into the chosen technologies, native browser APIs, performance benchmarks, and rationale.
* **[docs/aprendizajes.md](docs/aprendizajes.md)**: Lessons learned in managing complex client-side state, Command patterns for history, and building accessible keyboard-driven interfaces.

---

## License

MIT License. Free to use and adapt for your own portfolio projects.
