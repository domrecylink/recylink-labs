Gestiona el archivo `MAPA.md` en el directorio raíz del proyecto con el árbol jerárquico completo de todas las pantallas y secciones de la app.

**Pasos:**

1. Verifica si existe `MAPA.md` en la raíz del proyecto.

2. **Si NO existe** — analiza los archivos fuente y créalo:
   - Lee `registro-de-consumos/proto/state.jsx` para el listado de vistas y pasos internos.
   - Lee cada archivo en `registro-de-consumos/proto/*.jsx` para mapear secciones, formularios, tablas, modales y flujos.
   - Cubre: vistas navegables, pasos internos (manualStep, uploadStep), componentes principales por pantalla, modales de confirmación, toasts.

3. **Si YA existe** — léelo, luego analiza los archivos fuente para detectar pantallas, secciones o componentes nuevos o modificados y actualiza el archivo.

4. **En ambos casos** — muestra el contenido completo de `MAPA.md` al terminar.

**Formato obligatorio:**
- Numeración jerárquica estricta: `1`, `1.1`, `1.1.1`, etc.
- Encabezados Markdown: `##` nivel 1, `###` nivel 2, `####` nivel 3, `#####` nivel 4.
- Incluir el valor de `view` o `step` entre paréntesis donde aplique (ej. `view: "dashboard"`).
- No omitir secciones: cada pantalla debe tener al menos sus subsecciones principales.

**Fuentes principales:** `state.jsx` (routing y reducer), `shell.jsx` (sidebar + ViewSwitcher), y cada archivo de vista individual.
