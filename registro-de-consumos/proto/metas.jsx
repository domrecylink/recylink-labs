// Pantalla 3 — Definición de metas de reducción

const aniosBase = [2021, 2022, 2023, 2024];

// Bloque editor de una meta (empresa o sucursal)
const MetaEditor = ({ meta, onPatch, baseEmissions }) => {
  const abs = parseFloat(meta.absoluta) || 0;
  const rel = parseFloat(meta.relativa) || 0;
  // coherencia: reducción relativa implícita por meta absoluta
  const relFromAbs = baseEmissions > 0 ? ((baseEmissions - abs) / baseEmissions) * 100 : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {/* Meta absoluta */}
      <div className="emis-meta-card">
        <div className="prt-row" style={{ gap: 10, marginBottom: 14 }}>
          <span className="prt-kpi-ico" style={{ width: 38, height: 38, background: "var(--rl-primary-50)", color: "var(--rl-primary-900)" }}><Icon name="eco" size={18} /></span>
          <div>
            <div className="prt-h4">Meta absoluta</div>
            <div className="prt-hint">Emisiones máximas por año</div>
          </div>
        </div>
        <Field label="Tope anual de emisiones">
          <div className="prt-input-wrap has-suffix">
            <input className="prt-input" type="number" value={meta.absoluta}
              onChange={e => onPatch({ absoluta: e.target.value })} placeholder="Ej: 1.850" />
            <span className="prt-suffix">tCO₂e/año</span>
          </div>
        </Field>
        {baseEmissions > 0 && abs > 0 && (
          <div className="prt-hint" style={{ marginTop: 8 }}>
            Equivale a <strong style={{ color: "var(--rl-gray-700)" }}>{fmtTon(relFromAbs, 1)}%</strong> de reducción vs. {meta.anioBase}.
          </div>
        )}
      </div>

      {/* Meta relativa */}
      <div className="emis-meta-card">
        <div className="prt-row" style={{ gap: 10, marginBottom: 14 }}>
          <span className="prt-kpi-ico" style={{ width: 38, height: 38, background: "var(--rl-success-50)", color: "var(--rl-success-700)" }}><Icon name="percent" size={18} /></span>
          <div>
            <div className="prt-h4">Meta relativa</div>
            <div className="prt-hint">Reducción vs. año base</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Reducción objetivo">
            <div className="prt-input-wrap has-suffix">
              <input className="prt-input" type="number" value={meta.relativa}
                onChange={e => onPatch({ relativa: e.target.value })} placeholder="30" />
              <span className="prt-suffix">%</span>
            </div>
          </Field>
          <Field label="Año base">
            <Select value={String(meta.anioBase)} options={aniosBase.map(a => ({ value: String(a), label: String(a) }))}
              onChange={v => onPatch({ anioBase: parseInt(v, 10) })} />
          </Field>
        </div>
        {rel > 0 && baseEmissions > 0 && (
          <div className="prt-hint" style={{ marginTop: 8 }}>
            Objetivo: <strong style={{ color: "var(--rl-gray-700)" }}>{fmtTon(baseEmissions * (1 - rel / 100), 0)}</strong> tCO₂e/año.
          </div>
        )}
      </div>
    </div>
  );
};

const MetasView = () => {
  const { state, dispatch } = useApp();
  const metas = state.emissions.metas;
  const agg = emissionsAggregate(state);
  const annual = agg.total;
  const baseValue = annual / (1 - 0.12);

  // emisiones por sucursal para estimar base de cada una
  const bySuc = emissionsBySucursal(state, "all");
  const baseOfSuc = id => {
    const s = bySuc.find(x => x.id === id);
    return s ? s.tco2e / (1 - 0.12) : 0;
  };

  return (
    <div>
      <SectionHead
        eyebrow="Impacto Ambiental / Configuración"
        title="Metas de reducción"
        sub="Establece objetivos de reducción de emisiones a nivel de empresa y, opcionalmente, por sucursal."
        right={<Btn icon="arrow_back" onClick={() => dispatch({ type: "NAVIGATE", view: "impacto" })}>Volver al impacto</Btn>}
      />

      {/* Meta de empresa */}
      <Card style={{ marginBottom: 18 }}>
        <div className="prt-spread" style={{ marginBottom: 18 }}>
          <div className="prt-row" style={{ gap: 12 }}>
            <span className="prt-kpi-ico" style={{ width: 44, height: 44, background: "var(--rl-primary-900)", color: "#FFFFFF" }}><Icon name="factory" size={20} /></span>
            <div>
              <div className="prt-h2">Meta de empresa</div>
              <div className="prt-hint">Objetivo corporativo{COMPANY ? " · " + COMPANY : ""}</div>
            </div>
          </div>
          <Chip kind="info" size="sm">Base actual ≈ {fmtTon(baseValue, 0)} tCO₂e</Chip>
        </div>
        <MetaEditor
          meta={metas.empresa}
          baseEmissions={baseValue}
          onPatch={patch => dispatch({ type: "EMIS/SET_META_EMPRESA", patch })}
        />
      </Card>

      {/* Metas por sucursal */}
      <div className="prt-spread" style={{ marginBottom: 14 }}>
        <div>
          <div className="prt-h3">Metas por sucursal</div>
          <div className="prt-hint" style={{ marginTop: 2 }}>Cada sucursal puede heredar la meta de empresa o definir la suya propia.</div>
        </div>
      </div>

      <div className="prt-stack-md">
        {state.configSucursales.map(suc => {
          const has = !!metas.sucursales[suc.id];
          const base = baseOfSuc(suc.id);
          const meta = metas.sucursales[suc.id] || { absoluta: "", relativa: "", anioBase: metas.empresa.anioBase };
          return (
            <Card key={suc.id} flush>
              <div className="prt-card-head">
                <div className="prt-row" style={{ gap: 12 }}>
                  <span className="prt-kpi-ico" style={{ width: 38, height: 38, background: "var(--rl-gray-100)", color: "var(--rl-gray-600)" }}><Icon name="apartment" size={18} /></span>
                  <div>
                    <div className="prt-h4">{suc.nombre}</div>
                    <div className="prt-hint">
                      {has ? "Meta propia definida" : "Hereda la meta de empresa"} · base ≈ {fmtTon(base, 0)} tCO₂e
                    </div>
                  </div>
                  {!suc.activa && <Chip size="sm">Inactiva</Chip>}
                </div>
                {has ? (
                  <Btn size="sm" kind="ghost" icon="undo" onClick={() => {
                    dispatch({ type: "EMIS/CLEAR_META_SUC", sucId: suc.id });
                    dispatch({ type: "TOAST/SHOW", toast: { kind: "success", title: "Meta restablecida", body: `${suc.nombre} vuelve a heredar la meta de empresa.` } });
                  }}>Volver a heredar</Btn>
                ) : (
                  <Btn size="sm" icon="add" onClick={() => dispatch({ type: "EMIS/SET_META_SUC", sucId: suc.id, patch: {
                    absoluta: Math.round(base * (1 - metas.empresa.relativa / 100)),
                    relativa: metas.empresa.relativa, anioBase: metas.empresa.anioBase,
                  } })}>Definir meta propia</Btn>
                )}
              </div>
              {has && (
                <div style={{ padding: "18px 22px 22px" }}>
                  <MetaEditor
                    meta={meta}
                    baseEmissions={base}
                    onPatch={patch => dispatch({ type: "EMIS/SET_META_SUC", sucId: suc.id, patch })}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="prt-row" style={{ justifyContent: "flex-end", marginTop: 22 }}>
        <Btn kind="primary" icon="check" onClick={() => {
          dispatch({ type: "TOAST/SHOW", toast: { kind: "success", title: "Metas guardadas", body: "Los objetivos de reducción se aplicaron al dashboard de impacto." } });
          dispatch({ type: "NAVIGATE", view: "impacto" });
        }}>Guardar metas</Btn>
      </div>
    </div>
  );
};

Object.assign(window, { MetasView });
