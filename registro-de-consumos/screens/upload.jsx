// Subida de documentos — 3 pasos + estados

const PROVIDERS = [
  { id: "enel",      name: "Enel",                tipo: "Electricidad", unit: "kWh", ico: "⚡", subcat: null },
  { id: "aguas",     name: "Aguas Andinas",       tipo: "Agua",         unit: "m³",  ico: "💧", subcat: "Agua Potable" },
  { id: "ipetro",    name: "Iconstruye Petróleo", tipo: "Combustible",  unit: "L",   ico: "⛽", subcat: "Petróleo Diésel" },
  { id: "igas",      name: "Iconstruye Gas",      tipo: "Combustible",  unit: "m³",  ico: "🔥", subcat: "Gas Natural" },
];

const uploadSteps = (active) => ([
  { label: "Proveedor",   state: active === 1 ? "active" : (active > 1 ? "done" : "") },
  { label: "Cargar",      state: active === 2 ? "active" : (active > 2 ? "done" : "") },
  { label: "Procesar",    state: active === 3 ? "active" : (active > 3 ? "done" : "") },
]);

// ---- Paso 1 — selector de proveedor ----
const UploadStep1 = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row"><Btn size="sm" kind="ghost" ico="←">Volver</Btn><span className="wf-hint">/ Subir documento</span></div>
      <ScreenHeader
        eyebrow="Subir documento · Paso 1 de 3"
        title="¿De qué proveedor son tus documentos?"
        right={<Steps items={uploadSteps(1)} />}
      />
      <div className="wf-muted" style={{ maxWidth: 620 }}>
        Cada proveedor tiene un formato distinto. Selecciona uno para que extraigamos los datos correctamente. Podrás subir varios archivos en el siguiente paso.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
        {PROVIDERS.map((p, i) => (
          <div key={p.id} className="wf-box" style={{
            padding: 18, display: "flex", alignItems: "center", gap: 14,
            ...(i === 0 ? { borderColor: "var(--rl-action)", background: "var(--rl-primary-50)" } : {})
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, border: "1.5px solid var(--rl-gray-300)", background: "#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 20 }}>{p.ico}</div>
            <div style={{ flex: 1 }}>
              <div className="wf-h3">{p.name}</div>
              <div className="wf-hint">
                {p.tipo} · unidad {p.unit}
                {p.subcat && <> · subcat. por defecto <b style={{ color: "var(--rl-fg)" }}>{p.subcat}</b></>}
              </div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: 999,
              border: "1.5px solid " + (i === 0 ? "var(--rl-action)" : "var(--rl-gray-400)"),
              background: i === 0 ? "var(--rl-action)" : "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#FFF", font: "700 10px/1 var(--rl-font-display)"
            }}>{i === 0 ? "✓" : ""}</div>
          </div>
        ))}
      </div>

      <div className="spread" style={{ marginTop: "auto" }}>
        <span className="wf-hint">¿No ves tu proveedor? Usa <a href="#">registro manual</a>.</span>
        <div className="row">
          <Btn>Cancelar</Btn>
          <Btn kind="primary">Continuar →</Btn>
        </div>
      </div>
    </div>
  </div>
);

// ---- Paso 2 — dropzone (variantes: idle + activo arrastrando) ----
const UploadStep2 = ({ active }) => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row"><Btn size="sm" kind="ghost" ico="←">Cambiar proveedor</Btn><span className="wf-hint">/ Subir documento</span></div>
      <ScreenHeader
        eyebrow="Subir documento · Paso 2 de 3"
        title={active ? "Suelta para cargar tus archivos" : "Carga tus archivos"}
        right={<Steps items={uploadSteps(2)} />}
      />

      <div className="row" style={{ gap: 8 }}>
        <Chip kind="info">Proveedor · Iconstruye Petróleo</Chip>
        <Chip>Tipo · Combustible</Chip>
        <Chip>Unidad · L</Chip>
        <Chip>Subcat. detectada · Petróleo Diésel</Chip>
      </div>

      <div className={"wf-dropzone" + (active ? " active" : "")} style={{ minHeight: 220, position: "relative" }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, border: "2px " + (active ? "solid" : "dashed") + " " + (active ? "var(--rl-action)" : "var(--rl-gray-400)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize: 26 }}>
          {active ? "⤓" : "⇪"}
        </div>
        <div className="wf-h2" style={{ color: active ? "var(--rl-action)" : "var(--rl-fg)" }}>
          {active ? "Suelta los archivos aquí" : "Arrastra archivos o haz click para elegir"}
        </div>
        <div className="wf-muted">PDF o Excel · hasta 50 archivos · 20 MB por archivo</div>
        {!active && <Btn kind="primary" style={{ marginTop: 8 }}>Elegir archivos</Btn>}

        {active && (
          <Anno style={{ position: "absolute", right: -260, top: 70 }}>
            Estado "drag-over": dropzone se rellena en azul muy claro,
            borde sólido, texto cambia a "Suelta los archivos aquí".
          </Anno>
        )}
      </div>

      <div className="wf-box-dashed" style={{ padding: 14 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
          <Ico tag="i" kind="brand" />
          <div className="wf-hint">
            <b style={{ color: "var(--rl-fg)" }}>¿Por qué te pedimos el proveedor antes?</b><br/>
            Cada empresa entrega los datos de forma distinta. Saber el origen nos permite extraer
            cantidad, costo y período sin que tú tengas que corregir nada.
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---- Paso 3 — lista con TODOS los estados por archivo ----
const FileRow = ({ name, size, state, meta }) => {
  const states = {
    processing: { chip: <Chip kind="info">⟳ Procesando</Chip>, sub: "Extrayendo datos del documento…", actions: <Btn size="sm" kind="ghost">Cancelar</Btn> },
    ready:      { chip: <Chip kind="success">✓ Listo para revisar</Chip>, sub: meta || "12 filas extraídas correctamente.", actions: <Btn size="sm" kind="primary">Revisar →</Btn> },
    duplicate:  { chip: <Chip kind="warning">! Duplicado detectado</Chip>, sub: meta || "Ya existe un registro para Planta Sur · Marzo 2026 · Enel.", actions: null, dup: true },
    error:      { chip: <Chip kind="error">× Error parseando</Chip>, sub: meta || "No pudimos leer la factura. Formato no reconocido.", actions: <Btn size="sm">Completar manualmente →</Btn> },
    outlier:    { chip: <Chip kind="warning">! Datos atípicos</Chip>, sub: meta || "El consumo es +52% sobre el promedio. Puedes revisar igual.", actions: <Btn size="sm" kind="primary">Revisar →</Btn> },
  };
  const s = states[state] || states.ready;
  const bg = state === "error" ? "var(--rl-error-25)" : state === "duplicate" || state === "outlier" ? "var(--rl-warning-25)" : "#FFF";
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--rl-border-subtle)", background: bg }}>
      <div className="spread">
        <div className="row" style={{ minWidth: 0, flex: 1 }}>
          <div style={{ width: 36, height: 44, borderRadius: 4, border: "1.5px solid var(--rl-gray-300)", background: "#FFF", display:"flex", alignItems:"center", justifyContent:"center", font: "700 9px/1 var(--rl-font-mono)", color: "var(--rl-gray-500)" }}>PDF</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ font: "600 14px/18px var(--rl-font-display)", color: "var(--rl-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div className="wf-hint" style={{ marginTop: 2 }}>{size} · {s.sub}</div>
          </div>
        </div>
        <div className="row">
          {s.chip}
          {s.actions}
        </div>
      </div>
      {s.dup && (
        <div style={{ marginTop: 10, paddingLeft: 50, display: "flex", gap: 8, alignItems: "center" }}>
          <Btn size="sm">Ignorar este archivo</Btn>
          <Btn size="sm" kind="primary">Sobrescribir registro existente</Btn>
          <Btn size="sm" kind="ghost">Ver detalle ▾</Btn>
        </div>
      )}
    </div>
  );
};

const UploadStep3 = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row"><Btn size="sm" kind="ghost" ico="←">Atrás</Btn><span className="wf-hint">/ Subir documento / Procesando</span></div>
      <ScreenHeader
        eyebrow="Subir documento · Paso 3 de 3"
        title="Procesando tus 7 archivos"
        right={<Steps items={uploadSteps(3)} />}
      />

      <div className="wf-card">
        <div className="hd">
          <div className="row">
            <div className="wf-h3">Cola de archivos</div>
            <Chip>7 archivos · Iconstruye Petróleo</Chip>
            <Chip>Subcat. por defecto · Petróleo Diésel</Chip>
          </div>
          <div className="row">
            <Chip kind="success">3 listos</Chip>
            <Chip kind="warning">2 con avisos</Chip>
            <Chip kind="error">1 con error</Chip>
            <Chip kind="info">1 procesando</Chip>
          </div>
        </div>

        <FileRow name="petroleo_planta_norte_marzo_2026.pdf"  size="412 KB" state="ready"
                 meta="Planta Norte · Petróleo Diésel · 3.420 L / $1.847.230" />
        <FileRow name="petroleo_planta_sur_marzo_2026.pdf"    size="398 KB" state="duplicate" />
        <FileRow name="kerosene_oficina_central_marzo_2026.pdf" size="421 KB" state="ready"
                 meta="Oficina Central · Kerosene (revisar subcat.) · 412 L / $362.180" />
        <FileRow name="petroleo_bodega_RM_marzo_2026.pdf"    size="389 KB" state="outlier"
                 meta="Consumo +52% sobre el promedio de Bodega RM. Banner en el preview." />
        <FileRow name="petroleo_quilicura_marzo.xlsx"        size="64 KB"  state="error"
                 meta="Excel sin columna 'Litros'. Puedes completarlo manualmente." />
        <FileRow name="petroleo_sucursal_V_marzo_2026.pdf"   size="455 KB" state="processing" />
        <FileRow name="petroleo_planta_oeste_marzo_2026.pdf" size="408 KB" state="ready"
                 meta="Planta Oeste · Petróleo Diésel · 2.910 L / $1.520.044" />

        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--rl-gray-50)" }}>
          <div className="row">
            <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rl-action)" }}></div>
            <span className="wf-hint">Los archivos siguen procesando aunque cierres esta vista. Si uno falla, los demás continúan.</span>
          </div>
          <div className="row">
            <Btn>Cargar más</Btn>
            <Btn kind="primary">Revisar 5 listos →</Btn>
          </div>
        </div>
      </div>

      <Anno style={{ position: "absolute", right: 36, top: 350 }}>
        Loader inline por archivo (spinner). No hay loader global —
        si uno falla, los demás no se detienen.
      </Anno>
    </div>
  </div>
);

Object.assign(window, { UploadStep1, UploadStep2, UploadStep3 });
