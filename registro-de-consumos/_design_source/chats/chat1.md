# Recyclink Consumo Dashboard

_Started 2026-06-02 18:33 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Registro de Consumos 1.0"
Project is currently empty (no files)
Current date is now June 2, 2026
</system-info>

<pasted_text name="Pasted text (68 lines)">
Diseña la interfaz UX/UI de una web para registro y visualización 
de consumos de servicios básicos en empresas (combustible, 
electricidad y agua). La web es neutra (sin marca propia) porque 
se embebe vía iframe en otra plataforma. Solo desktop.

Aplica el sistema de diseño cargado en este workspace para todos 
los componentes, tokens de color, tipografía, espaciados y estados.

USUARIOS
Equipo administrativo no técnico de empresas, registra consumos 
mensuales. Necesita rapidez, claridad y tolerancia a errores.

PANTALLAS REQUERIDAS

1. Landing / Selector de modo
   Dos accesos grandes y claros:
   a) "Registrar manualmente"
   b) "Subir documento"
   Más un acceso secundario a "Ver dashboard"

2. Registro manual
   Form con: empresa, sucursal (dropdown precargado), mes de 
   registro, tipo de consumo (combustible/electricidad/agua), 
   proveedor, cantidad, costo. Validaciones inline. Botón guardar 
   con preview antes de confirmar.

3. Subida de documentos
   Paso 1: seleccionar tipo de proveedor del documento 
   (Enel, Aguas Andinas, Iconstruye Petróleo, Iconstruye Gas).
   Paso 2: drop zone para uno o varios archivos (PDF/Excel).
   Paso 3: lista de archivos con estado individual:
     • Procesando (spinner)
     • Listo para revisar (extracción ok)
     • Duplicado detectado (warning con opción ignorar/sobrescribir)
     • Error parseando (con CTA "Completar manualmente")
     • Datos atípicos (warning, no bloquea)
   Si un archivo falla, los demás continúan.

4. Preview editable
   Tabla con los datos extraídos de cada documento antes de 
   escribir en BBDD. Celdas editables. Validación de campos 
   obligatorios. Botón "Confirmar y guardar" + "Descartar".

5. Dashboard
   Cards con KPIs (consumo total mes, costo total, # sucursales 
   activas, # documentos procesados).
   Gráficos: consumo por tipo, costo por mes, top sucursales.
   Filtros: empresa, sucursal, tipo, rango de fechas.
   Tabla detallada al final con edición inline (cambia BBDD).

ESTADOS A DISEÑAR EXPLÍCITAMENTE
- Vacío inicial (sin datos aún)
- Cargando / procesando
- Éxito (confirmación con cantidad de filas agregadas)
- Error de parseo (mensaje claro, no técnico)
- Duplicado detectado (modal con preview comparativo)
- Datos atípicos (banner de advertencia en fila afectada)
- Edición exitosa en dashboard

INTERACCIONES CLAVE
- Drop zone con feedback visual al arrastrar archivo
- Tabla editable con foco claro en celda activa
- Loaders inline por archivo (no global)
- Confirmaciones no intrusivas
- Modales solo para acciones destructivas o duplicados

ENTREGA
Mockups de las 5 pantallas con todos los estados listados.
</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Wireframe">
Help the user explore design ideas quickly. Interview them, then generate multiple rough wireframes to map out the design space before committing to a direction. Prioritize breadth over polish: show 3-5 distinctly different approaches for each idea. Use simple shapes, placeholder text, and minimal color to keep the focus on structure and flow. Use a sketchy vibe -- handwritten but readable fonts; b&w with some color; low-fi and simple. Provide simple tweaks; show options side-by-side if small or using a tab control if large.
</attached-skill>

<attached-skill name="Recylink Design System (design system)">
[Design System] This project uses the **Recylink Design System** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

    Explore it to find what you need:
    - Always copy out the fonts and colors you need
    - For prototypes and designs, always copy out any relevant components
    - If the design system contains existing mocks of products, and you were asked to design or prototype something similar, copy and fork those mocks to start your design. This helps you make high-quality designs.

    Explore it quickly to find relevant UI kits (e.g. mocks of existing products you can copy and fork)

Full system at `/projects/49cd8673-a4f9-4ab4-9dbf-327989784752/`. Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# Recylink Design System

A design system reconstructed from the **"Sistema de diseño Recylink"** Figma file plus official Recylink brand assets (logos + the Plus Jakarta Sans typeface). Use it to design, prototype and ship Recylink interfaces with the right colors, type, spacing, shadows and component vocabulary.

---

## 1. Company &amp; product context

**Recylink** is a Latin-American (originally Chilean) B2B platform that connects waste generators (factories, malls, offices, condominiums) with recyclers and transporters to manage and trace industrial / corporate waste pickups. The product is a SaaS dashboard used by:

- **Generators** — schedule pickups, see how much waste they've recycled, track payments / earnings ("Mis ganancias", "Total de viajes completados").
- **Transporters &amp; recyclers** — accept jobs, manage routes, upload pickup paperwork ("Planilla Enero", file uploads, status: Pendiente / Confirmado / Desabilitado).
- **Admins** — onboard companies, manage users, monitor operations across the network.

The Figma file's welcome page describes the four product design principles in Spanish:

1. **ACCESIBLE** — inclusive interfaces, WCAG 2.0 / 2.1 conformance.
2. **ASEQUIBLE** — intuitive, sequential, low-friction flows that users can follow on instinct.
3. **CERCANA** — warm, conversational guidance; the UI is "next to you" not at you.
4. **TRANSPARENTE** — honest copy, clear states, easy to recover from mistakes.

The system is built in Spanish first. English copy is acceptable but secondary.

### Source materials

| Source | Where |
| --- | --- |
| Figma file | "Sistema de diseño Recylink.fig" (mounted as a virtual FS during build). Page index: `/WELCOME` (intro + design principles) and `/COMPONENTES` (the bulk of the system: Colores, Tipografía, Sombras, Grid System, Sidebar, Botones, Inputs, Card, Card-dashboard, Tablas, Chips, Chip-estados, Status, Toast, Notificaciones, Dropdowns, Tooltips, Checkbox, Radiobutton, Day-picker, Pagination, Empty-state Illustrations, Iconos, etc.) |
| Logos | `assets/logo-color.png`, `assets/logo-color-horizontal.png`, `assets/logo-white.png`, `assets/logo-white-horizontal.png` |
| Webfont | Plus Jakarta Sans (Light / Regular / Medium / SemiBold / Bold / ExtraBold + italics) under `fonts/` |

If you need the live Figma, ask the project owner — direct URLs were not shared with this build.

---

## 2. Index — what's in this folder

| File / folder | What it is |
| --- | --- |
| `README.md` | This file — context, content, visual, iconography guides |
| `SKILL.md` | Agent skill manifest — `recylink-design` |
| `colors_and_type.css` | All design tokens as CSS custom properties + base styles |
| `fonts/` | Plus Jakarta Sans .ttf weights |
| `assets/` | Logos (color + white, mark + horizontal) |
| `preview/` | Atomic preview cards used by the Design System review tab |
| `ui_kits/app/` | High-fidelity recreation of the Recylink web app (sidebar, dashboard, table screens, modals, etc.) — see its own README |
| `_ds_manifest.json` | Generated by `register_assets`. Don't edit by hand. |

---

## 3. CONTENT FUNDAMENTALS

&gt; *"Buscamos construir diálogos en los que las personas sean parte y se sientan integradas y contenidas."* — Recylink Design Principles

### Language &amp; locale
- **Primary language: Spanish (es-419 / es-CL).** Default to Spanish unless the user explicitly switches. Use Latin-American conventions: no "vosotros", no Spain-only idioms.
- Number / date format: `1.234,56`, `dd/mm/yyyy`, 24h ("Marzo 2023").
- Currency is local (CLP / USD / depending on tenant) — never hard-code "$" without context.

### Voice &amp; tone
- **Cercana (warm, near).** Talk *with* the user, not *to* them. Treat the platform as a calm companion that helps complete an action.
- **Transparente.** Always tell users what just happened, what will happen next, and how to undo. Error and "in espera" states are first-class — never leave a process opaque.
- **Asequible.** Short sentences, plain words, action verbs first ("Crear viaje", "Subir planilla", "Confirmar pickup").

### Casing
- **Sentence case** for buttons, menus, headings, table headers. Examples from the file: "Botón primario", "Componente principal", "Total de viajes completados", "Mis ganancias".
- **UPPERCASE** is reserved for two narrow uses:
  - Spec headings on principle pages: `ACCESIBLE`, `ASEQUIBLE`, `CERCANA`, `TRANSPARENTE` (Assistant Bold 38px).
  - Tracked eyebrow labels above sections: `ROLES QUE INTERACTÚAN`, with `letter-spacing: 0.10em`.
- Title Case is **not** used.

### Person
- The product addresses the user as **tú** in Spanish: "Te doy la bienvenida", "Tendrás más tiempo", "Tu equipo". Never "usted" unless writing for a very formal compliance flow.
- The product refers to itself in third person ("Recylink te ayuda…") or first-plural ("Buscamos experiencias inclusivas").

### Emoji
- **Not used in product UI copy.** The Figma includes the full Unicode emoji catalogue *as an icon picker resource* (Section-2 emoji directory), but emoji are not part of buttons, headers, toasts, or marketing copy.

### Punctuation &amp; typography conventions
- Spanish inverted marks (`¿`, `¡`) are required.
- Use real curly quotes (`"…"` ✗ → `«…»` or `"…"` per locale) — never straight quotes in display copy.
- Ellipsis is a single character `…`, not three dots.

### Examples (real, from the file)

&gt; **Welcome card.** "Te doy la bienvenida al nuevo sistema de diseño de RECYLINK. Este archivo es una herramienta digital que se utiliza como guía para que los equipos de diseño colaboren en la creación de productos y experiencias digitales."

&gt; **Color section subtitle.** "Nuestro sistema de diseño aprovecha un conjunto específico de estilos de color como el punto de partida perfecto para cualquier marca o proyecto. Cuando se trata de color, el contraste es fundamental para garantizar que el texto sea legible."

&gt; **Primary button intent.** "El botón indica la acción principal, y sólo hay un botón principal para una sección de acción."

&gt; **Status chip text.** `Pendiente`, `Desabilitado`, `Confirmado`, `En curso`, `Planilla Enero — Svg`.

---

## 4. VISUAL FOUNDATIONS

### Color
Recylink anchors on **two brand families**: **green** (recycling, "RECY") and **blue** (water / trust, "LINK"). In the UI the **blue** is the primary interactive color; green is reserved for the logo and the success state.

- **Primary action color** — `#0069A6` (900). This is the canonical interactive blue: action buttons, focus rings, links, selected nav, progress fills. `#0083C0` (800) is the brighter logo blue, used for accents/illustration only. Hover darkens to `#00528B` (700), pressed to `#003E66` (950).
- **Soft brand band** — `#A3CAFD` and `#89C9F3` are used as wide horizontal hero bands at the top of section pages (Colores, Botones, Grid System pages).
- **Neutral gray ramp** — 12 steps from `#FCFCFD` (25) to `#0C111D` (950) — the everyday fabric (text, fields, borders, table rows).
- **No purple.** Recylink does not use purple. Accents, count chips and "Sugerencia IA" callouts use brand-blue tints (`#E6F4FB` fill, `#00528B` text) or neutral gray. Legacy `--rl-secondary-*` tokens are aliased to the blue ramp so they always render on-brand.
- **Semantic** — Error red (`#F04438` core), Warning amber (`#F79009` core), Success green (`#12B76A` / `#027A48`).

All steps are WCAG-tagged in the Figma swatches (AA/AAA badges) — see `preview/colors-*.html`.

### Type
- **Type** — a single typeface, **Plus Jakarta Sans**, is used everywhere (display, body, and dense UI atoms). Inter is **not** used.
- Display sizes use slight negative tracking (`-0.02em`); body uses normal tracking; eyebrows use wide tracking (`0.10em`).
- Line-heights: display 1.2 / body 1.5 / dense UI 1.1.

&gt; **Note:** Plus Jakarta Sans is the *only* typeface. Earlier drafts referenced Inter for dense UI atoms — that has been removed; everything uses Plus Jakarta Sans.

### Spacing
4-pt base scale (`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 96`). Page padding on a Botones page is `48px top / 96px sides / 88px bottom`. Card padding on dashboard cards is `26px 30px`. Section-internal gaps are usually `16` or `24`.

### Layout
The Figma defines 6 canonical breakpoints: **1920 / 1320 / 1140 (recommended) / 960 / 834 tablet / 428 mobile**. Page content sits in a 1140-wide content well centred on a white canvas (`#FCFEFF`).

### Backgrounds
- Pages are **flat white / off-white** (`#FFFFFF` or `#FCFEFF`).
- Section "page headers" use a wide **`#A3CAFD` light-blue band** with the logo right-aligned and a small eyebrow label ("General", "Átomos") left.
- **No gradients** in product UI. No textures, no grain.
- Marketing surfaces may use a **green-to-blue** diagonal echoing the logo's tiled diamond — kept tasteful; the logo itself already provides movement.
- Photos / hero imagery, when used, are **bright daylight**, **clean industrial / outdoor recycling settings**, no heavy filters.

### Borders
- Default border: `1px solid var(--rl-gray-200)` (`#E4E7EC`).
- Subtle dividers between table rows: `1px solid #EEEEEE`.
- Focus ring: `0 0 0 4px rgba(0,105,166,0.18)` + `1px solid var(--rl-primary-900)`.

### Corner radii
- Inputs, small buttons: **6 / 8 px**.
- Cards, dashboard tiles: **10 px**.
- Containers, large panels: **16 / 24 px**.
- Section "page" wrappers: **30 px** (rounded outer page chrome).
- Chips, pills, status: **999 px (pill)**.

### Shadows
Two systems live side-by-side:

- **Untitled-UI ramp** (xs / sm / md / xl) — used by inputs, popovers, dropdowns. Cool grey-blue (`rgba(16,24,40,…)`).
- **Soft warm card shadow** — `0 4px 36px 0 rgba(190,190,190,0.25)` — used by dashboard tile cards (the "Mis ganancias", "Total de viajes" cards).

There is **no inner-shadow** treatment; depth comes from outer shadows + border.

### Motion
- The Figma file itself ships no Lottie / motion specs. From the principles ("Cercana, transparente, asequible") infer:
  - Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) — calm, no overshoot.
  - Duration: 150 ms for hover state, 200–250 ms for entering surfaces (toasts, drawers), 400 ms for page transitions.
  - **No bouncy / spring overshoots.** No big "wow" animations — the brand value is calm.
  - Fades + small Y translations (4–8px) for toasts and dropdowns.

### States (hover / press / focus / disabled)
- **Hover (buttons):** primary darkens from `#0069A6` → `#00528B`; secondary fills `--rl-gray-50`. Links underline + shift to 700.
- **Press:** fill darkens one further step OR a 6% black overlay; no scale-down.
- **Focus:** 4-px translucent brand ring (`var(--rl-shadow-focus)`) + 1-px solid `--rl-primary-900` outline. Visible on keyboard always.
- **Disabled:** opacity 100% but desaturate — fill `--rl-gray-100`, text `--rl-gray-400`, pointer `not-allowed`.

### Transparency &amp; blur
- Used sparingly. Sticky table headers use `rgba(255,255,255,0.96) + backdrop-blur(8px)`. Modal scrim `rgba(16,24,40,0.40)`. Card placeholders (loading skeletons) use `rgba(217,217,217,0.35)`.
- Avoid `backdrop-filter` for product surfaces — performance.

### Cards
A "card" in Recylink is:
- White surface (`#FFFFFF`).
- Radius 10 px.
- Border? **No** — cards are border-less; depth is purely the soft `0 4px 36px rgba(190,190,190,0.25)` shadow.
- Padding `26px 30px`.
- Header row: label (`Plus Jakarta Sans 16/18 #727272`) + circular icon chip (50×50, brand-tinted fill, 16-px icon inside).
- Big value row: `Plus Jakarta Sans Bold 32px`.
- Trend / delta row (optional): success/error chip + arrow icon.

Form / table cards may use the lighter Untitled-UI shadow (`--rl-shadow-md`) and add a `1px solid var(--rl-gray-200)` border when the soft-shadow style would over-emphasize them.

---

## 5. ICONOGRAPHY

### Icon system
The Figma uses a **24-px stroke icon set** that is functionally identical to **[Feather Icons](https://feathericons.com)** — same stroke weight (1.5–2 px), same rounded line caps, same geometry. **Feather is the canonical Recylink icon set.** Common names seen in the file: `check`, `eye`, `alert-triangle`, `plus`, `chevron-down`, `chevron-left`, `chevron-right`, `bell`, `book`, `map-pin`, `trash`, `trending-up`, `users`, `x`.

- **Default size:** 24 × 24 px (canvas), 1.5 px stroke. Containers around icons in the system are 30 × 30 with 6-px radius and `--rl-shadow-xs`.
- **Compact size:** 16 × 16 (chips, inline status icons).
- **Color:** inherits `currentColor`; defaults to `--rl-fg` on white, `--rl-fg-on-brand` on primary fills.

**Icon set** — **Feather Icons** (CDN: `https://unpkg.com/feather-icons`) is the canonical set. When a needed glyph isn't in Feather (e.g. `recycle`, `building`), fall back to **[Google Material Symbols](https://fonts.google.com/icons)** (outlined, weight 400) — or the nearest Feather alias (the UI kit maps a handful in `Primitives.jsx`). If the product code already ships a curated subset, copy it into `assets/icons/` and prefer that.

### Logo
- The logomark is a **tiled diamond** of green (top-left half) + blue (bottom-right half) squares, evoking a Möbius-style recycling loop. The wordmark is split: **RECY** in green (`~#22A04A` / `~#92DE92` highlights) + **LINK** in deep brand blue (`#0069A6`), with a registered-trademark `®` glyph.
- Always use the supplied PNGs (`assets/logo-color*.png`, `assets/logo-white*.png`). Never recolor segments, never crop the diamond.
- Clear-space around the logo equals the height of the "R" glyph.
- Minimum size: 24 px tall (mark only) or 96 px wide (horizontal lockup).

### Imagery / illustrations
The Figma includes a small **"Empty state illustrations"** set: line-art style, brand blue stroke, no fill — used on empty data tables, no-conversation states, failed file uploads ("No pudimos cargar tu archivo"). We don't have rasters of these in the upload bundle; recreate as simple SVGs if needed and flag for design review.

### Emoji &amp; Unicode glyphs
- **Not used as icons.** The Section-2 emoji directory in the Figma exists *only* as a picker resource for in-app messaging features.
- Unicode characters (`✓`, `→`, `×`) are acceptable as inline decorators in dense table cells; never as primary icons.

---

## 6. UI kits

See `ui_kits/app/README.md` for the high-fidelity recreation of the Recylink web app surface (sidebar nav, dashboard, table screens, modal patterns). The kit is interactive — `index.html` boots an in-memory app you can click through.

---

## 7. Caveats &amp; substitutions

- **Icon set** — **Feather Icons** (CDN). When a glyph isn't in Feather (`recycle`, `building`…), fall back to **Google Material Symbols** or the nearest Feather alias (mapped in the UI kit's `Primitives.jsx`).
- **Empty-state illustrations** — the Figma's bespoke line-art set was not extracted as standalone SVGs. When you need an empty state, use a single Feather icon at 48 px in `--rl-gray-300` as a placeholder and flag for design.
- **Animation specs** — derived from the design principles; no canonical Lottie / Framer values were in the Figma. Confirm with brand owner before locking timing.

</design-system-guide>

CSS tokens: the guide may describe tokens in prose, but the exact `--*` names are defined in the design system's stylesheet(s) (`/projects/49cd8673-a4f9-4ab4-9dbf-327989784752/colors_and_type.css`). The 147 custom properties it defines are:

--rl-action, --rl-action-active, --rl-action-hover, --rl-bg, --rl-bg-canvas, --rl-bg-muted, --rl-bg-subtle, --rl-border, --rl-border-focus, --rl-border-strong, --rl-border-subtle, --rl-container-1140, --rl-container-1320, --rl-container-1920, --rl-container-mobile, --rl-container-tablet, --rl-display-2xl, --rl-display-lg, --rl-display-md, --rl-display-sm, --rl-display-xl, --rl-display-xs, --rl-error-100, --rl-error-200, --rl-error-25, --rl-error-300, --rl-error-400, --rl-error-50, --rl-error-500, --rl-error-600, --rl-error-700, --rl-error-800, --rl-error-900, --rl-error-950, --rl-fg, --rl-fg-body, --rl-fg-disabled, --rl-fg-muted, --rl-fg-on-brand, --rl-fg-strong, --rl-fg-subtle, --rl-font-body, --rl-font-display, --rl-font-mono, --rl-font-ui, --rl-gray-100, --rl-gray-200, --rl-gray-25, --rl-gray-300, --rl-gray-400, --rl-gray-50, --rl-gray-500, --rl-gray-600, --rl-gray-700, --rl-gray-800, --rl-gray-900, --rl-gray-950, --rl-h1, --rl-h2, --rl-h3, --rl-h4, --rl-h5, --rl-letter-normal, --rl-letter-tight, --rl-letter-wide, --rl-link, --rl-link-hover, --rl-primary-100, --rl-primary-200, --rl-primary-300, --rl-primary-400, --rl-primary-50, --rl-primary-700, --rl-primary-800, --rl-primary-900, --rl-primary-950, --rl-primary-light-header, --rl-radius-2xl, --rl-radius-3xl, --rl-radius-lg, --rl-radius-md, --rl-radius-pill, --rl-radius-sm, --rl-radius-xl, --rl-radius-xs, --rl-secondary-100, --rl-secondary-200, --rl-secondary-25, --rl-secondary-300, --rl-secondary-400, --rl-secondary-50, --rl-secondary-500, --rl-secondary-600, --rl-secondary-700, --rl-secondary-800, --rl-secondary-900, --rl-secondary-950, --rl-shadow-focus, --rl-shadow-lg, --rl-shadow-md, --rl-shadow-sm, --rl-shadow-xl, --rl-shadow-xs, --rl-space-0, --rl-space-1, --rl-space-10, --rl-space-12, --rl-space-16, --rl-space-2, --rl-space-24, --rl-space-3, --rl-space-4, --rl-space-5, --rl-space-6, --rl-space-8, --rl-success-100, --rl-success-200, --rl-success-25, --rl-success-300, --rl-success-400, --rl-success-50, --rl-success-500, --rl-success-600, --rl-success-700, --rl-success-800, --rl-success-900, --rl-success-950, --rl-surface, --rl-surface-alt, --rl-text-lg, --rl-text-md, --rl-text-sm, --rl-text-xs, --rl-ui-md, --rl-ui-sm, --rl-warning-100, --rl-warning-200, --rl-warning-25, --rl-warning-300, --rl-warning-400, --rl-warning-50, --rl-warning-500, --rl-warning-600, --rl-warning-700, --rl-warning-800, --rl-warning-900, --rl-warning-950

Only use `var(--*)` names from that list. Never guess a token name — an unresolved `var()` silently falls back to the browser default.

For assets and UI kits beyond the guide: `read_file("/projects/49cd8673-a4f9-4ab4-9dbf-327989784752/<path>")` and `copy_files` to bring them into the current project.
</attached-skill>

## Assistant

_[tool: questions_v2]_

Antes de empezar quiero confirmar un par de cosas para asegurarme de entregarte lo más útil. Veo que adjuntaste el skill de **Wireframe** y también el sistema de diseño de Recylink — eso suele significar dos enfoques bien distintos, así que te pregunto:

## User

Questions answered:
- fidelity: Wireframes lo-fi pero usando tipografía/colores Recylink (lo-fi con sabor de marca)
- exploration_breadth: 2 variantes para la Landing y el Dashboard, el resto resuelto
- landing_direction: 3, 0
- default_screen: Siempre la Landing (selector de modo)
- scope_multi_company: Una empresa fija (viene del host por iframe, no editable)
- doc_processing_model: Procesamiento por templates (Enel, Aguas Andinas, etc. con parser fijo)
- batch_size: 10
- dashboard_priority: KPIs grandes arriba, gráficos medianos, tabla compacta abajo
- chart_types: Líneas (tendencia), Heatmap por sucursal/mes
- destructive_confirm: Inline en la fila: dos botones (ignorar / sobrescribir) y un toggle de detalles
- outliers_rule: decide tu
- anything_else: Cada tipo de consumo tiene una unidad de medida distinta , por naturalez (m3, kwh), etc.
No puede haber graficos que tengan mas de un tipo de consumo.

## Assistant

_[tool: update_todos]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: copy_files]_

_[tool: copy_starter_component]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Listo. Te dejé los wireframes en un **canvas pan/zoom** con 5 secciones y 13 artboards — puedes hacer doble-click en cualquiera para abrirlo en focus mode y navegar con ←/→.

**Lo que está adentro:**

1. **Landing** — 2 variantes (tarjetas grandes / pregunta-wizard) + acceso secundario al dashboard
2. **Registro manual** — form con foco, error inline y campo "empresa" bloqueado (host) → preview con banner de dato atípico → éxito con deshacer
3. **Subida de documentos** — selector de proveedor (4 templates) → dropzone idle + dropzone con drag-over → cola con los **5 estados** visibles a la vez (procesando, listo, duplicado, error, atípico)
4. **Preview editable** — tabla con celda en edición (cursor parpadeante), duplicado resuelto **inline** con diff antiguo↔nuevo, banner de atípico por fila, fila con campo obligatorio faltante
5. **Dashboard** — 2 variantes (A: KPIs + tabs por tipo · B: bloque por tipo de consumo apilado), estado vacío inicial, edición inline guardada con toast no intrusivo

**Decisiones que tomé y conviene confirmar:**
- **Unidades nunca mezcladas en un gráfico** → en variante A los gráficos viven en tabs por tipo; en variante B cada tipo tiene su propio bloque con línea + heatmap.
- **Dato atípico** = +/-30% sobre el promedio últimos 6 meses (puesto en copy del banner). Si tienes otra regla, dímela y la cambio.
- **Outliers no bloquean** guardar; duplicados **sí** requieren decisión (ignorar/sobrescribir).
- Estética lo-fi pero con **Plus Jakarta Sans + azul Recylink (#0069A6) como único acento** — todo lo demás en escala de grises con bordes punteados en placeholders/dropzones.

**Próximos pasos sugeridos:**
- Si quieres ir a hi-fi, me dices cuál variante de Landing y Dashboard prefieres y forkeamos esos artboards.
- Si quieres explorar otra variante para alguna pantalla intermedia (manual / preview / upload), también puedo agregarlas como artboards adicionales en su sección.

## User

Me gustaria hacer una modificacion

Para el Agua y el Combustible, quiero permitir que se configure y muestre una subcategoria. Ejemplo de esto seria agua: Agua Potable - Agua Gris. Para el combustible puede ser Petroleo, Kerosene, etc... y que esto se pueda visualizar en el resto de los lugares donde se interactue, ya sea filtros como graficos. Alguna duda?

## Assistant

_[tool: questions_v2]_

Sí, tres dudas cortas antes de tocar nada — afectan harto cómo lo modelo:

## User

Questions answered:
- subcat_config: Algunas predeterminadas por el admin, pero que el usuario pueda configurar nuevas.
- subcat_required: Opcional (si no se elige, queda como 'Sin subcategoría')
- subcat_electricity: No por ahora
- chart_behavior: 2
- filter_behavior: Filtro 'Subcategoría' aparece recién cuando se elige un tipo específico (Agua/Combustible)
- subcat_examples: POr ahora quiero solo plasmar la posibilidad

## Assistant

_[tool: str_replace_edit]_

Perfecto, claro. Voy a:

1. Agregar campo **Subcategoría** condicional (solo aparece si tipo = Agua o Combustible) en el form, preview manual y tabla preview.
2. Mostrar el chip con la subcat pre-seleccionada según el proveedor en el paso 1 de subida.
3. En el dashboard, **multi-línea por subcategoría** dentro de un mismo tipo (misma unidad). Filtro contextual de subcategoría que aparece sólo al elegir tipo específico.
4. Agregar columna **Subcat.** en la tabla detallada.
5. Sumar un artboard nuevo de **Configuración de subcategorías** (algunas predeterminadas por admin + el usuario puede crear nuevas).

Voy.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. Cambios aplicados:

**Form / preview manual** — campo Subcategoría aparece bajo Tipo (chips: Petróleo Diésel · Kerosene · GLP · Gas Natural · + Crear nueva), con nota de que es opcional y sólo se muestra si tipo = Agua/Combustible.

**Subida de documentos** — cada proveedor en el paso 1 muestra su subcat. por defecto. La cola (paso 3) y el preview editable ahora corren un escenario de Iconstruye Petróleo con subcats variados (incl. una fila "Sin subcategoría" y dropdown abierto en una celda mostrando las opciones + "+ Crear nueva").

**Dashboard A** — pestaña Combustible activa para que se vean: (a) barra de chips de subcategoría entre tabs y gráficos, (b) gráfico **multi-línea** con 4 series (Petróleo Diésel · Kerosene · GLP · Gas Natural), todas en L, (c) heatmap por sucursal afectado por el filtro.

**Dashboard B** — bloque de Electricidad mantiene línea simple (sin subcat); bloques de Combustible y Agua tienen su propia barra de chips de subcat. + gráfico multi-línea (Combustible: 4 series · Agua: Potable / Gris / Riego).

**Filtros del dashboard** — el filtro "Subcat." aparece como pill azul contextual sólo cuando hay un tipo específico seleccionado.

**Tablas detalladas** — columna **Subcat.** agregada en ambas variantes y en el estado de edición exitosa.

**Nuevo: Sección 6 · Configuración de subcategorías** — tarjetas por tipo (Combustible, Agua) con chips de "Predefinida" / "Personalizada", botón "Nueva subcategoría", contador de registros y form de creación con unidad heredada (no editable, para preservar la comparabilidad de los gráficos). Electricidad aparece deshabilitada con copy explicando que no usa subcat. por ahora.

Si querís cambiar nombres de subcategorías o agregar más ejemplos, dímelos y los reemplazo.

## User

Verifier agent check completed

## Assistant

Verificación ok — todo en orden. ✓

Si quieres, los próximos pasos naturales serían:
1. Subir a hi-fi la variante que prefieras (Landing A o B · Dashboard A o B).
2. Agregar el flujo de creación de subcategoría como modal real (hoy aparece como bloque inline en la pantalla de Configuración).
3. Definir umbral exacto para "dato atípico" (hoy es +/-30%, copy de placeholder).

Avísame cuál seguimos.

