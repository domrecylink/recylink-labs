// Shared wireframe primitives — exposes globals
// (no JSX exports — Babel scripts don't share scope)

const Ico = ({ tag = "□", size, kind, style }) => (
  <span className={"wf-ico " + (size || "") + " " + (kind || "")} style={style}>{tag}</span>
);

// Top "embed bar" — sutil hint de que va embebido en iframe
const EmbedBar = ({ host = "plataforma.host / módulo · Consumos" }) => (
  <div className="wf-embed-bar">
    <span className="dot"></span>
    <span className="dot"></span>
    <span style={{ marginLeft: 8 }}>{host}</span>
    <span style={{ marginLeft: "auto", color: "var(--rl-gray-400)" }}>iframe · 1140 × auto</span>
  </div>
);

// Screen header inside the embedded area
const ScreenHeader = ({ eyebrow, title, right }) => (
  <div className="spread" style={{ marginBottom: 4 }}>
    <div>
      {eyebrow && <div className="wf-eyebrow">{eyebrow}</div>}
      <div className="wf-h1" style={{ marginTop: 4 }}>{title}</div>
    </div>
    {right && <div className="row">{right}</div>}
  </div>
);

// Field block: label + control area + helper
const Field = ({ label, required, helper, helperKind, children, style }) => (
  <div className="wf-field" style={style}>
    {label && (
      <div className="wf-label">
        {label}{required && <span className="req">*</span>}
      </div>
    )}
    {children}
    {helper && <div className={"wf-help " + (helperKind || "")}>{helper}</div>}
  </div>
);

const Input = ({ value, placeholder, suffix, focused, error, w }) => (
  <div className={"wf-input" + (focused ? " focused" : "") + (error ? " error" : "")} style={{ width: w }}>
    {value ? <span>{value}</span> : <span className="ph">{placeholder}</span>}
    {suffix && <span className="wf-suffix">{suffix}</span>}
  </div>
);

const Select = ({ value, placeholder, w }) => (
  <div className="wf-input wf-select" style={{ width: w }}>
    {value ? <span>{value}</span> : <span className="ph">{placeholder || "Seleccionar…"}</span>}
    <span style={{ color: "var(--rl-gray-500)" }}>▾</span>
  </div>
);

const Btn = ({ children, kind, size, ico, style }) => (
  <button className={"wf-btn " + (kind || "") + " " + (size || "")} style={style}>
    {ico && <span style={{ opacity: 0.9 }}>{ico}</span>}
    {children}
  </button>
);

const Chip = ({ children, kind, dot = true }) => (
  <span className={"wf-chip " + (kind || "")}>
    {dot && <span className="dot"></span>}
    {children}
  </span>
);

// Step indicator
const Steps = ({ items }) => (
  <div className="wf-steps">
    {items.map((it, i) => (
      <React.Fragment key={i}>
        <span className={"step " + (it.state || "")}>
          <span className="num">{it.state === "done" ? "✓" : (i + 1)}</span>
          <span>{it.label}</span>
        </span>
        {i < items.length - 1 && <span className="sep"></span>}
      </React.Fragment>
    ))}
  </div>
);

// Sketchy line / bar chart placeholder (single-series, since user said: 1 tipo por gráfico)
const LineChart = ({ w = 520, h = 180, label, unit, color = "var(--rl-action)", data }) => {
  const pts = data || [
    [0, 0.7], [1, 0.55], [2, 0.62], [3, 0.45], [4, 0.5],
    [5, 0.35], [6, 0.4], [7, 0.28], [8, 0.32], [9, 0.22], [10, 0.3], [11, 0.18],
  ];
  const padL = 36, padR = 12, padT = 16, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xs = pts.map(p => p[0]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const sx = x => padL + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const sy = y => padT + (1 - y) * innerH;
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + sx(p[0]).toFixed(1) + "," + sy(p[1]).toFixed(1)).join(" ");
  const months = ["E","F","M","A","M","J","J","A","S","O","N","D"];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={padL} x2={w - padR} y1={padT + t * innerH} y2={padT + t * innerH}
              stroke="var(--rl-gray-200)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "2 3"} />
      ))}
      {/* axis labels */}
      <text x={padL - 6} y={padT + 4} textAnchor="end" fontSize="9" fill="var(--rl-gray-500)">{unit}</text>
      {months.map((m, i) => (
        <text key={i} x={sx(i)} y={h - 10} textAnchor="middle" fontSize="9" fill="var(--rl-gray-500)" fontFamily="var(--rl-font-display)">{m}</text>
      ))}
      {/* line */}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="2.5" fill="#FFF" stroke={color} strokeWidth="1.5" />
      ))}
      {label && (
        <text x={padL} y={12} fontSize="10" fontWeight="600" fontFamily="var(--rl-font-display)" fill="var(--rl-fg)">
          {label}
        </text>
      )}
    </svg>
  );
};

// Multi-line chart — varias series compartiendo unidad (subcategorías de un mismo tipo)
const MultiLineChart = ({ w = 520, h = 200, unit, series, monthLabels }) => {
  const months = monthLabels || ["E","F","M","A","M","J","J","A","S","O","N","D"];
  const padL = 36, padR = 12, padT = 16, padB = 36;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = months.length;
  const sx = i => padL + (i / (n - 1)) * innerW;
  const sy = y => padT + (1 - y) * innerH;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={padT + t * innerH} y2={padT + t * innerH}
                stroke="var(--rl-gray-200)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "2 3"} />
        ))}
        <text x={padL - 6} y={padT + 4} textAnchor="end" fontSize="9" fill="var(--rl-gray-500)">{unit}</text>
        {months.map((m, i) => (
          <text key={i} x={sx(i)} y={h - 18} textAnchor="middle" fontSize="9"
                fill="var(--rl-gray-500)" fontFamily="var(--rl-font-display)">{m}</text>
        ))}
        {series.map((s, si) => {
          const path = s.data.map((y, i) => (i === 0 ? "M" : "L") + sx(i).toFixed(1) + "," + sy(y).toFixed(1)).join(" ");
          return (
            <g key={si}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={s.dashed ? "5 3" : "0"} />
              {s.data.map((y, i) => (
                <circle key={i} cx={sx(i)} cy={sy(y)} r="2.2" fill="#FFF" stroke={s.color} strokeWidth="1.4" />
              ))}
            </g>
          );
        })}
      </svg>
      {/* legend */}
      <div className="row" style={{ flexWrap: "wrap", gap: 14, marginTop: 4, padding: "0 4px" }}>
        {series.map((s, i) => (
          <div key={i} className="row" style={{ gap: 6 }}>
            <span style={{
              display: "inline-block", width: 18, height: 0,
              borderTop: "2px " + (s.dashed ? "dashed" : "solid") + " " + s.color,
            }}></span>
            <span style={{ font: "600 11px/1 var(--rl-font-ui)", color: "var(--rl-fg)" }}>{s.label}</span>
            {s.value && <span className="wf-hint">· {s.value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Heatmap (single consumption type)
const Heatmap = ({ rows, cols, label, color = "var(--rl-action)" }) => {
  const months = cols || ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const sucursales = rows || ["Planta Norte","Planta Sur","CD Quilicura","Oficina Central","Bodega RM","Sucursal V"];
  // pseudo-random stable data
  const cell = (r, c) => {
    const seed = (r * 7 + c * 13 + 3) % 11;
    return seed / 10;
  };
  const cw = 38, ch = 22, pad = 4;
  const labW = 110;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${labW + months.length * cw + pad * 2} ${20 + sucursales.length * ch + pad * 2}`} width="100%" style={{ display: "block" }}>
        {months.map((m, c) => (
          <text key={c} x={labW + c * cw + cw / 2} y={14} textAnchor="middle"
                fontSize="9" fontFamily="var(--rl-font-display)" fontWeight="600" fill="var(--rl-gray-500)">{m}</text>
        ))}
        {sucursales.map((s, r) => (
          <g key={r}>
            <text x={labW - 6} y={20 + r * ch + 14} textAnchor="end" fontSize="10"
                  fontFamily="var(--rl-font-display)" fill="var(--rl-fg)">{s}</text>
            {months.map((m, c) => {
              const v = cell(r, c);
              return (
                <rect key={c} x={labW + c * cw + 1} y={20 + r * ch + 1}
                      width={cw - 2} height={ch - 2} rx="2"
                      fill={color} fillOpacity={0.08 + v * 0.7}
                      stroke="var(--rl-gray-200)" strokeWidth="0.5" />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
};

// Annotation post-it for wireframe context
const Anno = ({ children, style }) => (
  <div className="wf-anno" style={style}>{children}</div>
);

// Toast preview (floats inside artboard, not auto-positioned)
const Toast = ({ kind, title, body, style }) => (
  <div className={"wf-toast " + (kind || "")} style={style}>
    <span className="ico">{kind === "success" ? "✓" : kind === "warning" ? "!" : kind === "error" ? "×" : "i"}</span>
    <div>
      <div style={{ font: "600 13px/18px var(--rl-font-display)", color: "var(--rl-fg)" }}>{title}</div>
      {body && <div style={{ marginTop: 2, font: "var(--rl-text-xs)", color: "var(--rl-fg-muted)" }}>{body}</div>}
    </div>
  </div>
);

Object.assign(window, {
  Ico, EmbedBar, ScreenHeader, Field, Input, Select, Btn, Chip,
  Steps, LineChart, MultiLineChart, Heatmap, Anno, Toast,
});
