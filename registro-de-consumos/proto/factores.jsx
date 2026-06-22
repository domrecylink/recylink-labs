// Pantalla 2 — Configuración de factores de emisión (guía Huella Chile)

// Editor inline de un valor de factor
const FactorValueEdit = ({ value, unit, onCommit, onCancel }) => {
  const [v, setV] = React.useState(String(value));
  return (
    <div className="prt-row" style={{ gap: 8 }}>
      <div className="prt-input-wrap has-suffix" style={{ width: 150 }}>
        <input className="prt-input" type="number" step="0.0001" autoFocus value={v}
          onChange={e => setV(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onCommit(parseFloat(v)); if (e.key === "Escape") onCancel(); }}
          style={{ height: 38 }} />
        <span className="prt-suffix" style={{ fontSize: 11 }}>{unit.replace("kgCO₂e/", "/")}</span>
      </div>
      <button className="ob-icon-btn" style={{ color: "var(--rl-success-600)" }} title="Guardar" onClick={() => onCommit(parseFloat(v))}><Icon name="check" size={16} /></button>
      <button className="ob-icon-btn" title="Cancelar" onClick={onCancel}><Icon name="close" size={16} /></button>
    </div>
  );
};

// Fila de factor (empresa o sucursal)
const FactorRow = ({ fdef, keyName, level, sucId }) => {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = React.useState(false);

  const empValue = state.emissions.factoresEmpresa[keyName].value;
  const custom = level === "suc" && isCustomFactor(state, sucId, keyName);
  const pending = custom && state.emissions.factoresSucursal[sucId][keyName].pendingReview;
  const value = level === "empresa" ? empValue : factorFor(state, sucId, keyName);

  const commit = (val) => {
    if (isNaN(val)) { setEditing(false); return; }
    if (level === "empresa") {
      dispatch({ type: "EMIS/SET_COMPANY_FACTOR", key: keyName, value: val });
      dispatch({ type: "TOAST/SHOW", toast: { kind: "success", title: "Factor de empresa actualizado", body: `${fdef.label} · ${val} ${fdef.unit}. Las sucursales que heredan se recalculan.` } });
    } else {
      dispatch({ type: "EMIS/OVERRIDE_SUC_FACTOR", sucId, key: keyName, value: val });
      dispatch({ type: "TOAST/SHOW", toast: { kind: "success", title: "Factor personalizado", body: `${fdef.label} ahora usa ${val} ${fdef.unit} en esta sucursal.` } });
    }
    setEditing(false);
  };
  const reset = () => {
    dispatch({ type: "EMIS/RESET_SUC_FACTOR", sucId, key: keyName });
    dispatch({ type: "TOAST/SHOW", toast: { kind: "success", title: "Restablecido", body: `${fdef.label} vuelve al valor de empresa (${empValue} ${fdef.unit}).` } });
  };

  return (
    <div className={"emis-factor-row" + (pending ? " pending" : "")}>
      <span className="emis-factor-scope" style={{ background: SCOPES[fdef.scope].bg, color: SCOPES[fdef.scope].color }}>A{fdef.scope}</span>
      <div className="emis-factor-name">
        <div style={{ font: "600 14px/1.2 var(--rl-font-display)", color: "var(--rl-gray-900)" }}>{fdef.label}</div>
        <div className="prt-hint" style={{ fontSize: 11 }}>{fdef.fuente}</div>
      </div>

      {level === "suc" && (
        custom
          ? <Chip kind="info" size="sm" icon="edit">Personalizado</Chip>
          : <Chip size="sm" icon="link">Heredado de empresa</Chip>
      )}

      <div className="emis-factor-value">
        {editing ? (
          <FactorValueEdit value={value} unit={fdef.unit} onCommit={commit} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <span style={{ font: "700 15px/1 var(--rl-font-display)", color: "var(--rl-gray-900)" }}>{value}</span>
            <span className="prt-hint" style={{ fontSize: 11 }}>{fdef.unit}</span>
          </>
        )}
      </div>

      {!editing && (
        <div className="prt-row" style={{ gap: 4 }}>
          <button className="ob-icon-btn" style={{ color: "var(--rl-gray-500)" }} title="Editar factor"
            onMouseEnter={e => e.currentTarget.style.background = "var(--rl-gray-100)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            onClick={() => setEditing(true)}><Icon name="edit" size={15} /></button>
          {level === "suc" && custom && (
            <button className="ob-icon-btn" style={{ color: "var(--rl-gray-500)" }} title="Restablecer al valor de empresa"
              onMouseEnter={e => e.currentTarget.style.background = "var(--rl-gray-100)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              onClick={reset}><Icon name="undo" size={15} /></button>
          )}
        </div>
      )}
    </div>
  );
};

// Sección de refrigerantes (por sucursal)
const RefrigerantesSection = ({ sucId }) => {
  const { state, dispatch } = useApp();
  const list = sucId ? (state.emissions.refrigerantesSucursal[sucId] || []) : [];
  const gwpById = {};
  REFRIGERANTES_CATALOG.forEach(r => { gwpById[r.id] = r.gwp; });

  if (!sucId) {
    return (
      <div className="prt-hint" style={{ padding: "14px 0" }}>
        Los refrigerantes se cargan por sucursal. Selecciona una sucursal para gestionar su catálogo.
      </div>
    );
  }

  return (
    <div>
      <div className="prt-stack-sm" style={{ marginBottom: 12 }}>
        {list.length === 0 && (
          <div className="prt-hint" style={{ padding: "10px 0" }}>Sin refrigerantes registrados en esta sucursal.</div>
        )}
        {list.map(rf => {
          const def = REFRIGERANTES_CATALOG.find(r => r.id === rf.tipo);
          const tco2e = (rf.cargaKg * (def ? def.gwp : 0)) / 1000;
          return (
            <div key={rf.uid} className="emis-refrig-row">
              <span className="prt-kpi-ico" style={{ width: 34, height: 34, background: CAT_META.refrigerantes.bg, color: CAT_META.refrigerantes.color }}><Icon name="snowflake" size={16} /></span>
              <select className="prt-select" style={{ width: 130, height: 38 }} value={rf.tipo}
                onChange={e => dispatch({ type: "EMIS/UPDATE_REFRIG", sucId, uid: rf.uid, patch: { tipo: e.target.value } })}>
                {REFRIGERANTES_CATALOG.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <span className="emis-gwp-pill">GWP {def ? def.gwp.toLocaleString("es-CL") : "—"}</span>
              <div className="prt-input-wrap has-suffix" style={{ width: 130 }}>
                <input className="prt-input" type="number" step="0.1" value={rf.cargaKg} style={{ height: 38 }}
                  onChange={e => dispatch({ type: "EMIS/UPDATE_REFRIG", sucId, uid: rf.uid, patch: { cargaKg: parseFloat(e.target.value) || 0 } })} />
                <span className="prt-suffix" style={{ fontSize: 11 }}>kg</span>
              </div>
              <span className="prt-hint" style={{ fontSize: 12, marginLeft: "auto" }}>= <strong style={{ color: "var(--rl-gray-800)" }}>{fmtTon(tco2e, 2)}</strong> tCO₂e</span>
              <button className="ob-icon-btn" title="Quitar"
                onClick={() => dispatch({ type: "EMIS/REMOVE_REFRIG", sucId, uid: rf.uid })}><Icon name="delete" size={15} /></button>
            </div>
          );
        })}
      </div>
      <button className="ob-add-btn sm" onClick={() => dispatch({ type: "EMIS/ADD_REFRIG", sucId, tipo: "r410a", cargaKg: 1 })}>
        <Icon name="add" size={16} /><span>Agregar refrigerante</span>
      </button>
    </div>
  );
};

const FactoresView = () => {
  const { state, dispatch } = useApp();
  const viewSuc = state.emisSucursal; // "all" = empresa
  const level = viewSuc === "all" ? "empresa" : "suc";
  const sucId = viewSuc === "all" ? null : viewSuc;
  const pending = pendingOverrides(state).filter(p => sucId == null || p.sucId === sucId);

  const factorKeys = Object.keys(EMISSION_FACTOR_CATALOG);
  const byScope = { 1: [], 2: [], 3: [] };
  factorKeys.forEach(k => byScope[EMISSION_FACTOR_CATALOG[k].scope].push(k));

  return (
    <div>
      <SectionHead
        eyebrow="Impacto Ambiental / Configuración"
        title="Factores de emisión"
        sub="Define los factores base de la empresa según la guía Huella Chile. Cada sucursal los hereda y puede personalizarlos."
        right={<Btn icon="arrow_back" onClick={() => dispatch({ type: "NAVIGATE", view: "impacto" })}>Volver al impacto</Btn>}
      />

      {/* Selector de ámbito empresa / sucursal */}
      <div className="emis-scope-switch" style={{ marginBottom: 18 }}>
        <button className={"emis-scope-tab" + (viewSuc === "all" ? " active" : "")}
          onClick={() => dispatch({ type: "EMIS/SET_VIEW_SUC", sucId: "all" })}>
          <Icon name="factory" size={16} /> Empresa (base)
        </button>
        <span className="emis-scope-sep"></span>
        {state.configSucursales.map(s => {
          const overrides = state.emissions.factoresSucursal[s.id];
          const nCustom = overrides ? Object.keys(overrides).length : 0;
          return (
            <button key={s.id} className={"emis-scope-tab" + (viewSuc === s.id ? " active" : "")}
              onClick={() => dispatch({ type: "EMIS/SET_VIEW_SUC", sucId: s.id })}>
              {s.nombre}
              {nCustom > 0 && <span className="emis-scope-badge">{nCustom}</span>}
            </button>
          );
        })}
      </div>

      {/* Alerta override pendiente */}
      {pending.length > 0 && (
        <div className="emis-alert pending" style={{ marginBottom: 18 }}>
          <span className="ico" style={{ background: "var(--rl-warning-100)", color: "var(--rl-warning-700)" }}><Icon name="warning" size={20} /></span>
          <div className="prt-grow">
            <div className="ttl">Factor de empresa cambió — revisa tus valores personalizados</div>
            <div className="sub">
              {pending.map(p => `${p.label} (${p.sucNombre}): empresa ${p.empValue} · tu valor ${p.sucValue} ${p.unit}`).join(" · ")}
            </div>
          </div>
          {pending.map(p => (
            <Btn key={p.key} size="sm" onClick={() => dispatch({ type: "EMIS/ACK_PENDING", sucId: p.sucId, key: p.key })}>
              Marcar revisado
            </Btn>
          ))}
        </div>
      )}

      {level === "empresa" && (
        <div className="emis-info-banner" style={{ marginBottom: 18 }}>
          <Icon name="info" size={16} />
          <span>Estos valores son la <strong>configuración base</strong>. Todas las sucursales los heredan salvo que definan un valor propio.</span>
        </div>
      )}

      {/* Factores por alcance */}
      <div className="prt-stack-md" style={{ marginBottom: 18 }}>
        {[1, 2, 3].map(s => (
          <Card key={s} flush>
            <div className="prt-card-head">
              <div className="prt-row" style={{ gap: 10 }}>
                <span className="emis-factor-scope" style={{ background: SCOPES[s].bg, color: SCOPES[s].color }}>A{s}</span>
                <div>
                  <div className="prt-h3">{SCOPES[s].label}</div>
                  <div className="prt-hint">{SCOPES[s].desc}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "6px 22px 14px" }}>
              {byScope[s].map(k => (
                <FactorRow key={k} keyName={k} fdef={EMISSION_FACTOR_CATALOG[k]} level={level} sucId={sucId} />
              ))}
            </div>
          </Card>
        ))}

        {/* Refrigerantes */}
        <Card flush>
          <div className="prt-card-head">
            <div className="prt-row" style={{ gap: 10 }}>
              <span className="emis-factor-scope" style={{ background: SCOPES[1].bg, color: SCOPES[1].color }}>A1</span>
              <div>
                <div className="prt-h3">Refrigerantes</div>
                <div className="prt-hint">Catálogo por GWP · fugas y recargas (Alcance 1)</div>
              </div>
            </div>
            <Chip size="sm">{REFRIGERANTES_CATALOG.length} tipos disponibles</Chip>
          </div>
          <div style={{ padding: "16px 22px 18px" }}>
            <RefrigerantesSection sucId={sucId} />
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { FactoresView });
