// Seed data with realistic multi-board setup for a standout portfolio

export function generateSeedData() {
  const today = new Date();
  
  // Format helpers for dates
  const formatDate = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  return {
    activeBoardId: 'board-sprint-24',
    boards: [
      {
        id: 'board-sprint-24',
        name: 'Sprint 24 - Plataforma Web',
        description: 'Iteración de desarrollo enfocada en rendimiento, accesibilidad y experiencia de usuario.',
        createdAt: new Date().toISOString(),
        columns: [
          {
            id: 'col-todo',
            name: 'Por hacer',
            color: '#6366f1',
            cards: [
              {
                id: 'card-1',
                title: 'Auditoría de accesibilidad WCAG 2.1 AA',
                description: 'Verificar ratios de contraste, etiquetas semánticas y compatibilidad con lectores de pantalla.',
                priority: 'alta',
                tags: ['frontend', 'docs'],
                dueDate: formatDate(3),
                createdAt: new Date().toISOString()
              },
              {
                id: 'card-2',
                title: 'Optimización de Largest Contentful Paint (LCP)',
                description: 'Implementar fetchpriority="high" y optimizar carga de recursos críticos.',
                priority: 'media',
                tags: ['frontend', 'devops'],
                dueDate: formatDate(5),
                createdAt: new Date().toISOString()
              },
              {
                id: 'card-3',
                title: 'Corrección de error en exportación CSV',
                description: 'El parser falla cuando las celdas contienen caracteres especiales o saltos de línea.',
                priority: 'urgente',
                tags: ['bug', 'backend'],
                dueDate: formatDate(-1), // Vencida para demostración
                createdAt: new Date().toISOString()
              }
            ]
          },
          {
            id: 'col-in-progress',
            name: 'En curso',
            color: '#f59e0b',
            cards: [
              {
                id: 'card-4',
                title: 'Implementar navegación por teclado en tablero',
                description: 'Permitir mover tarjetas entre columnas mediante atajos de teclado accesibles sin depender de ratón.',
                priority: 'alta',
                tags: ['feature', 'frontend'],
                dueDate: formatDate(1), // Próxima a vencer
                createdAt: new Date().toISOString()
              },
              {
                id: 'card-5',
                title: 'Integración de autenticación OAuth 2.0',
                description: 'Configurar flujo PKCE para clientes SPA con renovación transparente de tokens.',
                priority: 'media',
                tags: ['backend', 'feature'],
                dueDate: formatDate(4),
                createdAt: new Date().toISOString()
              }
            ]
          },
          {
            id: 'col-review',
            name: 'En revisión',
            color: '#ec4899',
            cards: [
              {
                id: 'card-6',
                title: 'Rediseño de componentes con Glassmorphism',
                description: 'Aplicar tokens de diseño consistentes, elevaciones con sombras HSL y modo claro/oscuro.',
                priority: 'media',
                tags: ['design', 'frontend'],
                dueDate: formatDate(2),
                createdAt: new Date().toISOString()
              }
            ]
          },
          {
            id: 'col-done',
            name: 'Hecho',
            color: '#10b981',
            cards: [
              {
                id: 'card-7',
                title: 'Configuración inicial de arquitectura modular',
                description: 'Separación estricta de capas: store reactivo, servicios DnD, historial de comandos y vistas.',
                priority: 'alta',
                tags: ['devops', 'docs'],
                dueDate: formatDate(-2),
                createdAt: new Date().toISOString()
              },
              {
                id: 'card-8',
                title: 'Soporte para múltiples tableros y persistencia local',
                description: 'Almacenamiento seguro en LocalStorage con serialización JSON y gestión de snapshots.',
                priority: 'baja',
                tags: ['feature'],
                dueDate: formatDate(-4),
                createdAt: new Date().toISOString()
              }
            ]
          }
        ]
      },
      {
        id: 'board-mobile-v2',
        name: 'Roadmap Producto & Mobile',
        description: 'Planificación estratégica de características para la versión móvil nativa y web app.',
        createdAt: new Date().toISOString(),
        columns: [
          {
            id: 'col-backlog',
            name: 'Por hacer',
            color: '#8b5cf6',
            cards: [
              {
                id: 'card-m1',
                title: 'Investigación de Progressive Web App (PWA)',
                description: 'Evaluar Service Workers para sincronización sin conexión y soporte de notificaciones push.',
                priority: 'media',
                tags: ['frontend', 'feature'],
                dueDate: formatDate(7),
                createdAt: new Date().toISOString()
              },
              {
                id: 'card-m2',
                title: 'Definir paleta de micro-interacciones',
                description: 'Documentar curvas bezier y duraciones para feedback háptico y animaciones.',
                priority: 'baja',
                tags: ['design'],
                dueDate: formatDate(10),
                createdAt: new Date().toISOString()
              }
            ]
          },
          {
            id: 'col-progress-m',
            name: 'En curso',
            color: '#38bdf8',
            cards: [
              {
                id: 'card-m3',
                title: 'Diseño de estados vacíos e ilustraciones SVG',
                description: 'Crear componentes visuales vectoriales para cuando una columna no tenga tarjetas.',
                priority: 'alta',
                tags: ['design'],
                dueDate: formatDate(2),
                createdAt: new Date().toISOString()
              }
            ]
          },
          {
            id: 'col-done-m',
            name: 'Hecho',
            color: '#10b981',
            cards: [
              {
                id: 'card-m4',
                title: 'Benchmarking de herramientas Kanban',
                description: 'Análisis comparativo de Trello, Linear y Jira enfocado en velocidad y accesibilidad.',
                priority: 'baja',
                tags: ['docs'],
                dueDate: formatDate(-3),
                createdAt: new Date().toISOString()
              }
            ]
          }
        ]
      }
    ]
  };
}
