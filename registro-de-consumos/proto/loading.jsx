// Loading — full-page Recylink loader (diamond wave pulse).
// Imported from claude.ai/design Loading.dc.html (project f60d00c9-…).
// Baked props: duration=0.8s, accel=0.8, trail='wave'.

const LOADING_DIAMONDS = [
  // RIGHT CLUSTER (blue) — #1..#6
  { d: "M265.8 132.9L310.1 177.2L265.8 221.5L221.5 177.2Z", fill: "#0083C0" },
  { d: "M310.1 177.2L354.4 221.5L310.1 265.8L265.8 221.5Z", fill: "#0083C0" },
  { d: "M354.4 132.9L398.7 177.2L354.4 221.5L310.1 177.2Z", fill: "#0083C0" },
  { d: "M398.7 88.6L443 132.9L398.7 177.2L354.4 132.9Z",   fill: "#0083C0" },
  { d: "M354.4 44.3L398.7 88.6L354.4 132.9L310.1 88.6Z",   fill: "#0083C0" },
  { d: "M310.1 0L354.4 44.3L310.1 88.6L265.8 44.3Z",       fill: "#0083C0" },
  // BRIDGES
  { d: "M265.8 44.3L310.1 88.6L265.8 132.9L221.5 132.9L221.5 88.6Z",    fill: "#0083C0" },
  { d: "M177.2 132.9L221.5 132.9L221.5 177.2L177.2 221.5L132.9 177.2Z", fill: "#12B76A" },
  // LEFT CLUSTER (green) — #9..#14
  { d: "M132.9 177.2L177.2 221.5L132.9 265.8L88.6 221.5Z", fill: "#12B76A" },
  { d: "M88.6 132.9L132.9 177.2L88.6 221.5L44.3 177.2Z",   fill: "#12B76A" },
  { d: "M44.3 88.6L88.6 132.9L44.3 177.2L0 132.9Z",        fill: "#12B76A" },
  { d: "M88.6 44.3L132.9 88.6L88.6 132.9L44.3 88.6Z",      fill: "#12B76A" },
  { d: "M132.9 0L177.2 44.3L132.9 88.6L88.6 44.3Z",        fill: "#12B76A" },
  { d: "M177.2 44.3L221.5 88.6L177.2 132.9L132.9 88.6Z",   fill: "#12B76A" },
];

const LOADING_DURATION = 0.8;   // seconds per full loop
const LOADING_ACCEL    = 0.8;   // -0.8..0.8 non-linearity
const LOADING_TRAIL    = "wave"; // 'dot' | 'wave' | 'comet'
const LOADING_EASING   = "cubic-bezier(0.4, 0, 0.2, 1)";

// Inject keyframes once (idempotent).
(function injectLoadingKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("rl-loading-keyframes")) return;
  const style = document.createElement("style");
  style.id = "rl-loading-keyframes";
  style.textContent = `
    @keyframes rl-pulse-dot {
      0%, 92%, 100% { opacity: 0.16; transform: scale(0.84); }
      4%            { opacity: 1.00; transform: scale(1.00); }
      14%           { opacity: 0.16; transform: scale(0.84); }
    }
    @keyframes rl-pulse-wave {
      0%, 70%, 100% { opacity: 0.18; transform: scale(0.86); }
      15%           { opacity: 1.00; transform: scale(1.00); }
      35%           { opacity: 0.18; transform: scale(0.86); }
    }
    @keyframes rl-pulse-comet {
      0%, 100% { opacity: 0.18; transform: scale(0.88); }
      8%       { opacity: 1.00; transform: scale(1.00); }
      30%      { opacity: 0.55; transform: scale(0.94); }
      55%      { opacity: 0.28; transform: scale(0.90); }
    }
    @keyframes rl-loading-bounce {
      0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
      40%           { opacity: 1;    transform: translateY(-3px); }
    }
    .rl-loading-dot {
      animation: rl-loading-bounce 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
})();

const LoadingScreen = ({ label = "Cargando", inline = false }) => {
  const N = LOADING_DIAMONDS.length;
  const tau = 2 * Math.PI;
  const reposition = (t) => t + (LOADING_ACCEL / tau) * Math.sin(tau * t);
  const animName = `rl-pulse-${LOADING_TRAIL}`;

  const containerStyle = inline ? {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    padding: "48px 24px",
    background: "transparent",
    fontFamily: "var(--rl-font-display), 'Plus Jakarta Sans', system-ui, sans-serif",
    boxSizing: "border-box",
  } : {
    minHeight: "calc(100vh - 0px)",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    background: "var(--rl-bg-canvas, #FCFEFF)",
    fontFamily: "var(--rl-font-display), 'Plus Jakarta Sans', system-ui, sans-serif",
    padding: 48,
    boxSizing: "border-box",
  };

  const svgSize = inline ? { width: 160, height: 96 } : { width: 240, height: 144 };

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <svg
        width={svgSize.width}
        height={svgSize.height}
        viewBox="0 0 443 265.8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={label}
        role="img"
      >
        {LOADING_DIAMONDS.map((o, i) => {
          const t = reposition(i / N);
          const delay = (LOADING_DURATION * t).toFixed(3);
          return (
            <path
              key={i}
              d={o.d}
              style={{
                animation: `${animName} ${LOADING_DURATION}s ${LOADING_EASING} infinite`,
                animationDelay: `${delay}s`,
                fill: o.fill,
                transformBox: "fill-box",
                transformOrigin: "center",
                willChange: "opacity, transform",
              }}
            />
          );
        })}
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.01em",
          color: "var(--rl-gray-600, #475467)",
        }}>{label}</span>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "flex-end", height: 16 }}>
          <span className="rl-loading-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rl-primary-900, #0069A6)", animationDelay: "0s" }}></span>
          <span className="rl-loading-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rl-primary-900, #0069A6)", animationDelay: "0.16s" }}></span>
          <span className="rl-loading-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rl-primary-900, #0069A6)", animationDelay: "0.32s" }}></span>
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { LoadingScreen });
