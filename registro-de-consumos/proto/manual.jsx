// Manual flow — form → preview → success

// ---- Validation -----
function validateManual(d) {
  const errors = {};
  if (!d.date) errors.date = "Indica la fecha del consumo.";
  if (!d.sucursal) errors.sucursal = "Elige una sucursal.";
  if (!d.type) errors.type = "Indica el tipo de consumo.";
  if (d.type && INITIAL_SUBCATS[d.type].length > 0 && !d.subcat) {
    errors.subcat = "Este tipo requiere subcategoría.";
  }
  if (!d.cantidad) errors.cantidad = "Ingresa la cantidad consumida.";
  else if (isNaN(parseFloat(d.cantidad)) || parseFloat(d.cantidad) <= 0) errors.cantidad = "Debe ser un número mayor a 0.";
  if (d.costo && (isNaN(parseFloat(d.costo)) || parseFloat(d.costo) < 0)) errors.costo = "Si lo indicas, debe ser un número ≥ 0.";
  return errors;
}

// Detect atypical: ±50% vs average of same sucursal/type
function detectAnomaly(records, draft) {
  if (!draft.sucursal || !draft.type || !draft.cantidad) return null;
  const same = records.filter(r =>
    r.sucursal === draft.sucursal &&
    r.type === draft.type &&
    (draft.subcat ? r.subcat === draft.subcat : true)
  );
  if (same.length < 3) return null;
  const avg = same.reduce((a, r) => a + r.cantidad, 0) / same.length;
  const cur = parseFloat(draft.cantidad);
  const pct = ((cur - avg) / avg) * 100;
  if (Math.abs(pct) >= 40) {
    return {
      pct: Math.round(pct),
      avg: Math.round(avg),
      direction: pct > 0 ? "up" : "down",
    };
  }
  return null;
}

// =========================================================
// FORM
// =========================================================
const ManualForm = () => {
  const { state, dispatch } = useApp();
  const d = state.manualDraft;
  const e = state.manualErrors;

  // Custom subcat dialog
  const [showNewSubcat, setShowNewSubcat] = React.useState(false);
  const [newSubcatLabel, setNewSubcatLabel] = React.useState("");

  const set = (field, value) => dispatch({ type: "MANUAL/SET_FIELD", field, value });

  const subcatOptions = d.type ? state.subcategories[d.type] : [];
  const typeRequiresSubcat = d.type && subcatOptions.length > 0;

  const onContinue = () => {
    const errs = validateManual(d);
    dispatch({ type: "MANUAL/SET_ERRORS", errors: errs });
    if (Object.keys(errs).length === 0) {
      dispatch({ type: "MANUAL/GO_PREVIEW" });
    }
  };

  const createSubcat = () => {
    const label = newSubcatLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    dispatch({ type: "SUBCAT/ADD", type: d.type, id, label });
    set("subcat", id);
    setShowNewSubcat(false);
    setNewSubcatLabel("");
    dispatch({ type: "TOAST/SHOW", toast: { kind: "success", title: "Subcategoría creada", body: `"${label}" ya está disponible en ${TYPES[d.type].label}.` } });
  };

  return (
    <div>
      <SectionHead
        eyebrow="Registrar consumo · paso 1 de 2"
        title="Ingresa los datos del consumo"
        sub="Completa los campos requeridos. Antes de guardar, podrás revisar el resumen."
        right={<Btn kind="ghost" icon="arrow_back" onClick={() => dispatch({ type: "NAVIGATE", view: "landing" })}>Volver</Btn>}
      />

      <div style={{ marginBottom: 22 }}>
        <Steps items={["Datos", "Revisar", "Listo"]} current={0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>

        {/* FORM CARD */}
        <Card>
          <div className="prt-stack-md">

            {/* Row 1: Fecha + Sucursal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Fecha del consumo" required error={e.date}>
                <Input type="date" value={d.date} onChange={v => set("date", v)} />
              </Field>
              <Field label="Sucursal" required error={e.sucursal}>
                <Select
                  value={d.sucursal}
                  onChange={v => set("sucursal", v)}
                  options={SUCURSALES}
                  placeholder="Elige una sucursal…"
                  error={!!e.sucursal}
                />
              </Field>
            </div>

            {/* Row 2: Tipo + Subcat (subcat aparece sólo si el tipo lo requiere) */}
            <div style={{ display: "grid", gridTemplateColumns: typeRequiresSubcat ? "1fr 1fr" : "1fr", gap: 16 }}>
              <Field label="Tipo de consumo" required error={e.type}>
                <Select
                  value={d.type}
                  onChange={v => set("type", v)}
                  options={Object.values(TYPES).map(t => ({ value: t.id, label: `${t.label} (${t.unit})` }))}
                  placeholder="Elige un tipo…"
                  error={!!e.type}
                />
              </Field>
              {typeRequiresSubcat && (
                <Field
                  label="Subcategoría"
                  required
                  error={e.subcat}
                  helper={!e.subcat ? "Misma unidad del tipo padre — comparable en el dashboard." : null}
                >
                  <div className="prt-row" style={{ gap: 8 }}>
                    <Select
                      value={d.subcat}
                      onChange={v => set("subcat", v)}
                      options={subcatOptions.map(s => ({ value: s.id, label: s.label }))}
                      placeholder="Elige una subcategoría…"
                      error={!!e.subcat}
                      style={{ flex: 1 }}
                    />
                    <Btn size="sm" icon="add" onClick={() => setShowNewSubcat(true)}>Nueva</Btn>
                  </div>
                </Field>
              )}
            </div>

            {/* Inline "new subcat" panel */}
            {showNewSubcat && (
              <div style={{
                padding: 14, borderRadius: 10,
                border: "1.5px solid var(--rl-primary-200)",
                background: "var(--rl-primary-50)",
              }}>
                <div className="prt-spread" style={{ marginBottom: 10 }}>
                  <div>
                    <div className="prt-eyebrow" style={{ color: "var(--rl-primary-900)" }}>Crear subcategoría</div>
                    <div className="prt-h4">Para {TYPES[d.type].label}</div>
                  </div>
                  <button onClick={() => setShowNewSubcat(false)} style={{ all: "unset", cursor: "pointer", color: "var(--rl-gray-500)" }}>
                    <Icon name="close" size={20} />
                  </button>
                </div>
                <div className="prt-row" style={{ alignItems: "flex-end", gap: 12 }}>
                  <Field label="Nombre" style={{ flex: 1 }}>
                    <Input value={newSubcatLabel} onChange={setNewSubcatLabel} placeholder="Ej. Biodiésel" autoFocus />
                  </Field>
                  <Field label="Unidad" style={{ width: 140 }}>
                    <Input value={`${TYPES[d.type].unit} (heredado)`} onChange={() => {}} />
                  </Field>
                  <Btn onClick={() => setShowNewSubcat(false)}>Cancelar</Btn>
                  <Btn kind="primary" onClick={createSubcat} disabled={!newSubcatLabel.trim()}>Crear</Btn>
                </div>
              </div>
            )}

            {/* Row 3: Cantidad + Costo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field
                label="Cantidad consumida"
                required
                error={e.cantidad}
                helper={d.type ? `Unidad: ${TYPES[d.type].unit}` : "Elige primero el tipo de consumo."}
              >
                <Input
                  value={d.cantidad}
                  onChange={v => set("cantidad", v)}
                  placeholder="0"
                  suffix={d.type ? TYPES[d.type].unit : ""}
                  error={!!e.cantidad}
                />
              </Field>
              <Field
                label="Costo total (opcional)"
                error={e.costo}
                helper="Si lo dejas en blanco, lo podrás agregar después."
              >
                <Input
                  value={d.costo}
                  onChange={v => set("costo", v)}
                  placeholder="0"
                  suffix="CLP"
                  error={!!e.costo}
                />
              </Field>
            </div>

            {/* Row 4: Proveedor + Notas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Proveedor (opcional)">
                <Select
                  value={d.provider}
                  onChange={v => set("provider", v)}
                  options={d.type ? PROVIDERS[d.type] : ["—"]}
                  placeholder="Elige un proveedor…"
                />
              </Field>
              <Field label="Notas (opcional)" helper={`${(d.notes || "").length}/120`}>
                <Input
                  value={d.notes}
                  onChange={v => set("notes", v.slice(0, 120))}
                  placeholder="Ej. Lectura tomada el día 28"
                />
              </Field>
            </div>

          </div>
        </Card>

        {/* SIDE: live preview / hints */}
        <SidePreview draft={d} />
      </div>

      <div className="prt-spread" style={{ marginTop: 22 }}>
        <Btn kind="ghost" onClick={() => { dispatch({ type: "MANUAL/RESET" }); dispatch({ type: "NAVIGATE", view: "landing" }); }}>
          Cancelar
        </Btn>
        <div className="prt-row">
          <Btn onClick={() => dispatch({ type: "MANUAL/RESET" })}>Limpiar formulario</Btn>
          <Btn kind="primary" iconRight="arrow_forward" onClick={onContinue}>Revisar antes de guardar</Btn>
        </div>
      </div>
    </div>
  );
};

// Live preview to the right of the form
const SidePreview = ({ draft }) => {
  const { state } = useApp();
  const t = draft.type ? TYPES[draft.type] : null;
  const sub = draft.type && draft.subcat ? subcatLabel(draft.type, draft.subcat) : null;
  const anomaly = detectAnomaly(state.records, draft);

  return (
    <div className="prt-stack-md">
      <Card>
        <div className="prt-eyebrow" style={{ marginBottom: 8 }}>Vista previa</div>
        <div className="prt-stack-sm">
          <PrevRow label="Fecha" value={draft.date ? fmtDate(draft.date) : <em style={{ color: "var(--rl-gray-400)" }}>Sin definir</em>} />
          <PrevRow label="Sucursal" value={draft.sucursal || <em style={{ color: "var(--rl-gray-400)" }}>Sin definir</em>} />
          <PrevRow label="Tipo" value={t ? <span className="prt-row" style={{ gap: 6 }}><TypeIndicator type={draft.type} /> {t.label}</span> : <em style={{ color: "var(--rl-gray-400)" }}>Sin definir</em>} />
          {t && INITIAL_SUBCATS[draft.type].length > 0 && (
            <PrevRow label="Subcategoría" value={sub || <em style={{ color: "var(--rl-gray-400)" }}>—</em>} />
          )}
          <PrevRow label="Cantidad" value={draft.cantidad ? <strong>{fmtNum(parseFloat(draft.cantidad))} {t?.unit || ""}</strong> : <em style={{ color: "var(--rl-gray-400)" }}>0</em>} />
          <PrevRow label="Costo" value={draft.costo ? <strong>{fmtCLP(parseFloat(draft.costo))}</strong> : <em style={{ color: "var(--rl-gray-400)" }}>—</em>} />
        </div>
      </Card>

      {/* Anomaly hint */}
      {anomaly && (
        <div style={{
          padding: 14, borderRadius: 12,
          background: "var(--rl-warning-50)",
          border: "1px solid var(--rl-warning-200)",
          display: "flex", gap: 10,
        }}>
          <Icon name="warning" size={22} style={{ color: "var(--rl-warning-700)", flexShrink: 0 }} />
          <div>
            <div style={{ font: "600 13px/18px var(--rl-font-display)", color: "var(--rl-warning-700)" }}>
              Consumo {anomaly.direction === "up" ? "más alto" : "más bajo"} de lo habitual
            </div>
            <div className="prt-hint" style={{ marginTop: 4, color: "var(--rl-warning-800)" }}>
              Está {anomaly.pct > 0 ? "+" : ""}{anomaly.pct}% vs. el promedio de {fmtNum(anomaly.avg)} {TYPES[draft.type].unit} de esta sucursal. Podrás confirmar en el siguiente paso.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PrevRow = ({ label, value }) => (
  <div className="prt-spread" style={{ gap: 8 }}>
    <span className="prt-hint">{label}</span>
    <span style={{ font: "500 13px/18px var(--rl-font-body)", color: "var(--rl-gray-900)", textAlign: "right" }}>{value}</span>
  </div>
);

// =========================================================
// PREVIEW (paso 2)
// =========================================================
const ManualPreview = () => {
  const { state, dispatch } = useApp();
  const d = state.manualDraft;
  const t = TYPES[d.type];
  const sub = d.subcat ? subcatLabel(d.type, d.subcat) : null;
  const anomaly = detectAnomaly(state.records, d);

  return (
    <div>
      <SectionHead
        eyebrow="Registrar consumo · paso 2 de 2"
        title="Revisa antes de guardar"
        sub="Si todo está correcto, guarda. También puedes volver a editar."
        right={<Btn kind="ghost" icon="arrow_back" onClick={() => dispatch({ type: "MANUAL/GO_FORM" })}>Editar datos</Btn>}
      />
      <div style={{ marginBottom: 22 }}>
        <Steps items={["Datos", "Revisar", "Listo"]} current={1} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div className="prt-eyebrow" style={{ marginBottom: 12 }}>Resumen del registro</div>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 14, columnGap: 16, alignItems: "center" }}>
            <span className="prt-hint">Fecha</span>             <span style={{ font: "600 14px/1 var(--rl-font-display)" }}>{fmtDate(d.date)}</span>
            <span className="prt-hint">Sucursal</span>          <span>{d.sucursal}</span>
            <span className="prt-hint">Tipo</span>              <span className="prt-row" style={{ gap: 8 }}><TypeIndicator type={d.type} /> {t.label}</span>
            {sub && (<><span className="prt-hint">Subcategoría</span><span><Chip>{sub}</Chip></span></>)}
            <span className="prt-hint">Cantidad</span>          <span style={{ font: "700 22px/26px var(--rl-font-display)", color: "var(--rl-gray-900)" }}>{fmtNum(parseFloat(d.cantidad))} <span style={{ font: "600 14px/1 var(--rl-font-display)", color: "var(--rl-gray-500)" }}>{t.unit}</span></span>
            <span className="prt-hint">Costo</span>             <span style={{ font: "700 16px/22px var(--rl-font-display)" }}>{d.costo ? fmtCLP(parseFloat(d.costo)) : <em style={{ color: "var(--rl-gray-400)" }}>—</em>}</span>
            <span className="prt-hint">Proveedor</span>         <span>{d.provider || <em style={{ color: "var(--rl-gray-400)" }}>—</em>}</span>
            {d.notes && (<><span className="prt-hint">Notas</span><span style={{ color: "var(--rl-gray-700)" }}>{d.notes}</span></>)}
          </div>
        </Card>

        <div className="prt-stack-md">
          {anomaly && (
            <Card style={{ background: "var(--rl-warning-50)", boxShadow: "none", border: "1px solid var(--rl-warning-200)" }}>
              <div className="prt-row" style={{ gap: 10, alignItems: "flex-start" }}>
                <Icon name="warning" style={{ color: "var(--rl-warning-700)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="prt-h4" style={{ color: "var(--rl-warning-800)" }}>Detectamos un valor atípico</div>
                  <div className="prt-muted" style={{ marginTop: 6, color: "var(--rl-warning-800)" }}>
                    Esta cantidad está <strong>{anomaly.pct > 0 ? "+" : ""}{anomaly.pct}%</strong> vs. el promedio histórico
                    ({fmtNum(anomaly.avg)} {t.unit}) de <strong>{d.sucursal}</strong>. Si es correcto,
                    confirma. Si no, vuelve y corrige.
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card bordered>
            <div className="prt-h4" style={{ marginBottom: 8 }}>¿Qué pasa al guardar?</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--rl-gray-600)", font: "500 13px/20px var(--rl-font-body)" }}>
              <li>Se agrega 1 registro a la tabla de consumos.</li>
              <li>El dashboard refleja el cambio al instante.</li>
              <li>Podrás editarlo o eliminarlo desde la tabla detallada.</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="prt-spread" style={{ marginTop: 22 }}>
        <Btn icon="arrow_back" onClick={() => dispatch({ type: "MANUAL/GO_FORM" })}>Volver a editar</Btn>
        <Btn kind="primary" icon="check" onClick={() => dispatch({ type: "MANUAL/CONFIRM" })}>
          Confirmar y guardar
        </Btn>
      </div>
    </div>
  );
};

// =========================================================
// SUCCESS (paso 3)
// =========================================================
const ManualSuccess = () => {
  const { state, dispatch } = useApp();
  // Most recently added record
  const last = state.records[0];
  const t = last ? TYPES[last.type] : null;

  return (
    <div>
      <SectionHead
        eyebrow="Registrar consumo"
        title="Registro guardado"
        right={<Btn kind="ghost" icon="dashboard" onClick={() => dispatch({ type: "NAVIGATE", view: "dashboard" })}>Ver en dashboard</Btn>}
      />
      <div style={{ marginBottom: 22 }}>
        <Steps items={["Datos", "Revisar", "Listo"]} current={2} />
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 0" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 999,
            background: "var(--rl-success-50)", color: "var(--rl-success-700)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="check_circle" size={32} fill />
          </div>
          <div className="prt-grow">
            <div className="prt-h2">Listo, agregamos tu consumo</div>
            <div className="prt-muted" style={{ marginTop: 4 }}>
              {last && (
                <>{t.label}{last.subcat ? ` · ${subcatLabel(last.type, last.subcat)}` : ""} · {fmtNum(last.cantidad)} {last.unit} · {last.sucursal} · {fmtDate(last.date)}</>
              )}
            </div>
          </div>
          <Chip kind="success" icon="check">1 registro agregado</Chip>
        </div>
      </Card>

      <div className="prt-row" style={{ marginTop: 22, gap: 12 }}>
        <Btn kind="primary" icon="add" onClick={() => { dispatch({ type: "MANUAL/RESET" }); dispatch({ type: "NAVIGATE", view: "manual", manualStep: "form" }); }}>
          Registrar otro consumo
        </Btn>
        <Btn icon="cloud_upload" onClick={() => dispatch({ type: "NAVIGATE", view: "upload", uploadStep: 1 })}>
          Subir un documento
        </Btn>
        <Btn icon="dashboard" onClick={() => dispatch({ type: "NAVIGATE", view: "dashboard" })}>
          Ir al dashboard
        </Btn>
      </div>
    </div>
  );
};

// =========================================================
// Switcher
// =========================================================
const ManualView = () => {
  const { state } = useApp();
  if (state.manualStep === "preview") return <ManualPreview />;
  if (state.manualStep === "success") return <ManualSuccess />;
  return <ManualForm />;
};

Object.assign(window, { ManualView, ManualForm, ManualPreview, ManualSuccess });
