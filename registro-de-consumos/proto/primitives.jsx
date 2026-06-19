// Shared UI primitives — icons come from icons.jsx (loaded before this)

// ---- Button ----
const Btn = ({ children, kind, size, icon, iconRight, onClick, disabled, style, type = "button", title }) => (
  <button
    type={type}
    className={"prt-btn" + (kind ? " " + kind : "") + (size ? " " + size : "") + (disabled ? " disabled" : "")}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    style={style}
    title={title}
  >
    {icon && <Icon name={icon} />}
    {children}
    {iconRight && <Icon name={iconRight} />}
  </button>
);

// ---- Field wrapper ----
const Field = ({ label, required, helper, helperKind, error, children, style }) => (
  <div className="prt-field" style={style}>
    {label && <label className="prt-label">{label}{required && <span className="req">*</span>}</label>}
    {children}
    {(error || helper) && (
      <div className={"prt-help" + (error ? " error" : helperKind ? " " + helperKind : "")}>
        {error && <Icon name="error" size={14} />}
        <span>{error || helper}</span>
      </div>
    )}
  </div>
);

// ---- Input ----
const Input = React.forwardRef(({ value, onChange, placeholder, suffix, error, type = "text", autoFocus, onBlur, onKeyDown, style }, ref) => {
  return (
    <div className={"prt-input-wrap" + (suffix ? " has-suffix" : "")}>
      <input
        ref={ref}
        type={type}
        className={"prt-input" + (error ? " error" : "")}
        value={value || ""}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        style={style}
      />
      {suffix && <span className="prt-suffix">{suffix}</span>}
    </div>
  );
});

// ---- Select ----
const Select = ({ value, onChange, options, placeholder, error, style }) => (
  <select
    className={"prt-select" + (error ? " error" : "")}
    value={value || ""}
    onChange={e => onChange && onChange(e.target.value)}
    style={style}
  >
    <option value="" disabled hidden>{placeholder || "Seleccionar…"}</option>
    {options.map(o => {
      if (typeof o === "string") return <option key={o} value={o}>{o}</option>;
      return <option key={o.value} value={o.value}>{o.label}</option>;
    })}
  </select>
);

// ---- Chip ----
const Chip = ({ children, kind, size, icon, dot, onClose }) => (
  <span className={"prt-chip" + (kind ? " " + kind : "") + (size ? " " + size : "")}>
    {dot && <span className="dot"></span>}
    {icon && <Icon name={icon} size={14} />}
    {children}
    {onClose && <button onClick={onClose} style={{ all: "unset", cursor: "pointer", marginLeft: 4, display: "inline-flex" }}><Icon name="close" size={14} /></button>}
  </span>
);

// ---- Type dot ----
const TypeIndicator = ({ type, withLabel }) => {
  const t = TYPES[type];
  if (!t) return null;
  return (
    <span className="prt-row" style={{ gap: 8 }}>
      <span className={"prt-type-dot " + type}><Icon name={t.icon} size={16} /></span>
      {withLabel && <span style={{ font: "600 13px/1 var(--rl-font-display)", color: "var(--rl-gray-800)" }}>{t.label}</span>}
    </span>
  );
};

// ---- Card ----
const Card = ({ children, style, flush, bordered, className }) => (
  <div
    className={"prt-card" + (flush ? " flush" : "") + (bordered ? " bordered" : "") + (className ? " " + className : "")}
    style={style}
  >
    {children}
  </div>
);

// ---- Section heading helper ----
const SectionHead = ({ eyebrow, title, sub, right }) => (
  <div className="prt-spread" style={{ marginBottom: 18 }}>
    <div>
      {eyebrow && <div className="prt-eyebrow">{eyebrow}</div>}
      <h1 className="prt-h1" style={{ marginTop: 4 }}>{title}</h1>
      {sub && <div className="prt-muted" style={{ marginTop: 6, maxWidth: 640 }}>{sub}</div>}
    </div>
    {right && <div className="prt-row">{right}</div>}
  </div>
);

// ---- Steps ----
const Steps = ({ items, current }) => (
  <div className="prt-steps">
    {items.map((it, i) => {
      const isActive = i === current;
      const isDone = i < current;
      const cls = isActive ? "active" : isDone ? "done" : "";
      return (
        <React.Fragment key={i}>
          <span className={"prt-step " + cls}>
            <span className="num">{isDone ? <Icon name="check" size={14} /> : i + 1}</span>
            <span>{it}</span>
          </span>
          {i < items.length - 1 && <span className={"prt-step-sep" + (isDone ? " done" : "")}></span>}
        </React.Fragment>
      );
    })}
  </div>
);

// ---- Empty state ----
const EmptyState = ({ icon = "inbox", title, body, actions }) => (
  <div className="prt-empty">
    <div className="icon-circle"><Icon name={icon} /></div>
    <div>
      <div className="prt-h2">{title}</div>
      {body && <div className="prt-muted" style={{ marginTop: 6, maxWidth: 460 }}>{body}</div>}
    </div>
    {actions && <div className="prt-row" style={{ marginTop: 4 }}>{actions}</div>}
  </div>
);

// ---- Toast Host ----
const ToastHost = () => {
  const { state, dispatch } = useApp();
  const t = state.toast;
  if (!t) return null;
  const iconMap = { success: "check", error: "close", warning: "warning", info: "info" };
  return (
    <div className="prt-toast-host">
      <div className={"prt-toast " + t.kind} role="status">
        <span className="ico"><Icon name={iconMap[t.kind] || "info"} size={18} /></span>
        <div className="prt-grow">
          <div className="title">{t.title}</div>
          {t.body && <div className="body">{t.body}</div>}
          {t.undoAction && (
            <div className="actions">
              <button className="undo" onClick={() => { t.undoAction(); dispatch({ type: "TOAST/HIDE" }); }}>
                Deshacer
              </button>
            </div>
          )}
        </div>
        <button className="close" onClick={() => dispatch({ type: "TOAST/HIDE" })}>
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
};

Object.assign(window, {
  Btn, Field, Input, Select, Chip, TypeIndicator,
  Card, SectionHead, Steps, EmptyState, ToastHost,
});
