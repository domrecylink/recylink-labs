// State + mock data for the Registro de Consumos prototype.
// Pure in-memory — reload resets everything.

// ----- Static catalog -----
const COMPANY = "Acme Corp";
const SUCURSALES = [
  "Planta Norte",
  "Planta Sur",
  "CD Quilicura",
  "Oficina Central",
  "Bodega RM",
  "Sucursal V",
];

const TYPES = {
  electricidad: { id: "electricidad", label: "Electricidad", unit: "kWh", icon: "bolt",          color: "var(--rl-primary-900)", bg: "var(--rl-primary-50)" },
  combustible:  { id: "combustible",  label: "Combustible",  unit: "L",   icon: "local_gas_station", color: "var(--rl-fuel)",       bg: "var(--rl-fuel-bg)" },
  agua:         { id: "agua",         label: "Agua",         unit: "m³",  icon: "water_drop",     color: "var(--rl-success-700)", bg: "var(--rl-success-50)" },
};

const INITIAL_SUBCATS = {
  electricidad: [],
  combustible: [
    { id: "diesel",      label: "Petróleo Diésel", source: "predef" },
    { id: "kerosene",    label: "Kerosene",        source: "predef" },
    { id: "glp",         label: "GLP",             source: "predef" },
    { id: "gas-natural", label: "Gas Natural",     source: "predef" },
  ],
  agua: [
    { id: "potable", label: "Agua Potable", source: "predef" },
    { id: "gris",    label: "Agua Gris",    source: "predef" },
    { id: "riego",   label: "Riego",        source: "custom" },
  ],
};

const PROVIDERS = {
  electricidad: ["Enel", "CGE", "Saesa"],
  combustible:  ["Iconstruye Petróleo", "Copec", "Shell", "Petrobras"],
  agua:         ["Aguas Andinas", "Esval", "Essbio"],
};

// ----- Seed records -----
// Months: 2025-04 → 2026-03 (12 months) — keys "YYYY-MM"
const monthKey = (y, m) => `${y}-${String(m).padStart(2,"0")}`;
const months = [];
{
  let y = 2025, m = 4;
  for (let i = 0; i < 12; i++) {
    months.push(monthKey(y, m));
    m++;
    if (m > 12) { m = 1; y++; }
  }
}

let __idCounter = 1;
const nextId = () => "r" + (__idCounter++);

// generate stable pseudo records — one per (sucursal × type × subcat-or-blank × month)
// scaled down for variety
function seedRecords() {
  const recs = [];
  // Electricidad — every sucursal, every month
  SUCURSALES.forEach((suc, si) => {
    months.forEach((mo, mi) => {
      const base = 8000 + ((si * 1700 + mi * 240) % 6000);
      const noise = ((si * 7 + mi * 13) % 11) * 180;
      recs.push({
        id: nextId(),
        date: mo + "-28",
        sucursal: suc,
        type: "electricidad",
        subcat: null,
        provider: si % 3 === 0 ? "Enel" : si % 3 === 1 ? "CGE" : "Saesa",
        cantidad: Math.round((base + noise) / 10) * 10,
        unit: "kWh",
        costo: Math.round((base + noise) * 76),
        origen: mi % 3 === 0 ? "manual" : "pdf",
      });
    });
  });
  // Combustible — only Planta Norte / Sur / Bodega RM, all 4 subcats but rotating
  const fuelSuc = ["Planta Norte", "Planta Sur", "Bodega RM"];
  const fuelSubs = ["diesel", "kerosene", "glp", "gas-natural"];
  fuelSuc.forEach((suc, si) => {
    months.forEach((mo, mi) => {
      fuelSubs.forEach((sub, ki) => {
        if (ki >= 2 && si === 2) return; // bodega only diesel + kerosene
        if (ki === 3 && si === 0) return; // planta norte no gas-natural
        const base = ki === 0 ? 3000 : ki === 1 ? 1200 : ki === 2 ? 400 : 150;
        const noise = ((si * 5 + mi * 11 + ki * 3) % 9) * (base * 0.06);
        const qty = Math.round(base + noise);
        recs.push({
          id: nextId(),
          date: mo + "-28",
          sucursal: suc,
          type: "combustible",
          subcat: sub,
          provider: si === 0 ? "Iconstruye Petróleo" : si === 1 ? "Copec" : "Petrobras",
          cantidad: qty,
          unit: "L",
          costo: Math.round(qty * (ki === 0 ? 540 : ki === 1 ? 720 : ki === 2 ? 1100 : 900)),
          origen: mi % 4 === 0 ? "manual" : "pdf",
        });
      });
    });
  });
  // Agua — every sucursal, every month, mixed subcats
  SUCURSALES.forEach((suc, si) => {
    months.forEach((mo, mi) => {
      const subPick = si % 3 === 0 ? "potable" : si % 3 === 1 ? "gris" : "potable";
      const base = subPick === "potable" ? 110 : 30;
      const noise = ((si * 3 + mi * 7) % 7) * 6;
      const qty = base + noise;
      recs.push({
        id: nextId(),
        date: mo + "-28",
        sucursal: suc,
        type: "agua",
        subcat: subPick,
        provider: si % 2 === 0 ? "Aguas Andinas" : "Esval",
        cantidad: qty,
        unit: "m³",
        costo: Math.round(qty * 1280),
        origen: mi % 5 === 0 ? "manual" : "pdf",
      });
    });
  });
  // Add one Riego record so the custom subcat shows up
  recs.push({
    id: nextId(),
    date: "2026-03-28",
    sucursal: "Sucursal V",
    type: "agua",
    subcat: "riego",
    provider: "Esval",
    cantidad: 24,
    unit: "m³",
    costo: 30720,
    origen: "manual",
  });
  return recs;
}

// ----- Initial state -----
const initialState = {
  // routing
  view: "landing",            // landing | manual | upload | preview | dashboard | subcat
  manualStep: "form",         // form | preview | success
  uploadStep: 1,              // 1 | 2 | 3 | 4 (preview)
  // domain
  records: seedRecords(),
  subcategories: INITIAL_SUBCATS,
  // form drafts (manual)
  manualDraft: emptyDraft(),
  manualErrors: {},
  // upload state
  selectedProvider: null,
  uploadQueue: [],            // { id, name, size, type, status, progress, extractedCount, error }
  previewRows: [],            // rows after extraction or manual draft
  // dashboard
  dashFilters: { sucursal: "all", period: "12m", typeTab: "combustible", subcat: "all" },
  recentlyEdited: null,       // id of just-saved row
  // ui
  toast: null,                // { id, kind, title, body, undoAction }
};

function emptyDraft() {
  return {
    date: "2026-03-15",
    sucursal: "",
    type: "",
    subcat: "",
    provider: "",
    cantidad: "",
    costo: "",
    notes: "",
  };
}

// ----- Reducer -----
function reducer(state, action) {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, view: action.view, manualStep: action.manualStep || state.manualStep, uploadStep: action.uploadStep || state.uploadStep };

    // ----- Manual draft
    case "MANUAL/SET_FIELD": {
      const draft = { ...state.manualDraft, [action.field]: action.value };
      if (action.field === "type") draft.subcat = ""; // reset subcat when type changes
      const errors = { ...state.manualErrors };
      delete errors[action.field];
      return { ...state, manualDraft: draft, manualErrors: errors };
    }
    case "MANUAL/SET_ERRORS":
      return { ...state, manualErrors: action.errors };
    case "MANUAL/RESET":
      return { ...state, manualDraft: emptyDraft(), manualErrors: {}, manualStep: "form" };
    case "MANUAL/GO_PREVIEW":
      return { ...state, manualStep: "preview" };
    case "MANUAL/GO_FORM":
      return { ...state, manualStep: "form" };
    case "MANUAL/CONFIRM": {
      const d = state.manualDraft;
      const newRec = {
        id: nextId(),
        date: d.date,
        sucursal: d.sucursal,
        type: d.type,
        subcat: d.subcat || null,
        provider: d.provider || "—",
        cantidad: parseFloat(d.cantidad),
        unit: TYPES[d.type].unit,
        costo: parseFloat(d.costo) || 0,
        origen: "manual",
      };
      return { ...state, records: [newRec, ...state.records], manualStep: "success", manualDraft: emptyDraft() };
    }

    // ----- Upload
    case "UPLOAD/SET_PROVIDER":
      return { ...state, selectedProvider: action.provider, uploadStep: 2 };
    case "UPLOAD/SET_STEP":
      return { ...state, uploadStep: action.step };
    case "UPLOAD/ENQUEUE":
      return { ...state, uploadQueue: [...state.uploadQueue, ...action.files] };
    case "UPLOAD/UPDATE_FILE": {
      return {
        ...state,
        uploadQueue: state.uploadQueue.map(f => f.id === action.id ? { ...f, ...action.patch } : f),
      };
    }
    case "UPLOAD/REMOVE_FILE":
      return { ...state, uploadQueue: state.uploadQueue.filter(f => f.id !== action.id) };
    case "UPLOAD/SET_PREVIEW_ROWS":
      return { ...state, previewRows: action.rows };
    case "UPLOAD/RESET":
      return { ...state, selectedProvider: null, uploadQueue: [], previewRows: [], uploadStep: 1 };

    // ----- Preview editable table
    case "PREVIEW/UPDATE_ROW":
      return { ...state, previewRows: state.previewRows.map(r => r.id === action.id ? { ...r, ...action.patch } : r) };
    case "PREVIEW/DUPLICATE_ROW": {
      const idx = state.previewRows.findIndex(r => r.id === action.id);
      if (idx < 0) return state;
      const copy = { ...state.previewRows[idx], id: nextId(), status: "ok", _justDuplicated: true };
      const next = [...state.previewRows];
      next.splice(idx + 1, 0, copy);
      return { ...state, previewRows: next };
    }
    case "PREVIEW/DELETE_ROW":
      return { ...state, previewRows: state.previewRows.filter(r => r.id !== action.id) };
    case "PREVIEW/CONFIRM_ALL": {
      // turn previewRows into records
      const newRecs = state.previewRows
        .filter(r => r.status !== "error")
        .map(r => ({
          id: nextId(),
          date: r.date,
          sucursal: r.sucursal,
          type: r.type,
          subcat: r.subcat || null,
          provider: r.provider,
          cantidad: parseFloat(r.cantidad),
          unit: TYPES[r.type].unit,
          costo: parseFloat(r.costo) || 0,
          origen: "pdf",
        }));
      return { ...state, records: [...newRecs, ...state.records], previewRows: [], uploadQueue: [], selectedProvider: null, uploadStep: 1 };
    }

    // ----- Dashboard
    case "DASH/SET_FILTER":
      return { ...state, dashFilters: { ...state.dashFilters, [action.key]: action.value, ...(action.key === "typeTab" ? { subcat: "all" } : {}) } };
    case "DASH/EDIT_RECORD": {
      const old = state.records.find(r => r.id === action.id);
      return {
        ...state,
        records: state.records.map(r => r.id === action.id ? { ...r, ...action.patch } : r),
        recentlyEdited: action.id,
        _undoSnapshot: { id: action.id, before: old },
      };
    }
    case "DASH/CLEAR_EDIT_HIGHLIGHT":
      return { ...state, recentlyEdited: null };
    case "DASH/UNDO_EDIT": {
      const snap = state._undoSnapshot;
      if (!snap) return state;
      return {
        ...state,
        records: state.records.map(r => r.id === snap.id ? snap.before : r),
        recentlyEdited: snap.id,
        _undoSnapshot: null,
      };
    }

    // ----- Subcategories
    case "SUBCAT/ADD": {
      const sub = { id: action.id, label: action.label, source: "custom" };
      return {
        ...state,
        subcategories: {
          ...state.subcategories,
          [action.type]: [...state.subcategories[action.type], sub],
        },
      };
    }
    case "SUBCAT/REMOVE": {
      return {
        ...state,
        subcategories: {
          ...state.subcategories,
          [action.type]: state.subcategories[action.type].filter(s => s.id !== action.id),
        },
      };
    }

    // ----- Toast
    case "TOAST/SHOW":
      return { ...state, toast: { id: Date.now(), ...action.toast } };
    case "TOAST/HIDE":
      return { ...state, toast: null };

    default:
      return state;
  }
}

// ----- Context provider -----
const StateContext = React.createContext(null);

const StateProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  // auto-hide toast after 4.5s
  React.useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "TOAST/HIDE" }), 4500);
    return () => clearTimeout(t);
  }, [state.toast?.id]);
  // clear edit-highlight after 2.5s
  React.useEffect(() => {
    if (!state.recentlyEdited) return;
    const t = setTimeout(() => dispatch({ type: "DASH/CLEAR_EDIT_HIGHLIGHT" }), 2500);
    return () => clearTimeout(t);
  }, [state.recentlyEdited]);
  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};

const useApp = () => React.useContext(StateContext);

// ----- Derived data helpers -----
function fmtCLP(n) {
  if (n == null || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString("es-CL");
}
function fmtNum(n) {
  if (n == null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("es-CL");
}
function fmtDate(iso) {
  if (!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}
function monthLabelShort(mk) {
  const [y, m] = mk.split("-");
  const names = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return names[parseInt(m, 10) - 1] + " " + y.slice(2);
}
function periodToMonthKeys(period) {
  // return array of month keys (in chronological order) for the period
  if (period === "12m") return months.slice();
  if (period === "6m")  return months.slice(-6);
  if (period === "3m")  return months.slice(-3);
  if (period === "1m")  return months.slice(-1);
  return months.slice();
}
function periodLabel(period) {
  return { "12m": "Últimos 12 meses", "6m": "Últimos 6 meses", "3m": "Últimos 3 meses", "1m": "Mes actual (mar 2026)" }[period] || period;
}
function subcatLabel(type, id) {
  if (!id) return null;
  const list = INITIAL_SUBCATS[type] || [];
  const found = list.find(s => s.id === id);
  return found ? found.label : id;
}

Object.assign(window, {
  StateProvider, StateContext, useApp,
  COMPANY, SUCURSALES, TYPES, INITIAL_SUBCATS, PROVIDERS,
  months, nextId,
  fmtCLP, fmtNum, fmtDate, monthLabelShort,
  periodToMonthKeys, periodLabel, subcatLabel,
});
