// Shell — top-level layout: host chrome + iframe-embed bar + router + toast

const Shell = () => {
  const { state, dispatch } = useApp();

  // Persist scroll-to-top on view change
  React.useEffect(() => {
    const el = document.querySelector(".prt-host-content");
    if (el) el.scrollTop = 0;
  }, [state.view, state.manualStep, state.uploadStep]);

  return (
    <div className="prt-app">
      {/* Fake host browser window */}
      <div className="prt-host">
        <div className="prt-host-bar">
          <span className="traffic"><span></span><span></span><span></span></span>
          <span className="url">https://acme-corp.host/sustentabilidad/consumos</span>
          <span style={{ color: "var(--rl-gray-500)" }}>Acme Corp</span>
        </div>
        <div className="prt-host-content">
          <EmbedBar host="acme-corp.host" />
          <ViewSwitcher />
        </div>
      </div>

      <NavHints />
      <ToastHost />
    </div>
  );
};

const ViewSwitcher = () => {
  const { state } = useApp();
  switch (state.view) {
    case "manual":    return <ManualView />;
    case "upload":    return <UploadView />;
    case "dashboard": return <DashboardView />;
    case "landing":
    default:          return <Landing />;
  }
};

// Small persistent nav hint (lets users jump anywhere)
const NavHints = () => {
  const { state, dispatch } = useApp();
  const go = (view, extra) => dispatch({ type: "NAVIGATE", view, ...extra });
  const items = [
    { view: "landing",   label: "Inicio",      icon: "home" },
    { view: "manual",    label: "Manual",      icon: "edit" },
    { view: "upload",    label: "Subir",       icon: "cloud_upload" },
    { view: "dashboard", label: "Dashboard",   icon: "dashboard" },
  ];
  return (
    <div style={{
      position: "fixed",
      bottom: 18, left: "50%", transform: "translateX(-50%)",
      background: "rgba(16,24,40,0.92)",
      borderRadius: 999,
      padding: "6px 8px",
      display: "flex", gap: 4,
      boxShadow: "0 14px 36px -8px rgba(16,24,40,0.45)",
      backdropFilter: "blur(8px)",
      zIndex: 50,
    }}>
      {items.map(it => {
        const isActive = state.view === it.view;
        return (
          <button
            key={it.view}
            onClick={() => go(it.view, it.view === "manual" ? { manualStep: "form" } : it.view === "upload" ? { uploadStep: 1 } : {})}
            style={{
              all: "unset", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              font: "600 12px/1 var(--rl-font-display)",
              color: isActive ? "#0C111D" : "rgba(255,255,255,0.85)",
              background: isActive ? "#FFFFFF" : "transparent",
              transition: "background 100ms, color 100ms",
            }}
          >
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
          </button>
        );
      })}
      <div style={{ width: 1, background: "rgba(255,255,255,0.18)", margin: "4px 4px" }}></div>
      <button
        onClick={() => window.location.reload()}
        title="Reiniciar prototipo (recarga la página)"
        style={{
          all: "unset", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 12px", borderRadius: 999,
          color: "rgba(255,255,255,0.6)",
          font: "600 12px/1 var(--rl-font-display)",
        }}
      >
        <Icon name="refresh" size={16} />
        Reset
      </button>
    </div>
  );
};

Object.assign(window, { Shell, ViewSwitcher, NavHints });
