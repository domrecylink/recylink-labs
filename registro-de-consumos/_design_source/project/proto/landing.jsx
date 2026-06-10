// Landing — wizard de pregunta directa (variante B refinada)

const Landing = () => {
  const { state, dispatch } = useApp();

  // Keyboard shortcuts 1 / 2
  React.useEffect(() => {
    const onKey = (e) => {
      if (state.view !== "landing") return;
      if (e.key === "1") dispatch({ type: "NAVIGATE", view: "manual", manualStep: "form" });
      if (e.key === "2") dispatch({ type: "NAVIGATE", view: "upload", uploadStep: 1 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.view, dispatch]);

  const recordsMonth = state.records.filter(r => r.date.startsWith("2026-03")).length;
  const pendingDocs = state.uploadQueue.filter(f => f.status === "ready").length;

  return (
    <div className="prt-stack-lg" style={{ alignItems: "center", justifyContent: "center", paddingTop: 24 }}>

      {/* Context strip */}
      <div className="prt-row" style={{
        padding: "8px 14px",
        background: "var(--rl-gray-50)",
        border: "1px solid var(--rl-gray-200)",
        borderRadius: 999,
        gap: 14,
      }}>
        <span className="prt-row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rl-success-500)" }}></span>
          <span style={{ font: "600 13px/1 var(--rl-font-display)" }}>{COMPANY}</span>
        </span>
        <span style={{ width: 1, height: 14, background: "var(--rl-gray-300)" }}></span>
        <span style={{ font: "600 13px/1 var(--rl-font-display)" }}>Marzo 2026</span>
        <span style={{ width: 1, height: 14, background: "var(--rl-gray-300)" }}></span>
        <span className="prt-hint">{recordsMonth} registros este mes{pendingDocs ? ` · ${pendingDocs} pendientes` : ""}</span>
      </div>

      <div style={{ textAlign: "center", maxWidth: 580 }}>
        <h1 className="prt-h1" style={{ fontSize: 34, lineHeight: "42px" }}>¿Qué quieres hacer hoy?</h1>
        <div className="prt-muted" style={{ marginTop: 10, fontSize: 15 }}>
          Elige cómo prefieres ingresar tus consumos de este mes. Puedes volver
          atrás en cualquier momento.
        </div>
      </div>

      <div style={{ display: "flex", gap: 64, justifyContent: "center", alignItems: "flex-start", marginTop: 8 }}>

        {/* Opción 1 — manual */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 240 }}>
          <button
            className="prt-wizard-circle primary"
            onClick={() => dispatch({ type: "NAVIGATE", view: "manual", manualStep: "form" })}
          >
            <span className="kbd">1</span>
            <span className="glyph"><Icon name="edit" size={32} /></span>
            <span className="ttl">Registrar a mano</span>
          </button>
          <div style={{ textAlign: "center" }}>
            <div className="prt-hint" style={{ fontSize: 13 }}>Un consumo a la vez con un formulario corto.</div>
            <div className="prt-hint" style={{ fontSize: 12, marginTop: 4, color: "var(--rl-gray-400)" }}>~ 1 min · validación inline</div>
          </div>
        </div>

        {/* Opción 2 — upload */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 240 }}>
          <button
            className="prt-wizard-circle alt"
            onClick={() => dispatch({ type: "NAVIGATE", view: "upload", uploadStep: 1 })}
          >
            <span className="kbd">2</span>
            <span className="glyph"><Icon name="cloud_upload" size={32} /></span>
            <span className="ttl">Subir documento</span>
          </button>
          <div style={{ textAlign: "center" }}>
            <div className="prt-hint" style={{ fontSize: 13 }}>Sube PDFs o Excel de tus proveedores.</div>
            <div className="prt-row" style={{ justifyContent: "center", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              <Chip size="sm">Enel</Chip>
              <Chip size="sm">Aguas Andinas</Chip>
              <Chip size="sm">Iconstruye</Chip>
            </div>
          </div>
        </div>
      </div>

      <div className="prt-divider" style={{ maxWidth: 540, marginTop: 12 }}></div>

      {/* Secondary access */}
      <div style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="prt-row" style={{ gap: 10 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--rl-gray-50)",
            border: "1px solid var(--rl-gray-200)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--rl-gray-600)",
          }}><Icon name="dashboard" size={18} /></span>
          <div>
            <div style={{ font: "600 13px/18px var(--rl-font-display)", color: "var(--rl-gray-900)" }}>
              ¿Solo quieres revisar?
            </div>
            <div className="prt-hint" style={{ fontSize: 12 }}>Consumos, KPIs y la tabla por sucursal.</div>
          </div>
        </div>
        <Btn kind="ghost" iconRight="arrow_forward" onClick={() => dispatch({ type: "NAVIGATE", view: "dashboard" })}>
          Ir al dashboard
        </Btn>
      </div>

      <div className="prt-hint" style={{ fontSize: 11, color: "var(--rl-gray-400)" }}>
        Última actividad · 28 feb 2026 · Combustible Diésel — Planta Norte
      </div>
    </div>
  );
};

Object.assign(window, { Landing });
