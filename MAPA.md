# MAPA — Registro de Consumos

Árbol jerárquico de todas las pantallas, secciones y componentes de la app.
Fuente: `registro-de-consumos/proto/*.jsx` · Última actualización: 2026-06-22

---

## 1. Shell / Layout global

### 1.1 Sidebar (colapsable, persistido en localStorage)
#### 1.1.1 Cabecera: logo Recylink + botón toggle colapsar/expandir
#### 1.1.2 Navegación principal
##### 1.1.2.1 Inicio (`view: "landing"`)
##### 1.1.2.2 Dashboard (`view: "dashboard"`)
##### 1.1.2.3 Registrar (`view: "register"`)
##### 1.1.2.4 Configuración (`view: "config"`)
#### 1.1.3 Pie de sidebar: botón Reset (recarga el prototipo)

### 1.2 Área de contenido principal (`ViewSwitcher`)
#### 1.2.1 Renderiza la vista activa según `state.view`
#### 1.2.2 Scroll al tope en cada cambio de vista o paso

### 1.3 Toast / notificaciones globales
#### 1.3.1 Tipos: success, warning, error
#### 1.3.2 Auto-ocultación a los 4.5 s
#### 1.3.3 Acción de undo inline (edición de registros)

---

## 2. Inicio (`view: "landing"`)

### 2.1 Cabecera con período activo (mes actual)

### 2.2 Panel izquierdo — Registros del mes
#### 2.2.1 KPI: conteo de registros activos en el mes actual
#### 2.2.2 Lista de los 5 registros más recientes (ordenados por fecha desc)
##### 2.2.2.1 Icono de tipo + nombre sucursal + tipo + proveedor + cantidad
##### 2.2.2.2 Timestamp relativo (Hoy / Ayer / Hace N d)
#### 2.2.3 Estado vacío cuando no hay registros en el mes
#### 2.2.4 Enlace "Ver dashboard" → `view: "dashboard"`

### 2.3 Panel derecho — Estado de sucursales
#### 2.3.1 KPI: sucursales al día / total activas
#### 2.3.2 Lista de sucursales con badge de estado
##### 2.3.2.1 Al día (verde)
##### 2.3.2.2 Parcial: N/M cargados (amarillo)
##### 2.3.2.3 Sin carga (rojo)
##### 2.3.2.4 Sin configuración (gris)
#### 2.3.3 Estado vacío cuando no hay sucursales configuradas
#### 2.3.4 Enlace "Ver matriz" → `view: "matrix"`

### 2.4 CTA full-width — Registrar consumo
#### 2.4.1 Botón "Registrar a mano" → `view: "register"`
#### 2.4.2 Botón "Subir documento" → `view: "register"`

---

## 3. Hub de Registro (`view: "register"`)

### 3.1 Card "Registrar a mano"
#### 3.1.1 Descripción: formulario corto ~1 min
#### 3.1.2 Navega a `view: "manual"`, `manualStep: "form"`

### 3.2 Card "Subir documento"
#### 3.2.1 Descripción: PDFs o Excel de proveedores
#### 3.2.2 Chips de proveedores soportados (Enel, Aguas Andinas, Iconstruye)
#### 3.2.3 Navega a `view: "upload"`, `uploadStep: 1`

---

## 4. Registro Manual (`view: "manual"`)

### 4.1 Paso 1 — Formulario (`manualStep: "form"`)
#### 4.1.1 Campos compartidos entre entradas
##### 4.1.1.1 Fecha (ISO date, por defecto hoy)
##### 4.1.1.2 Sucursal (select de sucursales activas desde config)
#### 4.1.2 Entradas de consumo (1..N)
##### 4.1.2.1 Tipo de consumo (Electricidad / Combustible / Agua)
##### 4.1.2.2 Subcategoría (depende del tipo y config de sucursal)
##### 4.1.2.3 Proveedor (auto-rellenado desde config; editable)
##### 4.1.2.4 Cantidad (número > 0) + Unidad derivada del tipo
##### 4.1.2.5 Costo en CLP (opcional, ≥ 0)
##### 4.1.2.6 Factura / boleta (adjunto PDF o imagen, opcional)
#### 4.1.3 Botón "Añadir entrada" (agrega fila vacía al draft)
#### 4.1.4 Botón eliminar entrada (oculto si hay solo una)
#### 4.1.5 Detección de anomalías (±40% vs promedio histórico)
##### 4.1.5.1 Banner inline por entrada con % de desviación y promedio
#### 4.1.6 Validación client-side con mensajes por campo

### 4.2 Paso 2 — Vista previa (`manualStep: "preview"`)
#### 4.2.1 Tabla resumen de todas las entradas del draft
#### 4.2.2 Botón "Confirmar" → guarda registros, avanza a success
#### 4.2.3 Botón "Volver al formulario" → `manualStep: "form"`

### 4.3 Paso 3 — Éxito (`manualStep: "success"`)
#### 4.3.1 Confirmación visual de guardado
#### 4.3.2 CTA "Nuevo registro" → resetea draft, vuelve a form
#### 4.3.3 CTA "Ver dashboard" → `view: "dashboard"`

---

## 5. Subir Documento (`view: "upload"`)

### 5.1 Paso 1 — Selección de proveedor (`uploadStep: 1`)
#### 5.1.1 Grid de tarjetas de proveedor
##### 5.1.1.1 Enel (electricidad)
##### 5.1.1.2 CGE (electricidad)
##### 5.1.1.3 Aguas Andinas (agua)
##### 5.1.1.4 Esval (agua)
##### 5.1.1.5 Iconstruye Petróleo (combustible)
##### 5.1.1.6 Copec (combustible)
##### 5.1.1.7 Shell (combustible)
##### 5.1.1.8 Otro proveedor (genérico)
#### 5.1.2 Indicador del tipo de consumo por proveedor

### 5.2 Paso 2 — Dropzone y cola de archivos (`uploadStep: 2`)
#### 5.2.1 Zona drag & drop (PDF / Excel)
#### 5.2.2 Cola de archivos cargados
##### 5.2.2.1 Nombre + tamaño del archivo
##### 5.2.2.2 Barra de progreso de extracción
##### 5.2.2.3 Estado: procesando / ok (N registros) / error
##### 5.2.2.4 Botón eliminar archivo de la cola
#### 5.2.3 Botón "Continuar a revisión" → `uploadStep: 3`

### 5.3 Paso 3 — Revisión de datos extraídos (`uploadStep: 3`)
#### 5.3.1 Banner de estado agregado
##### 5.3.1.1 N registros listos para guardar (verde)
##### 5.3.1.2 N con valor atípico — revisar (amarillo)
##### 5.3.1.3 N con error — serán omitidos (rojo)
#### 5.3.2 Tabla editable inline
##### 5.3.2.1 Columnas: Fecha, Sucursal, Tipo, Subcategoría, Proveedor, Cantidad, Costo
##### 5.3.2.2 Edición de celda en clic
##### 5.3.2.3 Acción por fila: duplicar
##### 5.3.2.4 Acción por fila: eliminar
#### 5.3.3 Botón "Confirmar y guardar todo" → convierte previewRows en records

---

## 6. Dashboard (`view: "dashboard"`)

### 6.1 Barra de filtros globales
#### 6.1.1 Sucursal (todas / específica)
#### 6.1.2 Período (1m / 3m / 6m / 12m)
#### 6.1.3 Tabs por tipo de consumo (Todos / Electricidad / Combustible / Agua)
#### 6.1.4 Subcategoría (pills, depende del tab activo)
#### 6.1.5 Estado de registro (activa / eliminada / todas)

### 6.2 KPIs del período
#### 6.2.1 Cantidad total + Δ% vs mes anterior
#### 6.2.2 Costo total (CLP) + Δ% vs mes anterior
#### 6.2.3 Sucursales reportando en el período

### 6.3 Gráfico de tendencia (área/línea por mes)
#### 6.3.1 Eje X: meses del período
#### 6.3.2 Eje Y: cantidad en la unidad del tipo activo
#### 6.3.3 Combustible: split en series por categoría de unidad (Volumen / Masa / Energía)

### 6.4 Heatmap sucursales × meses
#### 6.4.1 Filas: sucursales activas
#### 6.4.2 Columnas: meses del período
#### 6.4.3 Intensidad de color = cantidad relativa

### 6.5 Tabla de detalle de registros
#### 6.5.1 Columnas: Fecha, Sucursal, Tipo, Subcategoría, Proveedor, Cantidad, Unidad, Costo, Documento, Estado
#### 6.5.2 Edición inline de celda (clic en valor)
#### 6.5.3 Highlight visual post-edición (2.5 s)
#### 6.5.4 Soft-delete con modal de confirmación
#### 6.5.5 Toast de undo tras editar o eliminar
#### 6.5.6 Columna Documento: enlace al archivo adjunto (factura/boleta)

### 6.6 Subcategorías (`view: "subcat"`)
#### 6.6.1 Lista de subcategorías por tipo (predefinidas + personalizadas)
#### 6.6.2 Agregar subcategoría custom (input + botón)
#### 6.6.3 Eliminar subcategoría custom

---

## 7. Matriz de Carga (`view: "matrix"`)

### 7.1 Selector de mes (últimos 12 meses)

### 7.2 Tabla sucursales × tipos de consumo
#### 7.2.1 Filas: sucursales activas configuradas
#### 7.2.2 Columnas: Electricidad, Combustible, Agua, Refrigerantes
#### 7.2.3 Columna expandible para ver detalle por subcategoría
#### 7.2.4 Estados de celda
##### 7.2.4.1 Cargado (verde)
##### 7.2.4.2 Pendiente-soft: período abierto, aún no cargado (gris)
##### 7.2.4.3 Pendiente-vencido: período cerrado, sin carga (rojo)
##### 7.2.4.4 N/A: tipo no configurado para esa sucursal

### 7.3 Acceso rápido a registrar consumo pendiente

---

## 8. Configuración (`view: "config"`)

### 8.1 Lista de sucursales configuradas
#### 8.1.1 Nombre + dirección
#### 8.1.2 Sistema eléctrico (SEN / Los Lagos / Aysén / Magallanes)
#### 8.1.3 Badge de tipos activos (Electricidad, Combustible, Agua, Refrigerantes)
#### 8.1.4 Toggle activa / inactiva
##### 8.1.4.1 Modal de confirmación al desactivar
#### 8.1.5 Botón editar → `view: "config-edit"`
#### 8.1.6 Botón eliminar sucursal
##### 8.1.6.1 Modal con conteo de registros afectados

### 8.2 Botón "Crear proyecto desde cero" → `view: "onboarding"`

### 8.3 Editar sucursal (`view: "config-edit"`)
#### 8.3.1 Nombre y dirección
#### 8.3.2 Toggle de activación por tipo de consumo
#### 8.3.3 Configuración por tipo
##### 8.3.3.1 Electricidad: sistema eléctrico + proveedor (por subcat)
##### 8.3.3.2 Combustible: tipo de combustible + unidad por defecto + uso (estacionario/móvil) + proveedor
##### 8.3.3.3 Agua: tipo (potable/gris/industrial/otro) + proveedor
##### 8.3.3.4 Refrigerantes: tipo (R507/R407A/otro) + proveedor
#### 8.3.4 Botón guardar → actualiza `configSucursales`, vuelve a `view: "config"`
#### 8.3.5 Botón cancelar → vuelve a `view: "config"` sin guardar

---

## 9. Onboarding (`view: "onboarding"`)

### 9.1 Paso 1 — Sucursales
#### 9.1.1 Input nombre de sucursal
#### 9.1.2 Input dirección (opcional)
#### 9.1.3 Botón "Agregar otra sucursal"
#### 9.1.4 Botón eliminar sucursal del borrador

### 9.2 Paso 2 — Ítems a registrar
#### 9.2.1 Toggle de activación por tipo × sucursal
#### 9.2.2 Configurar subcategorías por sucursal × tipo
##### 9.2.2.1 Electricidad: sistema eléctrico + proveedor
##### 9.2.2.2 Combustible: tipo + unidad + uso (estacionario/móvil) + proveedor
##### 9.2.2.3 Agua: tipo (potable/gris/industrial/otro) + proveedor
##### 9.2.2.4 Refrigerantes: tipo (R507/R407A/otro) + proveedor
#### 9.2.3 Proveedor custom ("Otro…") con input libre

### 9.3 Paso 3 — Resumen
#### 9.3.1 Preview de configuración final (sucursales + tipos + subcats)
#### 9.3.2 Botón "Confirmar y crear proyecto" → escribe `configSucursales`, redirige a `landing`
