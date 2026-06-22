// State + mock data for the Registro de Consumos prototype.
// Pure in-memory — reload resets everything.

// ----- Static catalog -----
const COMPANY = "";
const SUCURSALES = [];

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

// Fuel subcategory catalog — default + available units per combustible tipo
const FUEL_SUBCATS_CATALOG = {
  "diesel":         { label: "Petróleo Diésel", defaultUnit: "L",  units: ["L", "gal"] },
  "kerosene":       { label: "Kerosene",        defaultUnit: "L",  units: ["L", "gal"] },
  "gasolina":       { label: "Gasolina",        defaultUnit: "L",  units: ["L", "gal"] },
  "fuel-oil":       { label: "Fuel Oil",        defaultUnit: "L",  units: ["L", "gal"] },
  "glp":            { label: "GLP",             defaultUnit: "kg", units: ["kg", "L", "m³"] },
  "lena":           { label: "Leña",            defaultUnit: "kg", units: ["kg", "t"] },
  "pellets":        { label: "Pellets",         defaultUnit: "kg", units: ["kg", "t"] },
  "astillas":       { label: "Astillas",        defaultUnit: "kg", units: ["kg", "t"] },
  "carbon-vegetal": { label: "Carbón vegetal",   defaultUnit: "kg", units: ["kg", "t"] },
  "briquetas":      { label: "Briquetas",       defaultUnit: "kg", units: ["kg", "t"] },
  "gas-natural":    { label: "Gas Natural",     defaultUnit: "m³", units: ["m³", "kWh"] },
};

// ----- Sucursales config seed -----
let __sucIdC = 0;
const nextSucId = () => "suc" + (++__sucIdC);
let __itemIdC = 0;
const nextItemId = () => "itm" + (++__itemIdC);

function seedConfigSucursales() {
  return [];
}

// ----- Month window — last 12 months anchored to today (inclusive)
const monthKey = (y, m) => `${y}-${String(m).padStart(2,"0")}`;
const months = [];
{
  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth() + 1; // 1-12
  for (let i = 11; i >= 0; i--) {
    let yy = y;
    let mm = m - i;
    while (mm <= 0) { mm += 12; yy -= 1; }
    months.push(monthKey(yy, mm));
  }
}
// Current and previous month keys (used by dashboard KPIs)
const CURRENT_MONTH_KEY = months[months.length - 1];
const PREV_MONTH_KEY    = months[months.length - 2] || CURRENT_MONTH_KEY;

let __idCounter = 1;
const nextId = () => "r" + (__idCounter++);
let __entryIdC = 0;
const nextEntryId = () => "ent" + (++__entryIdC);

// ----- Initial state -----
const initialState = {
  // routing
  view: "landing",            // landing | manual | upload | preview | dashboard | subcat | onboarding | config | config-edit | matrix | register
  manualStep: "form",         // form | preview | success
  uploadStep: 1,              // 1 | 2 | 3 | 4 (preview)
  // domain — empty by default; populated from Google Sheets on login + refresh
  records: [],
  recordsLoading: false,
  recordsLastFetch: null,
  subcategories: INITIAL_SUBCATS,
  // config (sucursales setup, populated by onboarding or seeded)
  configSucursales: seedConfigSucursales(),
  configEditId: null,         // id of sucursal being edited
  // matrix view (upload status grid)
  matrixMonth: CURRENT_MONTH_KEY,
  // form drafts (manual)
  manualDraft: emptyDraft(),
  manualErrors: {},
  // upload state
  selectedProvider: null,
  uploadQueue: [],            // { id, name, size, type, status, progress, extractedCount, error }
  previewRows: [],            // rows after extraction or manual draft
  // dashboard
  dashFilters: { sucursal: "all", period: "12m", typeTab: "combustible", subcat: "all", estado: "activa" },
  recentlyEdited: null,       // id of just-saved row
  // ui
  toast: null,                // { id, kind, title, body, undoAction }
};

function emptyEntry() {
  return {
    id: nextEntryId(),
    type: "",
    subcat: "",
    provider: "",
    cantidad: "",
    costo: "",
    notes: "",
    factura: "",
  };
}

function emptyDraft() {
  const today = new Date();
  const iso = today.getFullYear() + "-" +
              String(today.getMonth() + 1).padStart(2, "0") + "-" +
              String(today.getDate()).padStart(2, "0");
  return {
    date: iso,
    sucursal: "",
    entries: [emptyEntry()],
  };
}

// ----- Reducer -----
function reducer(state, action) {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, view: action.view, manualStep: action.manualStep || state.manualStep, uploadStep: action.uploadStep || state.uploadStep };

    // ----- Manual draft
    case "MANUAL/SET_SHARED_FIELD": {
      const draft = { ...state.manualDraft, [action.field]: action.value };
      const errors = { ...state.manualErrors };
      delete errors[action.field];
      return { ...state, manualDraft: draft, manualErrors: errors };
    }
    case "MANUAL/SET_ENTRY_FIELD": {
      const entries = state.manualDraft.entries.map(e => {
        if (e.id !== action.entryId) return e;
        const next = { ...e, [action.field]: action.value };
        if (action.field === "type") next.subcat = "";
        // Auto-fill provider from sucursal config when type/subcat change, only if empty
        if ((action.field === "type" || action.field === "subcat") && !next.provider) {
          const auto = getConfiguredProvider(state, state.manualDraft.sucursal, next.type, next.subcat);
          if (auto) next.provider = auto;
        }
        return next;
      });
      // Clear per-entry error for that field
      const entryErrors = { ...(state.manualErrors.entries || {}) };
      if (entryErrors[action.entryId]) {
        entryErrors[action.entryId] = { ...entryErrors[action.entryId] };
        delete entryErrors[action.entryId][action.field];
      }
      return {
        ...state,
        manualDraft: { ...state.manualDraft, entries },
        manualErrors: { ...state.manualErrors, entries: entryErrors },
      };
    }
    case "MANUAL/ADD_ENTRY":
      return { ...state, manualDraft: { ...state.manualDraft, entries: [...state.manualDraft.entries, emptyEntry()] } };
    case "MANUAL/REMOVE_ENTRY": {
      const entries = state.manualDraft.entries.filter(e => e.id !== action.entryId);
      const safe = entries.length ? entries : [emptyEntry()];
      const entryErrors = { ...(state.manualErrors.entries || {}) };
      delete entryErrors[action.entryId];
      try {
        if (window.__rcManualFacturas) delete window.__rcManualFacturas[action.entryId];
      } catch(e) {}
      return {
        ...state,
        manualDraft: { ...state.manualDraft, entries: safe },
        manualErrors: { ...state.manualErrors, entries: entryErrors },
      };
    }
    case "MANUAL/SET_ERRORS":
      return { ...state, manualErrors: action.errors };
    case "MANUAL/RESET":
      try { window.__rcManualFacturas = {}; } catch(e) {}
      return { ...state, manualDraft: emptyDraft(), manualErrors: {}, manualStep: "form" };
    case "MANUAL/GO_PREVIEW":
      return { ...state, manualStep: "preview" };
    case "MANUAL/GO_FORM":
      return { ...state, manualStep: "form" };
    case "MANUAL/CONFIRM": {
      const d = state.manualDraft;
      const facturas = (typeof window !== "undefined") ? (window.__rcManualFacturas || {}) : {};
      const newRecs = d.entries.map(e => ({
        id: nextId(),
        date: d.date,
        sucursal: d.sucursal,
        type: e.type,
        subcat: e.subcat || null,
        provider: e.provider || "—",
        cantidad: parseFloat(e.cantidad),
        unit: TYPES[e.type].unit,
        costo: parseFloat(e.costo) || 0,
        origen: "manual",
        estado: "activa",
        factura: e.factura || null,
        _entryId: e.id,
      }));
      const facturasList = newRecs
        .map(r => facturas[r._entryId] ? { recordId: r.id, file: facturas[r._entryId].file, name: facturas[r._entryId].name } : null)
        .filter(Boolean);
      // strip _entryId before storing
      const cleanRecs = newRecs.map(({ _entryId, ...r }) => r);
      try { window.dispatchEvent(new CustomEvent("rc:confirm", { detail: { source: "manual", records: cleanRecs, facturas: facturasList } })); } catch(e) {}
      try { window.__rcManualFacturas = {}; } catch(e) {}
      return { ...state, records: [...cleanRecs, ...state.records], manualStep: "success", manualDraft: emptyDraft() };
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
          estado: "activa",
          // surface document filename for the detail-table "Documento" column
          factura: r.sourceFile || null,
          // metadata for Sheets/Drive sync layer
          sourceFile: r.sourceFile || null,
          numeroCliente: r.numeroCliente || "",
        }));
      try { window.dispatchEvent(new CustomEvent("rc:confirm", { detail: { source: "upload", provider: state.selectedProvider, records: newRecs, files: state.uploadQueue } })); } catch(e) {}
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
    case "DASH/DELETE_RECORD":
      return {
        ...state,
        records: state.records.map(r => r.id === action.id ? { ...r, estado: "eliminada" } : r),
      };
    case "DASH/RESTORE_RECORD":
      return {
        ...state,
        records: state.records.map(r => r.id === action.id ? { ...r, estado: "activa" } : r),
      };
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

    // ----- Records (loaded from Google Sheets)
    case "RECORDS/REPLACE":
      return { ...state, records: action.records || [], recordsLastFetch: Date.now(), recordsLoading: false };
    case "RECORDS/LOADING":
      return { ...state, recordsLoading: !!action.loading };

    // ----- Config (sucursales)
    case "CONFIG/LOAD": {
      const _defaultItems = {
        electricidad:  { activo: false, subcats: [] },
        combustible:   { activo: false, subcats: [] },
        agua:          { activo: false, subcats: [] },
        refrigerantes: { activo: false, subcats: [] },
      };
      const _norm = (s) => ({
        ...s,
        items: s.items ? {
          electricidad:  { ..._defaultItems.electricidad,  ...s.items.electricidad  },
          combustible:   { ..._defaultItems.combustible,   ...s.items.combustible   },
          agua:          { ..._defaultItems.agua,           ...s.items.agua          },
          refrigerantes: { ..._defaultItems.refrigerantes, ...s.items.refrigerantes },
        } : _defaultItems,
      });
      // Keep any new sucursales added this session that aren't in the loaded data
      const _loadedIds = new Set(action.configSucursales.map(s => s.id));
      const _newEntries = state.configSucursales.filter(s => !_loadedIds.has(s.id));
      return {
        ...state,
        configSucursales: [...action.configSucursales.map(_norm), ..._newEntries],
      };
    }
    case "CONFIG/EDIT_SUC":
      return { ...state, view: "config-edit", configEditId: action.id };
    case "CONFIG/TOGGLE_ACTIVE":
      return {
        ...state,
        configSucursales: state.configSucursales.map(s =>
          s.id === action.id ? { ...s, activa: !s.activa } : s
        ),
      };
    case "CONFIG/DELETE_SUC":
      return {
        ...state,
        configSucursales: state.configSucursales.filter(s => s.id !== action.id),
      };
    case "CONFIG/SAVE_SUC":
      return {
        ...state,
        configSucursales: state.configSucursales.map(s =>
          s.id === action.suc.id ? action.suc : s
        ),
        view: "config",
        configEditId: null,
      };
    case "CONFIG/ADD_SUC": {
      const newSuc = {
        id: nextSucId(),
        nombre: "Nueva sucursal",
        direccion: "",
        activa: true,
        items: {
          electricidad: { activo: false, subcats: [] },
          combustible: { activo: false, subcats: [] },
          agua: { activo: false, subcats: [] },
          refrigerantes: { activo: false, subcats: [] },
        },
      };
      return {
        ...state,
        configSucursales: [...state.configSucursales, newSuc],
        view: "config-edit",
        configEditId: newSuc.id,
      };
    }
    case "CONFIG/RENAME_HISTORY":
      return {
        ...state,
        records: state.records.map(r =>
          r.sucursal === action.oldName ? { ...r, sucursal: action.newName } : r
        ),
      };
    case "CONFIG/CREATE_PROJECT": {
      // Persist onboarding output into configSucursales (replaces existing list)
      const newSucs = action.sucursales.map(s => ({
        id: s.id,
        nombre: s.nombre.trim(),
        direccion: s.direccion || "",
        activa: true,
        items: action.items[s.id] || {
          electricidad: { activo: false, subcats: [] },
          combustible: { activo: false, subcats: [] },
          agua: { activo: false, subcats: [] },
          refrigerantes: { activo: false, subcats: [] },
        },
      }));
      return { ...state, configSucursales: newSucs };
    }

    // ----- Matrix view
    case "MATRIX/SET_MONTH":
      return { ...state, matrixMonth: action.month };

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
  const [yc, mc] = CURRENT_MONTH_KEY.split("-");
  const names = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const curLabel = names[parseInt(mc, 10) - 1] + " " + yc;
  return {
    "12m": "Últimos 12 meses",
    "6m":  "Últimos 6 meses",
    "3m":  "Últimos 3 meses",
    "1m":  "Mes actual (" + curLabel + ")",
  }[period] || period;
}
// Names of active sucursales from current config — replaces the old static SUCURSALES list
function activeSucNames(state) {
  return (state?.configSucursales || []).filter(s => s.activa).map(s => s.nombre);
}

// Map an agua subcat (from configSucursales) to a stable record-level id + label.
// Predefined tipos use their value as id (e.g. "potable"); custom ones use "otro:<slug>".
function aguaSubcatFromConfig(sc) {
  if (!sc?.tipo) return null;
  if (sc.tipo === "__otro") {
    const name = (sc.tipoCustom || "").trim();
    if (!name) return null;
    return { id: "otro:" + name.toLowerCase().replace(/\s+/g, "-"), label: name, source: "config" };
  }
  const labels = { potable: "Potable", gris: "Gris", industrial: "Industrial" };
  return { id: sc.tipo, label: labels[sc.tipo] || sc.tipo, source: "config" };
}

// Subcategoría options for a given consumption type.
// For "agua", derive from configured tipos in configSucursales (deduped). Falls back
// to INITIAL_SUBCATS for other types.
function getSubcatsFor(state, type) {
  if (type === "agua") {
    const seen = new Map();
    (state?.configSucursales || []).forEach(s => {
      if (!s.activa || !s.items?.agua?.activo) return;
      s.items.agua.subcats.forEach(sc => {
        const opt = aguaSubcatFromConfig(sc);
        if (opt && !seen.has(opt.id)) seen.set(opt.id, opt);
      });
    });
    return [...seen.values()];
  }
  return state?.subcategories?.[type] || INITIAL_SUBCATS[type] || [];
}

// Resolve a configured provider name from a sucursal subcat. Returns the proveedorCustom
// when proveedor === "__otro", or the plain proveedor name. Empty string if not set.
function _resolveProviderName(sc) {
  if (!sc) return "";
  if (sc.proveedor === "__otro") return (sc.proveedorCustom || "").trim();
  return sc.proveedor || "";
}

// Lookup a default provider for (sucursal, type, subcatId) from configSucursales.
// - For agua/combustible: match the subcat whose tipo derives to subcatId.
// - For electricidad/refrigerantes: subcatId is ignored; use the first subcat with a provider.
// Returns "" if no configured provider found.
function getConfiguredProvider(state, sucursalName, type, subcatId) {
  if (!sucursalName || !type) return "";
  const suc = (state?.configSucursales || []).find(s => s.activa && s.nombre === sucursalName);
  if (!suc || !suc.items?.[type]?.activo) return "";
  const subcats = suc.items[type].subcats || [];
  if (type === "agua" && subcatId) {
    const match = subcats.find(sc => {
      const opt = aguaSubcatFromConfig(sc);
      return opt && opt.id === subcatId;
    });
    if (match) return _resolveProviderName(match);
  }
  if (type === "combustible" && subcatId) {
    const match = subcats.find(sc => sc.tipo === subcatId);
    if (match) return _resolveProviderName(match);
  }
  // Fallback: first subcat with a provider
  for (const sc of subcats) {
    const p = _resolveProviderName(sc);
    if (p) return p;
  }
  return "";
}

// Provider <Select> options for (sucursal, type): configured providers from the sucursal
// (resolved to their display names) merged with the static PROVIDERS catalog. Deduped.
function getProviderOptionsFor(state, sucursalName, type) {
  if (!type) return [];
  const out = [];
  const seen = new Set();
  const push = (name) => {
    const v = (name || "").trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
    out.push(v);
  };
  const suc = (state?.configSucursales || []).find(s => s.activa && s.nombre === sucursalName);
  if (suc && suc.items?.[type]?.activo) {
    suc.items[type].subcats.forEach(sc => push(_resolveProviderName(sc)));
  }
  (PROVIDERS[type] || []).forEach(push);
  return out;
}

// Normaliza un número de cliente para comparar. Quita puntos/espacios y el
// dígito verificador final ("12.345.678-9" → "12345678"), así matchea aunque
// la factura lo traiga y la config no (o viceversa).
function normNumCliente(s) {
  let t = String(s || "").trim().toLowerCase().replace(/[\s.]/g, "");
  t = t.replace(/-[0-9k]$/, "");        // dígito verificador estilo RUT
  return t.replace(/[^a-z0-9]/g, "");
}

// Busca en la config qué sucursal/subcat/proveedor corresponde a un número de
// cliente extraído de una factura. `type` (opcional) acota la búsqueda al tipo.
// Devuelve { sucursal, type, subcat, provider } o null si no hay match.
function resolveByNumCliente(state, numeroCliente, type) {
  const target = normNumCliente(numeroCliente);
  if (!target) return null;
  const types = type ? [type] : ["electricidad", "combustible", "agua", "refrigerantes"];
  for (const suc of (state?.configSucursales || [])) {
    if (!suc.activa) continue;
    for (const t of types) {
      const item = suc.items?.[t];
      if (!item || !item.activo) continue;
      for (const sc of (item.subcats || [])) {
        if (normNumCliente(sc.numCliente) !== target) continue;
        let subcat = null;
        if (t === "agua") { const opt = aguaSubcatFromConfig(sc); subcat = opt ? opt.id : null; }
        else if (t === "combustible" || t === "refrigerantes") subcat = sc.tipo || null;
        return { sucursal: suc.nombre, type: t, subcat, provider: _resolveProviderName(sc) };
      }
    }
  }
  return null;
}

function subcatLabel(type, id) {
  if (!id) return null;
  // Custom agua tipo: "otro:slug" — rebuild label from slug
  if (type === "agua" && id.startsWith("otro:")) {
    return id.slice(5).split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  if (type === "agua") {
    return ({ potable: "Potable", gris: "Gris", industrial: "Industrial" })[id] || id;
  }
  const list = INITIAL_SUBCATS[type] || [];
  const found = list.find(s => s.id === id);
  return found ? found.label : id;
}

Object.assign(window, {
  StateProvider, StateContext, useApp,
  COMPANY, SUCURSALES, TYPES, INITIAL_SUBCATS, PROVIDERS, FUEL_SUBCATS_CATALOG,
  months, nextId,
  CURRENT_MONTH_KEY, PREV_MONTH_KEY,
  fmtCLP, fmtNum, fmtDate, monthLabelShort,
  periodToMonthKeys, periodLabel, subcatLabel, activeSucNames, getSubcatsFor,
  getConfiguredProvider, getProviderOptionsFor,
  normNumCliente, resolveByNumCliente,
});
