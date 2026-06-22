# Registro de Consumos — Prototipo

App para registrar y analizar consumos de energía (electricidad, combustible, agua, refrigerantes) por sucursal. Stack: React + JSX inline sin bundler, montado en un HTML único.

## Estructura del proyecto

```
registro-de-consumos/
├── index.html             # Punto de entrada — carga todos los scripts en orden
├── proto/                 # Componentes activos de la app
│   ├── state.jsx          # Reducer global + contexto + helpers derivados
│   ├── shell.jsx          # Layout: sidebar colapsable + ViewSwitcher + toast
│   ├── landing.jsx        # Pantalla Inicio (panel de registros + sucursales)
│   ├── manual.jsx         # Flujo registro manual (form → preview → success)
│   ├── upload.jsx         # Flujo subir documento (proveedor → dropzone → cola)
│   ├── preview.jsx        # Tabla editable post-extracción PDF
│   ├── dashboard.jsx      # Dashboard: KPIs, gráficos, heatmap, tabla editable
│   ├── upload-matrix.jsx  # Matriz de carga por sucursal × tipo × mes
│   ├── config.jsx         # Lista de sucursales configuradas
│   ├── config-edit.jsx    # Editar una sucursal (tipos + subcategorías)
│   ├── onboarding.jsx     # Wizard de setup inicial (3 pasos)
│   ├── onboarding-items.jsx
│   ├── onboarding-summary.jsx
│   ├── sync.jsx           # Capa Google Sheets / Drive
│   ├── extractors.jsx     # Lógica de extracción PDF por proveedor
│   └── primitives.jsx     # Componentes UI reutilizables (Btn, Card, Field…)
├── ds/                    # Design system (tokens CSS + tipografía)
└── _design_source/        # Wireframes y prototipos anteriores (referencia)
```

## Enrutamiento

El estado `view` controla la pantalla activa (ver `state.jsx` línea 86):

| view | Pantalla |
|------|----------|
| `landing` | Inicio |
| `register` | Hub registrar |
| `manual` | Registro manual |
| `upload` | Subir documento |
| `dashboard` | Dashboard |
| `matrix` | Matriz de carga |
| `config` | Configuración |
| `config-edit` | Editar sucursal |
| `onboarding` | Wizard setup |

## Tipos de consumo

`electricidad` (kWh) · `combustible` (L / kg / m³) · `agua` (m³) · `refrigerantes`

## Comandos personalizados

- `/mapa` — Genera o actualiza `MAPA.md` con el árbol jerárquico numerado de todas las pantallas y secciones de la app.
