// Pantalla 1 — Dashboard de Impacto Ambiental (emisiones GEI)

// ---------- Charts (nombres únicos para evitar colisiones) ----------
const EmisAreaChart = ({ months: monthArr, data, color = "var(--rl-success-600)", h = 230 }) => {
  const w = 640;
  const padL = 46, padR = 16, padT = 18, padB = 28;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const n = monthArr.length;
  const yMax = Math.max(...data, 1) * 1.1;
  const sx = i => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const sy = y => padT + (1 - y / yMax) * innerH;
  const points = data.map((y, i) => [sx(i), sy(y)]);
  // smoothPath se declara en dashboard.jsx (script global cargado antes).
  const line = (typeof smoothPath === "function" && n > 1)
    ? smoothPath(points)
    : data.map((y, i) => (i === 0 ? "M" : "L") + sx(i).toFixed(1) + "," + sy(y).toFixed(1)).join(" ");
  const area = line + ` L${sx(n - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${sx(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => yMax * t);

  const [hoverIdx, setHoverIdx] = React.useState(null);
  const colW = n > 1 ? innerW / (n - 1) : innerW;

  // Posicionamiento tooltip: porcentaje sobre viewBox para escalar con SVG responsive.
  const tipLeftPct = hoverIdx != null ? (sx(hoverIdx) / w) * 100 : 0;
  const tipTopPct  = hoverIdx != null ? (sy(data[hoverIdx]) / h) * 100 : 0;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="emisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={padT + t * innerH} y2={padT + t * innerH}
                stroke="var(--rl-gray-200)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "2 4"} />
        ))}
        {yTicks.map((v, i) => (
          <text key={i} x={padL - 8} y={sy(v) + 3} textAnchor="end" fontSize="10"
                fontFamily="var(--rl-font-display)" fill="var(--rl-gray-500)">{fmtTon(v, 0)}</text>
        ))}
        <text x={padL - 8} y={padT - 6} textAnchor="end" fontSize="10"
              fontFamily="var(--rl-font-display)" fill="var(--rl-gray-500)" fontWeight="700">tCO₂e</text>
        {monthArr.map((mk, i) => {
          if (n > 6 && i % Math.ceil(n / 6) !== 0) return null;
          return <text key={i} x={sx(i)} y={h - 8} textAnchor="middle" fontSize="10"
                       fontFamily="var(--rl-font-display)" fill="var(--rl-gray-500)">{monthLabelShort(mk)}</text>;
        })}
        <path d={area} fill="url(#emisGrad)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((y, i) => <circle key={i} cx={sx(i)} cy={sy(y)} r="3" fill="#FFFFFF" stroke={color} strokeWidth="2" />)}

        {hoverIdx != null && (
          <g style={{ pointerEvents: "none" }}>
            <line x1={sx(hoverIdx)} x2={sx(hoverIdx)} y1={padT} y2={padT + innerH}
                  stroke="var(--rl-gray-500)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={sx(hoverIdx)} cy={sy(data[hoverIdx])} r="5"
                    fill={color} stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}

        {monthArr.map((mk, i) => (
          <rect key={"hover-" + i}
                x={sx(i) - colW / 2} y={padT}
                width={colW} height={innerH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)} />
        ))}
      </svg>

      {hoverIdx != null && (
        <div style={{
          position: "absolute",
          left: tipLeftPct + "%",
          top:  tipTopPct  + "%",
          transform: "translate(-50%, calc(-100% - 12px))",
          background: "var(--rl-gray-900, #1A1A1A)",
          color: "#FFFFFF",
          padding: "8px 12px",
          borderRadius: 8,
          font: "500 12px/1.3 var(--rl-font-display)",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          pointerEvents: "none",
          zIndex: 2,
        }}>
          <div style={{ opacity: 0.7, fontSize: 11, textTransform: "capitalize" }}>
            {monthLabelShort(monthArr[hoverIdx])}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>
            {fmtTon(data[hoverIdx])} <span style={{ opacity: 0.7, fontSize: 11 }}>tCO₂e</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Barras horizontales por sucursal (inactivas atenuadas + chip)
const EmisSucBars = ({ rows }) => {
  const max = Math.max(1, ...rows.map(r => r.tco2e));
  const sorted = [...rows].sort((a, b) => b.tco2e - a.tco2e);
  return (
    <div className="prt-stack-sm">
      {sorted.map(r => (
        <div key={r.id} className="emis-bar-row" style={{ opacity: r.activa ? 1 : 0.6 }}>
          <div className="emis-bar-label">
            <span style={{ fontWeight: 600, color: "var(--rl-gray-800)" }}>{r.nombre}</span>
            {!r.activa && <Chip size="sm">Inactiva</Chip>}
            {r.sinFactor && <Chip kind="warning" size="sm" icon="warning">Sin factor</Chip>}
          </div>
          <div className="emis-bar-track">
            <span className="emis-bar-fill" style={{
              width: (r.tco2e / max * 100) + "%",
              background: r.sinFactor ? "var(--rl-warning-300)" : r.activa ? "var(--rl-primary-900)" : "var(--rl-gray-300)",
            }}></span>
          </div>
          <div className="emis-bar-value">{r.sinFactor && r.tco2e === 0 ? "—" : fmtTon(r.tco2e)} <span className="prt-hint" style={{ fontSize: 11 }}>tCO₂e</span></div>
        </div>
      ))}
    </div>
  );
};

// Donut por categoría
const EmisCatDonut = ({ byCat, total }) => {
  const cats = Object.keys(CAT_META).filter(k => byCat[k] > 0);
  const r = 62, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="prt-row" style={{ gap: 24, alignItems: "center" }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--rl-gray-100)" strokeWidth="20" />
        {cats.map(k => {
          const frac = byCat[k] / total;
          const dash = frac * c;
          const el = (
            <circle key={k} cx="80" cy="80" r={r} fill="none"
                    stroke={CAT_META[k].color} strokeWidth="20"
                    strokeDasharray={`${dash} ${c - dash}`}
                    strokeDashoffset={-acc} transform="rotate(-90 80 80)" />
          );
          acc += dash;
          return el;
        })}
        <text x="80" y="74" textAnchor="middle" fontSize="22" fontWeight="700"
              fontFamily="var(--rl-font-display)" fill="var(--rl-gray-900)">{fmtTon(total, 0)}</text>
        <text x="80" y="92" textAnchor="middle" fontSize="10" fontFamily="var(--rl-font-display)"
              fill="var(--rl-gray-500)" letterSpacing="0.08em">tCO₂e TOTAL</text>
      </svg>
      <div className="prt-stack-sm" style={{ flex: 1 }}>
        {cats.map(k => (
          <div key={k} className="prt-spread" style={{ gap: 10 }}>
            <span className="prt-row" style={{ gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: CAT_META[k].color }}></span>
              <span style={{ font: "600 13px/1 var(--rl-font-display)", color: "var(--rl-gray-800)" }}>{CAT_META[k].label}</span>
            </span>
            <span className="prt-row" style={{ gap: 8 }}>
              <strong style={{ font: "700 13px/1 var(--rl-font-display)", color: "var(--rl-gray-900)" }}>{fmtTon(byCat[k])}</strong>
              <span className="prt-hint" style={{ fontSize: 11, minWidth: 34, textAlign: "right" }}>{Math.round(byCat[k] / total * 100)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progreso vs meta
const EmisGoalProgress = ({ current, goal, baseYear, baseValue }) => {
  const reduction = baseValue > 0 ? ((baseValue - current) / baseValue) * 100 : 0;
  const targetReduction = baseValue > 0 ? ((baseValue - goal) / baseValue) * 100 : 0;
  const pct = Math.max(0, Math.min(100, (reduction / targetReduction) * 100));
  const onTrack = reduction >= targetReduction * 0.6;
  return (
    <div>
      <div className="prt-spread" style={{ marginBottom: 6 }}>
        <span style={{ font: "700 26px/1 var(--rl-font-display)", color: "var(--rl-gray-900)" }}>
          {fmtTon(reduction, 1)}%
        </span>
        <Chip kind={onTrack ? "success" : "warning"} size="sm" icon={onTrack ? "trending_down" : "warning"}>
          {onTrack ? "En camino" : "Atención"}
        </Chip>
      </div>
      <div className="prt-hint" style={{ marginBottom: 14 }}>
        reducción lograda · meta {fmtTon(targetReduction, 0)}% vs año base {baseYear}
      </div>
      <div className="emis-goal-track">
        <span className="emis-goal-fill" style={{
          width: pct + "%",
          background: onTrack ? "var(--rl-success-500)" : "var(--rl-warning-400)",
        }}></span>
        <span className="emis-goal-marker" style={{ left: "100%" }} title="Meta"></span>
      </div>
      <div className="prt-spread" style={{ marginTop: 10 }}>
        <span className="prt-hint"><strong style={{ color: "var(--rl-gray-700)" }}>{fmtTon(current, 0)}</strong> tCO₂e actual</span>
        <span className="prt-hint">meta <strong style={{ color: "var(--rl-gray-700)" }}>{fmtTon(goal, 0)}</strong> tCO₂e</span>
      </div>
    </div>
  );
};

// ---------- Barra de filtros (sucursal + período) — espejo del dashboard ----------
const ImpactoFilterBar = () => {
  const { state, dispatch } = useApp();
  const f = state.emisFilters;
  const set = (key, value) => dispatch({ type: "EMIS/SET_FILTER", key, value });
  const custom = parseCustomPeriod(f.period);
  const isCustom = !!custom;
  const selValue = isCustom ? "custom" : f.period;
  const defStart = months[0];
  const defEnd = CURRENT_MONTH_KEY;
  const onPeriodChange = (v) => {
    if (v === "custom") set("period", `custom:${defStart}:${defEnd}`);
    else set("period", v);
  };
  const setRange = (start, end) => set("period", `custom:${start}:${end}`);
  return (
    <div className="prt-row" style={{ flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
      <select className="prt-select" style={{ width: 220 }} value={f.sucursal} onChange={e => set("sucursal", e.target.value)}>
        <option value="all">Todas las sucursales ({activeSucNames(state).length})</option>
        {activeSucNames(state).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="prt-select" style={{ width: 200 }} value={selValue} onChange={e => onPeriodChange(e.target.value)}>
        <option value="12m">Últimos 12 meses</option>
        <option value="6m">Últimos 6 meses</option>
        <option value="3m">Últimos 3 meses</option>
        <option value="1m">{periodLabel("1m")}</option>
        <option value="custom">Personalizado…</option>
      </select>
      {isCustom && (
        <div className="prt-row" style={{ gap: 6, alignItems: "center" }}>
          <input type="month" className="prt-input" style={{ width: 150 }}
            value={custom.start} max={custom.end}
            onChange={e => e.target.value && setRange(e.target.value, custom.end)} />
          <span className="prt-hint" style={{ opacity: 0.7 }}>—</span>
          <input type="month" className="prt-input" style={{ width: 150 }}
            value={custom.end} min={custom.start} max={CURRENT_MONTH_KEY}
            onChange={e => e.target.value && setRange(custom.start, e.target.value)} />
        </div>
      )}
      <Btn size="sm" kind="ghost" icon="filter_alt_off" onClick={() => {
        set("sucursal", "all"); set("period", "12m");
      }}>Limpiar filtros</Btn>
    </div>
  );
};

// ---------- Vista principal ----------
const ImpactoView = () => {
  const { state, dispatch } = useApp();
  const scopeFilter = state.emisScope;
  const filters = state.emisFilters;
  const periodLbl = periodLabel(filters.period);
  const agg = emissionsAggregate(state, filters);
  const month = emissionsByMonth(state, scopeFilter, filters);
  const bySuc = emissionsBySucursal(state, scopeFilter, filters);
  const sinFactor = sucursalesSinFactorNombres(state);

  // año base / meta (empresa)
  const meta = state.emissions.metas.empresa;
  // base value: emisiones anuales estimadas (suma 12m) escaladas al año base (+ meta.relativa para simular reducción ya lograda)
  const annual = agg.total;
  const baseValue = annual / (1 - 0.12); // simulamos que ya se ha reducido ~12% desde el año base
  const goalAbs = meta.absoluta;

  const scopeChips = [
    { id: "all", label: "Todos los alcances" },
    { id: "1", label: SCOPES[1].label },
    { id: "2", label: SCOPES[2].label },
    { id: "3", label: SCOPES[3].label },
  ];
  const lineColor = scopeFilter === "all" ? "var(--rl-success-600)" : SCOPE_COLORS[scopeFilter].stroke;

  return (
    <div>
      <SectionHead
        eyebrow={`Impacto Ambiental${COMPANY ? " · " + COMPANY : ""}`}
        title="Emisiones de gases de efecto invernadero"
        sub="Huella de carbono operacional medida en toneladas de CO₂ equivalente (tCO₂e), según la guía Huella Chile."
        right={<>
          <Btn icon="tune" onClick={() => dispatch({ type: "NAVIGATE", view: "factores" })}>Factores</Btn>
          <Btn kind="primary" icon="target" onClick={() => dispatch({ type: "NAVIGATE", view: "metas" })}>Metas</Btn>
        </>}
      />

      <ImpactoFilterBar />

      {/* Alerta global */}
      {sinFactor.length > 0 && (
        <div className="emis-alert" style={{ marginBottom: 18 }}>
          <span className="ico"><Icon name="warning" size={20} /></span>
          <div className="prt-grow">
            <div className="ttl">{sinFactor.length} sucursal{sinFactor.length > 1 ? "es" : ""} sin factor de emisión configurado</div>
            <div className="sub">
              {sinFactor.join(", ")} — sus consumos no se contabilizan en el total hasta definir el factor de su sistema eléctrico.
            </div>
          </div>
          <Btn size="sm" kind="primary" iconRight="arrow_forward" onClick={() => dispatch({ type: "NAVIGATE", view: "factores" })}>
            Configurar factores
          </Btn>
        </div>
      )}

      {/* KPIs: total + 3 alcances */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
        <div className="prt-kpi" style={{ background: "var(--rl-primary-900)", color: "#FFFFFF" }}>
          <div className="prt-kpi-head">
            <span className="prt-kpi-label" style={{ color: "rgba(255,255,255,0.75)" }}>Total emisiones · {periodLbl}</span>
            <span className="prt-kpi-ico" style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}><Icon name="eco" size={22} /></span>
          </div>
          <div className="prt-kpi-value" style={{ color: "#FFFFFF" }}>
            <span>{fmtTon(agg.total)}</span><span className="unit" style={{ color: "rgba(255,255,255,0.7)" }}>tCO₂e</span>
          </div>
          <div className="prt-row" style={{ gap: 8 }}>
            <span className="prt-kpi-delta" style={{ background: "rgba(255,255,255,0.16)", color: "#FFFFFF" }}>
              <Icon name="trending_down" size={13} /> −12,0%
            </span>
            <span className="prt-hint" style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>vs. año base {meta.anioBase}</span>
          </div>
        </div>
        {[1, 2, 3].map(s => {
          const v = agg.byScope[s];
          const pct = agg.total > 0 ? Math.round(v / agg.total * 100) : 0;
          return (
            <div key={s} className="prt-kpi">
              <div className="prt-kpi-head">
                <span className="prt-kpi-label">{SCOPES[s].label}</span>
                <span className="prt-kpi-ico" style={{ background: SCOPES[s].bg, color: SCOPES[s].color }}>
                  <Icon name={s === 1 ? "local_gas_station" : s === 2 ? "bolt" : "water_drop"} size={20} />
                </span>
              </div>
              <div className="prt-kpi-value"><span>{fmtTon(v)}</span><span className="unit">tCO₂e</span></div>
              <div className="prt-row" style={{ gap: 8 }}>
                <span className="prt-hint" style={{ fontSize: 11 }}>{SCOPES[s].desc} · {pct}% del total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evolución + meta */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card flush>
          <div className="prt-card-head">
            <div>
              <div className="prt-h3">Evolución de emisiones</div>
              <div className="prt-hint" style={{ marginTop: 2 }}>tCO₂e por mes · {periodLbl.toLowerCase()}</div>
            </div>
            <div className="prt-row" style={{ gap: 6, flexWrap: "wrap" }}>
              {scopeChips.map(sc => (
                <button key={sc.id}
                  className={"prt-pill" + (scopeFilter === sc.id ? " active" : "")}
                  onClick={() => dispatch({ type: "EMIS/SET_SCOPE", scope: sc.id })}>
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: "18px 22px 14px" }}>
            <EmisAreaChart months={month.months} data={month.data} color={lineColor} />
          </div>
        </Card>

        <Card>
          <div className="prt-row" style={{ gap: 8, marginBottom: 16 }}>
            <span className="prt-kpi-ico" style={{ width: 36, height: 36, background: "var(--rl-success-50)", color: "var(--rl-success-700)" }}><Icon name="target" size={18} /></span>
            <div>
              <div className="prt-h3">Progreso vs meta</div>
              <div className="prt-hint">Meta de reducción de empresa</div>
            </div>
          </div>
          <EmisGoalProgress current={annual} goal={goalAbs} baseYear={meta.anioBase} baseValue={baseValue} />
          <div className="prt-divider" style={{ margin: "18px 0 14px" }}></div>
          <button className="prt-btn sm" style={{ width: "100%" }} onClick={() => dispatch({ type: "NAVIGATE", view: "metas" })}>
            <Icon name="edit" size={15} /> Ajustar metas
          </button>
        </Card>
      </div>

      {/* Por categoría + por sucursal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18 }}>
        <Card>
          <div className="prt-h3" style={{ marginBottom: 4 }}>tCO₂e por tipo de consumo</div>
          <div className="prt-hint" style={{ marginBottom: 18 }}>Distribución de la huella total</div>
          <EmisCatDonut byCat={agg.byCat} total={agg.total} />
        </Card>

        <Card flush>
          <div className="prt-card-head">
            <div>
              <div className="prt-h3">Comparativa entre sucursales</div>
              <div className="prt-hint" style={{ marginTop: 2 }}>
                {scopeFilter === "all" ? "Todos los alcances" : SCOPES[scopeFilter].label} · tCO₂e · {periodLbl.toLowerCase()}
              </div>
            </div>
            <Chip>{bySuc.filter(s => s.activa).length} activas</Chip>
          </div>
          <div className="prt-card-body">
            <EmisSucBars rows={bySuc} />
          </div>
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { ImpactoView });
