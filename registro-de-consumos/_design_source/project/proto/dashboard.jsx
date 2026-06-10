// Dashboard — KPIs + tabs por tipo + subcat pills + chart + heatmap + tabla editable

// ============================================================
// Selectors / aggregators
// ============================================================
function selectFilteredRecords(state) {
  const { sucursal, period, typeTab, subcat } = state.dashFilters;
  const monthKeys = new Set(periodToMonthKeys(period));
  return state.records.filter(r => {
    if (sucursal !== "all" && r.sucursal !== sucursal) return false;
    const mk = r.date.slice(0, 7);
    if (!monthKeys.has(mk)) return false;
    if (typeTab !== "all" && r.type !== typeTab) return false;
    if (typeTab === r.type && subcat !== "all" && r.subcat !== subcat) return false;
    return true;
  });
}

function kpiAggregates(state) {
  // current period filtered
  const filtered = selectFilteredRecords(state);
  // current month (mar 2026)
  const curMonth = "2026-03";
  const curMonthRecs = filtered.filter(r => r.date.startsWith(curMonth));
  const prevMonth = "2026-02";
  // For "vs prev" we always look at same scope but prev month
  const allInScope = state.records.filter(r => {
    const { sucursal, typeTab, subcat } = state.dashFilters;
    if (sucursal !== "all" && r.sucursal !== sucursal) return false;
    if (typeTab !== "all" && r.type !== typeTab) return false;
    if (typeTab === r.type && subcat !== "all" && r.subcat !== subcat) return false;
    return true;
  });
  const prevMonthRecs = allInScope.filter(r => r.date.startsWith(prevMonth));

  const sumQty = arr => arr.reduce((a, r) => a + (r.cantidad || 0), 0);
  const sumCost = arr => arr.reduce((a, r) => a + (r.costo || 0), 0);

  const qtyCur = sumQty(curMonthRecs);
  const qtyPrev = sumQty(prevMonthRecs);
  const qtyDelta = qtyPrev > 0 ? ((qtyCur - qtyPrev) / qtyPrev) * 100 : 0;

  const costCur = sumCost(curMonthRecs);
  const costPrev = sumCost(prevMonthRecs);
  const costDelta = costPrev > 0 ? ((costCur - costPrev) / costPrev) * 100 : 0;

  // Sucursales reportadas (en periodo)
  const sucReporting = new Set(filtered.map(r => r.sucursal));

  return {
    qtyCur, qtyDelta,
    costCur, costDelta,
    sucCount: sucReporting.size,
    totalSuc: SUCURSALES.length,
    recordsInPeriod: filtered.length,
  };
}

// Aggregate filtered records by (subcat, month) — for multi-line chart
function chartDataByMonthAndSubcat(state) {
  const { typeTab, period } = state.dashFilters;
  const monthKeys = periodToMonthKeys(period);
  const type = TYPES[typeTab];
  const subs = INITIAL_SUBCATS[typeTab];

  // Records filtered by sucursal + type (NOT by subcat — we plot all)
  const { sucursal } = state.dashFilters;
  const recs = state.records.filter(r => {
    if (r.type !== typeTab) return false;
    if (sucursal !== "all" && r.sucursal !== sucursal) return false;
    const mk = r.date.slice(0, 7);
    if (!monthKeys.includes(mk)) return false;
    return true;
  });

  if (subs.length === 0) {
    // No subcat — single series
    const series = [{
      key: typeTab, label: type.label,
      color: type.color,
      data: monthKeys.map(mk => recs.filter(r => r.date.startsWith(mk)).reduce((a, r) => a + r.cantidad, 0)),
    }];
    return { months: monthKeys, series, unit: type.unit };
  }

  const colors = [type.color, "var(--rl-primary-900)", "var(--rl-success-600)", "var(--rl-error-500)"];
  const series = subs.map((sub, i) => ({
    key: sub.id, label: sub.label,
    color: colors[i % colors.length],
    dashed: i >= 2,
    data: monthKeys.map(mk =>
      recs.filter(r => r.date.startsWith(mk) && r.subcat === sub.id).reduce((a, r) => a + r.cantidad, 0)
    ),
  }));
  return { months: monthKeys, series, unit: type.unit };
}

// Heatmap data: row=sucursal, col=month, value=qty for active type+subcat+period (no sucursal filter)
function heatmapData(state) {
  const { typeTab, period, subcat } = state.dashFilters;
  const monthKeys = periodToMonthKeys(period);
  const recs = state.records.filter(r => {
    if (r.type !== typeTab) return false;
    const mk = r.date.slice(0, 7);
    if (!monthKeys.includes(mk)) return false;
    if (subcat !== "all" && r.subcat !== subcat) return false;
    return true;
  });
  const rows = SUCURSALES.map(suc => ({
    suc,
    cells: monthKeys.map(mk => recs.filter(r => r.sucursal === suc && r.date.startsWith(mk)).reduce((a, r) => a + r.cantidad, 0)),
  }));
  return { months: monthKeys, rows };
}

// ============================================================
// Chart components
// ============================================================
const MultiLineChart = ({ months: monthArr, series, unit, h = 220 }) => {
  const w = 620;
  const padL = 44, padR = 16, padT = 18, padB = 30;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = monthArr.length;
  const allValues = series.flatMap(s => s.data);
  const yMax = Math.max(...allValues, 1);
  const sx = i => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const sy = y => padT + (1 - (y / yMax)) * innerH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => yMax * t);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        {/* y grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={padT + t * innerH} y2={padT + t * innerH}
                stroke="var(--rl-gray-200)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "2 4"} />
        ))}
        {/* y labels */}
        {yTicks.map((v, i) => (
          <text key={i} x={padL - 8} y={sy(v) + 3} textAnchor="end" fontSize="10"
                fontFamily="var(--rl-font-display)" fill="var(--rl-gray-500)">
            {Math.round(v).toLocaleString("es-CL")}
          </text>
        ))}
        <text x={padL - 8} y={padT - 6} textAnchor="end" fontSize="10"
              fontFamily="var(--rl-font-display)" fill="var(--rl-gray-500)" fontWeight="700">{unit}</text>

        {/* x labels (months) */}
        {monthArr.map((mk, i) => {
          if (n > 6 && i % Math.ceil(n / 6) !== 0) return null;
          return (
            <text key={i} x={sx(i)} y={h - 10} textAnchor="middle" fontSize="10"
                  fontFamily="var(--rl-font-display)" fill="var(--rl-gray-500)">
              {monthLabelShort(mk)}
            </text>
          );
        })}

        {/* lines */}
        {series.map((s, si) => {
          const path = s.data.map((y, i) => (i === 0 ? "M" : "L") + sx(i).toFixed(1) + "," + sy(y).toFixed(1)).join(" ");
          return (
            <g key={si}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={s.dashed ? "6 4" : "0"} />
              {s.data.map((y, i) => (
                <circle key={i} cx={sx(i)} cy={sy(y)} r="3" fill="#FFFFFF" stroke={s.color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
      {/* legend */}
      <div className="prt-row" style={{ flexWrap: "wrap", gap: 14, marginTop: 8, padding: "0 8px" }}>
        {series.map((s, i) => {
          const total = s.data.reduce((a, b) => a + b, 0);
          return (
            <div key={i} className="prt-row" style={{ gap: 6 }}>
              <span style={{
                display: "inline-block", width: 18, height: 0,
                borderTop: "2.5px " + (s.dashed ? "dashed" : "solid") + " " + s.color,
              }}></span>
              <span style={{ font: "600 12px/1 var(--rl-font-display)", color: "var(--rl-gray-800)" }}>{s.label}</span>
              <span className="prt-hint" style={{ fontSize: 11 }}>· {fmtNum(total)} {unit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Heatmap = ({ months: monthArr, rows, color, unit }) => {
  const maxV = Math.max(1, ...rows.flatMap(r => r.cells));
  const cw = 38, ch = 26, pad = 4;
  const labW = 116;
  const w = labW + monthArr.length * cw + pad * 2;
  const h = 24 + rows.length * ch + pad * 2;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        {monthArr.map((mk, c) => (
          <text key={c} x={labW + c * cw + cw / 2} y={16} textAnchor="middle" fontSize="10"
                fontFamily="var(--rl-font-display)" fontWeight="700" fill="var(--rl-gray-500)">
            {monthLabelShort(mk).slice(0,3)}
          </text>
        ))}
        {rows.map((r, ri) => (
          <g key={ri}>
            <text x={labW - 8} y={24 + ri * ch + 16} textAnchor="end" fontSize="11"
                  fontFamily="var(--rl-font-display)" fontWeight="600" fill="var(--rl-gray-700)">{r.suc}</text>
            {r.cells.map((v, ci) => {
              const intensity = v === 0 ? 0 : Math.max(0.08, v / maxV);
              return (
                <rect key={ci} x={labW + ci * cw + 1} y={24 + ri * ch + 2}
                      width={cw - 2} height={ch - 4} rx="3"
                      fill={color} fillOpacity={intensity * 0.85 + (v > 0 ? 0.05 : 0)}
                      stroke="var(--rl-gray-100)" strokeWidth="0.5">
                  <title>{r.suc} · {monthLabelShort(monthArr[ci])} · {fmtNum(v)} {unit}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ============================================================
// Sub-components
// ============================================================
const KpiCard = ({ label, value, unit, icon, color, bg, delta, deltaKind, sub }) => (
  <div className="prt-kpi">
    <div className="prt-kpi-head">
      <span className="prt-kpi-label">{label}</span>
      <span className="prt-kpi-ico" style={{ background: bg, color }}><Icon name={icon} size={22} /></span>
    </div>
    <div className="prt-kpi-value">
      <span>{value}</span>
      {unit && <span className="unit">{unit}</span>}
    </div>
    {(delta != null || sub) && (
      <div className="prt-row" style={{ gap: 8, flexWrap: "wrap" }}>
        {delta != null && (
          <span className={"prt-kpi-delta " + (deltaKind || "neutral")}>
            <Icon name={deltaKind === "up" ? "trending_up" : deltaKind === "dn" ? "trending_down" : "trending_flat"} size={13} />
            {(delta > 0 ? "+" : "") + delta.toFixed(1) + "%"}
          </span>
        )}
        {sub && <span className="prt-hint" style={{ fontSize: 11 }}>{sub}</span>}
      </div>
    )}
  </div>
);

const TypeTabs = () => {
  const { state, dispatch } = useApp();
  const active = state.dashFilters.typeTab;
  // compute totals per type for current period (for the sublabel)
  const monthKeys = new Set(periodToMonthKeys(state.dashFilters.period));
  const { sucursal } = state.dashFilters;
  const totals = {};
  Object.keys(TYPES).forEach(k => {
    const sum = state.records
      .filter(r => r.type === k && monthKeys.has(r.date.slice(0,7)) && (sucursal === "all" || r.sucursal === sucursal))
      .reduce((a, r) => a + r.cantidad, 0);
    totals[k] = sum;
  });
  return (
    <div className="prt-type-tabs">
      {Object.values(TYPES).map(t => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            className={"prt-type-tab " + t.id + (isActive ? " active" : "")}
            onClick={() => dispatch({ type: "DASH/SET_FILTER", key: "typeTab", value: t.id })}
          >
            <span className="ico"><Icon name={t.icon} size={20} /></span>
            <div>
              <div className="lbl">{t.label}</div>
              <div className="sub">{fmtNum(totals[t.id])} {t.unit}</div>
            </div>
          </button>
        );
      })}
      <div style={{ marginLeft: "auto", paddingBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <Btn size="sm" icon="file_download">Exportar</Btn>
      </div>
    </div>
  );
};

const SubcatPills = () => {
  const { state, dispatch } = useApp();
  const { typeTab, subcat } = state.dashFilters;
  const subs = state.subcategories[typeTab] || [];
  if (subs.length === 0) {
    return (
      <div className="prt-subcat-bar">
        <span className="prt-eyebrow" style={{ color: "var(--rl-gray-500)" }}>
          {TYPES[typeTab].label} no usa subcategorías.
        </span>
      </div>
    );
  }
  const color = TYPES[typeTab].color;
  return (
    <div className="prt-subcat-bar">
      <span className="prt-eyebrow" style={{ marginRight: 4 }}>Subcategoría</span>
      <button
        className={"prt-pill" + (subcat === "all" ? " active " + typeTab : "")}
        onClick={() => dispatch({ type: "DASH/SET_FILTER", key: "subcat", value: "all" })}
      >Todas</button>
      {subs.map(s => (
        <button
          key={s.id}
          className={"prt-pill" + (subcat === s.id ? " active " + typeTab : "")}
          onClick={() => dispatch({ type: "DASH/SET_FILTER", key: "subcat", value: s.id })}
        >{s.label}</button>
      ))}
      <button
        className="prt-pill dashed"
        onClick={() => {
          const label = window.prompt(`Nueva subcategoría para ${TYPES[typeTab].label}:`);
          if (!label) return;
          const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          dispatch({ type: "SUBCAT/ADD", type: typeTab, id, label });
          dispatch({ type: "TOAST/SHOW", toast: {
            kind: "success", title: "Subcategoría creada",
            body: `"${label}" disponible en formularios y filtros.`,
          }});
        }}
      ><Icon name="add" size={12} /> Crear nueva</button>
      <span className="prt-hint" style={{ marginLeft: "auto", fontSize: 11 }}>
        Filtra gráfico y tabla. Comparables porque todas usan {TYPES[typeTab].unit}.
      </span>
    </div>
  );
};

const DashFilterBar = () => {
  const { state, dispatch } = useApp();
  const f = state.dashFilters;
  const set = (key, value) => dispatch({ type: "DASH/SET_FILTER", key, value });
  return (
    <div className="prt-row" style={{ flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
      <select className="prt-select" style={{ width: 220 }} value={f.sucursal} onChange={e => set("sucursal", e.target.value)}>
        <option value="all">Todas las sucursales ({SUCURSALES.length})</option>
        {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="prt-select" style={{ width: 200 }} value={f.period} onChange={e => set("period", e.target.value)}>
        <option value="12m">Últimos 12 meses</option>
        <option value="6m">Últimos 6 meses</option>
        <option value="3m">Últimos 3 meses</option>
        <option value="1m">Marzo 2026</option>
      </select>
      <Btn size="sm" kind="ghost" icon="filter_alt_off" onClick={() => {
        set("sucursal", "all"); set("period", "12m"); set("subcat", "all");
      }}>Limpiar filtros</Btn>
      <div style={{ marginLeft: "auto" }} className="prt-row" >
        <span className="prt-hint" style={{ fontSize: 11 }}>Actualizado 09:14</span>
        <Chip kind="success" size="sm" icon="check">Sincronizado</Chip>
      </div>
    </div>
  );
};

const InsightCallout = () => {
  const { dispatch } = useApp();
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <div className="prt-callout" style={{ marginBottom: 18 }}>
      <span className="badge">IA</span>
      <div className="prt-grow">
        <div className="ttl">Combustible bajó <strong style={{ color: "var(--rl-success-700)" }}>2,1%</strong> este mes — el descenso viene principalmente de Planta Norte.</div>
        <div className="sub">Hay 1 documento con error en Bodega RM que aún no se contabiliza.</div>
      </div>
      <Btn size="sm" kind="ghost" iconRight="arrow_forward">Ver detalles</Btn>
      <button onClick={() => setDismissed(true)} style={{ all: "unset", cursor: "pointer", color: "var(--rl-gray-500)", padding: 4 }}>
        <Icon name="close" size={18} />
      </button>
    </div>
  );
};

// ============================================================
// Recent records table — inline edit + undo
// ============================================================
const RecentTable = () => {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = React.useState(null); // { id, field }
  const rows = selectFilteredRecords(state)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const startEdit = (id, field) => setEditing({ id, field });
  const commitEdit = (id, field, value) => {
    const rec = state.records.find(r => r.id === id);
    if (!rec) { setEditing(null); return; }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) { setEditing(null); return; }
    if (rec[field] === parsed) { setEditing(null); return; }
    dispatch({ type: "DASH/EDIT_RECORD", id, patch: { [field]: parsed } });
    dispatch({ type: "TOAST/SHOW", toast: {
      kind: "success",
      title: field === "cantidad" ? "Cantidad actualizada" : "Costo actualizado",
      body: `${rec.sucursal} · ${TYPES[rec.type].label} · ${fmtDate(rec.date)} · ${fmtNum(rec[field])} → ${fmtNum(parsed)}${field === "cantidad" ? " " + rec.unit : ""}`,
      undoAction: () => dispatch({ type: "DASH/UNDO_EDIT" }),
    }});
    setEditing(null);
  };

  return (
    <Card flush>
      <div className="prt-card-head">
        <div>
          <div className="prt-h3">Tabla detallada · últimos registros</div>
          <div className="prt-hint" style={{ marginTop: 2 }}>Edita una celda haciendo clic. Los cambios se guardan al instante (con opción de deshacer).</div>
        </div>
        <div className="prt-row" style={{ gap: 8 }}>
          <Chip size="sm">{rows.length} de {selectFilteredRecords(state).length}</Chip>
          <Btn size="sm" icon="open_in_new">Ver todo</Btn>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="prt-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Sucursal</th>
              <th>Tipo</th>
              <th>Subcategoría</th>
              <th>Proveedor</th>
              <th className="num">Cantidad</th>
              <th className="num">Costo (CLP)</th>
              <th>Origen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className={"editable" + (state.recentlyEdited === r.id ? " row-just-saved" : "")}>
                <td>{fmtDate(r.date)}</td>
                <td>{r.sucursal}</td>
                <td><TypeIndicator type={r.type} withLabel /></td>
                <td>{r.subcat ? <Chip>{subcatLabel(r.type, r.subcat)}</Chip> : <span className="prt-hint">—</span>}</td>
                <td>{r.provider}</td>
                <td
                  className={"num" + (editing && editing.id === r.id && editing.field === "cantidad" ? " cell-edit" : "")}
                  onClick={() => startEdit(r.id, "cantidad")}
                  style={{ cursor: "pointer" }}
                >
                  {editing && editing.id === r.id && editing.field === "cantidad"
                    ? <EditCell defaultValue={r.cantidad} onCommit={(v) => commitEdit(r.id, "cantidad", v)} onCancel={() => setEditing(null)} align="right" />
                    : <span><strong>{fmtNum(r.cantidad)}</strong> <span className="prt-hint">{r.unit}</span></span>}
                </td>
                <td
                  className={"num" + (editing && editing.id === r.id && editing.field === "costo" ? " cell-edit" : "")}
                  onClick={() => startEdit(r.id, "costo")}
                  style={{ cursor: "pointer" }}
                >
                  {editing && editing.id === r.id && editing.field === "costo"
                    ? <EditCell defaultValue={r.costo} onCommit={(v) => commitEdit(r.id, "costo", v)} onCancel={() => setEditing(null)} align="right" />
                    : fmtCLP(r.costo)}
                </td>
                <td>
                  {r.origen === "pdf" && <Chip size="sm" icon="picture_as_pdf">PDF</Chip>}
                  {r.origen === "manual" && <Chip size="sm" icon="edit">Manual</Chip>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--rl-gray-500)" }}>
                No hay registros que coincidan con los filtros actuales.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Inline edit cell input
const EditCell = ({ defaultValue, onCommit, onCancel, align }) => {
  const [v, setV] = React.useState(String(defaultValue));
  return (
    <input
      type="number"
      value={v}
      autoFocus
      onChange={e => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={e => {
        if (e.key === "Enter") onCommit(v);
        if (e.key === "Escape") onCancel();
      }}
      style={{
        width: "100%", height: 44,
        border: "none", outline: "none", background: "transparent",
        padding: "0 16px",
        font: "500 13px/1 var(--rl-font-body)",
        color: "var(--rl-gray-900)",
        textAlign: align || "left",
      }}
    />
  );
};

// ============================================================
// Main Dashboard
// ============================================================
const Dashboard = () => {
  const { state, dispatch } = useApp();
  const kpis = kpiAggregates(state);
  const tt = TYPES[state.dashFilters.typeTab];
  const chart = chartDataByMonthAndSubcat(state);
  const heat = heatmapData(state);
  const filtered = selectFilteredRecords(state);

  // For the "active type KPI" we want the active type total in current month
  const curMonth = "2026-03";
  const activeTypeCur = state.records
    .filter(r => r.type === state.dashFilters.typeTab && r.date.startsWith(curMonth) && (state.dashFilters.sucursal === "all" || r.sucursal === state.dashFilters.sucursal) && (state.dashFilters.subcat === "all" || r.subcat === state.dashFilters.subcat))
    .reduce((a, r) => a + r.cantidad, 0);
  const activeTypePrev = state.records
    .filter(r => r.type === state.dashFilters.typeTab && r.date.startsWith("2026-02") && (state.dashFilters.sucursal === "all" || r.sucursal === state.dashFilters.sucursal) && (state.dashFilters.subcat === "all" || r.subcat === state.dashFilters.subcat))
    .reduce((a, r) => a + r.cantidad, 0);
  const activeTypeDelta = activeTypePrev > 0 ? ((activeTypeCur - activeTypePrev) / activeTypePrev) * 100 : 0;

  return (
    <div>
      <SectionHead
        eyebrow={`Dashboard · ${COMPANY}`}
        title="Consumos de servicios básicos"
        right={<>
          <Btn icon="edit" onClick={() => dispatch({ type: "NAVIGATE", view: "manual", manualStep: "form" })}>
            Registrar manual
          </Btn>
          <Btn kind="primary" icon="cloud_upload" onClick={() => dispatch({ type: "NAVIGATE", view: "upload", uploadStep: 1 })}>
            Subir documento
          </Btn>
        </>}
      />

      <DashFilterBar />

      <InsightCallout />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 18 }}>
        <KpiCard
          label={`${tt.label} este mes`}
          value={fmtNum(activeTypeCur)} unit={tt.unit}
          icon={tt.icon} color={tt.color} bg={tt.bg}
          delta={activeTypeDelta} deltaKind={activeTypeDelta < 0 ? "dn" : activeTypeDelta > 1 ? "up" : "neutral"}
          sub="vs. feb 2026"
        />
        <KpiCard
          label="Costo total mes"
          value={fmtCLP(kpis.costCur)}
          icon="payments" color="var(--rl-primary-900)" bg="var(--rl-primary-50)"
          delta={kpis.costDelta} deltaKind={kpis.costDelta < 0 ? "dn" : "up"}
          sub="todos los tipos · CLP"
        />
        <KpiCard
          label="Sucursales al día"
          value={kpis.sucCount} unit={`/ ${kpis.totalSuc}`}
          icon="apartment" color="var(--rl-success-700)" bg="var(--rl-success-50)"
          sub={kpis.sucCount === kpis.totalSuc ? "Todas reportaron" : `${kpis.totalSuc - kpis.sucCount} sin reportar`}
        />
        <KpiCard
          label="Registros en periodo"
          value={fmtNum(kpis.recordsInPeriod)}
          icon="receipt_long" color="var(--rl-gray-700)" bg="var(--rl-gray-100)"
          sub={`${periodLabel(state.dashFilters.period)}`}
        />
      </div>

      {/* Chart card */}
      <Card flush style={{ marginBottom: 18 }}>
        <TypeTabs />
        <SubcatPills />
        <div style={{ padding: "20px 22px 22px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28 }}>
          <div>
            <div className="prt-spread" style={{ marginBottom: 8 }}>
              <div>
                <div className="prt-h3">Tendencia por subcategoría</div>
                <div className="prt-hint">{tt.unit} / mes · {periodLabel(state.dashFilters.period)}</div>
              </div>
              <Chip>{tt.unit}</Chip>
            </div>
            <MultiLineChart months={chart.months} series={chart.series} unit={chart.unit} />
          </div>
          <div>
            <div className="prt-spread" style={{ marginBottom: 8 }}>
              <div>
                <div className="prt-h3">Consumo por sucursal</div>
                <div className="prt-hint">Suma · {tt.unit}</div>
              </div>
              <Chip>Heatmap</Chip>
            </div>
            <Heatmap months={heat.months} rows={heat.rows} color={tt.color} unit={tt.unit} />
          </div>
        </div>
      </Card>

      {/* Recent records table */}
      <RecentTable />
    </div>
  );
};

// Empty dashboard alternative — render only when there are 0 records (won't happen in seed, but coded for the case)
const DashboardEmpty = () => {
  const { dispatch } = useApp();
  return (
    <div>
      <SectionHead eyebrow={`Dashboard · ${COMPANY}`} title="Consumos de servicios básicos" />
      <EmptyState
        icon="inbox"
        title="Aún no hay consumos registrados"
        body="Cuando ingreses tu primer consumo (a mano o subiendo documentos), aquí verás KPIs, tendencias por tipo y la tabla detallada."
        actions={<>
          <Btn kind="primary" icon="edit" onClick={() => dispatch({ type: "NAVIGATE", view: "manual" })}>Registrar manualmente</Btn>
          <Btn icon="cloud_upload" onClick={() => dispatch({ type: "NAVIGATE", view: "upload" })}>Subir documento</Btn>
        </>}
      />
    </div>
  );
};

const DashboardView = () => {
  const { state } = useApp();
  if (state.records.length === 0) return <DashboardEmpty />;
  return <Dashboard />;
};

Object.assign(window, { DashboardView, Dashboard });
