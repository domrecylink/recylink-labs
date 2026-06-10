// sync.jsx — Google OAuth gate + Sheets/Drive integration layer.
// Sits on top of the design's state machine without modifying any UI logic:
// listens to "rc:confirm" CustomEvents emitted from the reducer and writes
// to Google Sheets / Drive accordingly.

const RC_CONFIG = {
  GOOGLE_CLIENT_ID: "977748736490-1vohhn2cqvhv73gl6ked7h5m2p2kt59f.apps.googleusercontent.com",
  SCOPES: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",

  SPREADSHEET_ID: "1e6v7yPP05w05OIfsHRyyU3cfXXDPhVzg43TL_HvXihU",
  SPREADSHEET_URL:
    "https://docs.google.com/spreadsheets/d/1e6v7yPP05w05OIfsHRyyU3cfXXDPhVzg43TL_HvXihU",

  SHEETS: {
    COMBUSTIBLE: "Combustible",
    ELECTRICIDAD: "Electricidad",
    AGUA: "Agua",
    FILL_OUT: "Fill out",
    CLIENTES: "N° de cliente",
  },

  FOLDERS: {
    ENEL_POR_PROCESAR:  "1led0ePxm2yEuJSPWVuV-aPik-28hlbG7",
    ENEL_PROCESADOS:    "1AI2biUrUAZFHV9dYubNm2xGKh1gmzpus",
    AGUAS_POR_PROCESAR: "1IHvHFeB-OWSIIfyxaUh3YvpoBnmGMXz9",
    AGUAS_PROCESADOS:   "1rp-qUzPUYu9dX24YZmCeNR7CXgwSzY8p",
  },

  EMPRESA: "Euro",
};

// ----- token storage (memory-only) ----------------------------------------
const __rcAuth = {
  token: null,
  user: null,
  tokenClient: null,
  ready: false,
  listeners: new Set(),
};

function rcOn(fn) { __rcAuth.listeners.add(fn); return () => __rcAuth.listeners.delete(fn); }
function rcEmit() { __rcAuth.listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

function rcInitAuth() {
  if (!window.google || !google.accounts) return false;
  __rcAuth.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: RC_CONFIG.GOOGLE_CLIENT_ID,
    scope: RC_CONFIG.SCOPES,
    callback: (resp) => {
      if (resp.error) { console.error("OAuth error", resp); rcEmit(); return; }
      __rcAuth.token = resp.access_token;
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: "Bearer " + resp.access_token },
      })
        .then((r) => r.json())
        .then((u) => { __rcAuth.user = u; rcEmit(); })
        .catch(() => { __rcAuth.user = { name: "Usuario" }; rcEmit(); });
      // Ensure all required sheets exist, then load any existing data.
      (async () => {
        await rcInitSheets();
        if (typeof rcRefreshDashboard === "function") rcRefreshDashboard();
      })();
    },
  });
  __rcAuth.ready = true;
  rcEmit();
  return true;
}

function rcLogin() {
  if (!__rcAuth.tokenClient && !rcInitAuth()) {
    setTimeout(rcLogin, 300); return;
  }
  __rcAuth.tokenClient.requestAccessToken({ prompt: "consent" });
}
function rcLogout() {
  if (__rcAuth.token) try { google.accounts.oauth2.revoke(__rcAuth.token, () => {}); } catch (e) {}
  __rcAuth.token = null;
  __rcAuth.user = null;
  rcEmit();
}

// ----- API helpers --------------------------------------------------------
async function rcGapi(url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: {
      Authorization: "Bearer " + __rcAuth.token,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error("HTTP " + r.status + ": " + text);
  }
  return r.json();
}
// Cache of sheet titles present in the spreadsheet
let __rcSheetTitles = null;
async function rcLoadSheetTitles(force) {
  if (__rcSheetTitles && !force) return __rcSheetTitles;
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    RC_CONFIG.SPREADSHEET_ID +
    "?fields=sheets.properties(title)";
  const r = await rcGapi(url);
  __rcSheetTitles = (r.sheets || []).map((s) => s.properties.title);
  console.log("[rc-sync] sheets present", __rcSheetTitles);
  return __rcSheetTitles;
}
async function rcCreateSheet(title, headers) {
  console.log("[rc-sync] creating missing sheet:", title);
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    RC_CONFIG.SPREADSHEET_ID + ":batchUpdate";
  await rcGapi(url, {
    method: "POST",
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title } } }],
    }),
  });
  __rcSheetTitles = null; // invalidate cache
  if (headers && headers.length) {
    // Write headers as the first row
    const range = encodeURIComponent(title + "!A1");
    const hurl =
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      RC_CONFIG.SPREADSHEET_ID +
      "/values/" + range +
      "?valueInputOption=USER_ENTERED";
    await rcGapi(hurl, { method: "PUT", body: JSON.stringify({ values: [headers] }) });
  }
}

// Default column headers per destination sheet (matches what we append)
const RC_HEADERS = {
  Combustible:    ["Link", "Fecha", "Consumo", "Costo", "Empresa", "Sucursal", "Tipo", "Proveedor"],
  Electricidad:   ["Link PDF", "Número de cliente", "Fecha", "Consumo total", "Costo ($)", "Empresa", "Sucursal", "Tipo de consumo", "Proveedor"],
  Agua:           ["Link PDF", "Número de cliente", "Fecha emisión", "Consumo total", "Costo ($)", "Empresa", "Sucursal", "Tipo de consumo", "Proveedor"],
  "N° de cliente":["Número de cliente", "Empresa", "Sucursal", "Tipo de consumo", "Proveedor"],
  "Fill out":     ["Submission ID", "Submission time", "Nombre Usuario", "Nombre sucursal", "Mes de registro", "N° trabajadores", "N° trabajadoras", "m2 totales", "% Avance", "URL Excel Petróleo", "URL Excel Gas", "Procesado"],
};

// Bootstrap: ensure every required sheet exists. Called once after login.
async function rcInitSheets() {
  if (!__rcAuth.token) return;
  try {
    const required = Object.keys(RC_HEADERS);
    const titles = await rcLoadSheetTitles(true);
    const missing = required.filter((s) => !titles.includes(s));
    if (missing.length === 0) {
      console.log("[rc-sync] all required sheets already exist");
      return;
    }
    console.log("[rc-sync] missing sheets, creating:", missing);
    // batch addSheet
    const url =
      "https://sheets.googleapis.com/v4/spreadsheets/" +
      RC_CONFIG.SPREADSHEET_ID + ":batchUpdate";
    await rcGapi(url, {
      method: "POST",
      body: JSON.stringify({
        requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
      }),
    });
    // Write headers in parallel
    await Promise.all(missing.map((title) => {
      const headers = RC_HEADERS[title];
      if (!headers || !headers.length) return null;
      const range = encodeURIComponent(title + "!A1");
      const hurl =
        "https://sheets.googleapis.com/v4/spreadsheets/" +
        RC_CONFIG.SPREADSHEET_ID +
        "/values/" + range +
        "?valueInputOption=USER_ENTERED";
      return rcGapi(hurl, { method: "PUT", body: JSON.stringify({ values: [headers] }) });
    }));
    __rcSheetTitles = null;
    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: true, written: 0, msg: "Hojas creadas: " + missing.join(", ") },
    }));
  } catch (e) {
    console.error("[rc-sync] init failed", e);
    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: false, msg: "No se pudieron crear hojas: " + e.message },
    }));
  }
}
window.rcInitSheets = rcInitSheets;

// ----- Read all records back from the 3 sheets ---------------------------
function rcParseDate(s) {
  if (s == null || s === "") return "";
  const str = String(s).trim();
  let m;
  // ISO YYYY-MM-DD
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // dd/mm/yyyy or d/m/yyyy
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  // dd-mm-yyyy
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  // yyyy/mm/dd
  m = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
  // Excel serial number (days since 1899-12-30)
  if (/^\d+(\.\d+)?$/.test(str)) {
    const n = parseFloat(str);
    if (n > 25569 && n < 80000) {
      const ms = (n - 25569) * 86400000;
      const d = new Date(ms);
      return d.getUTCFullYear() + "-" +
        String(d.getUTCMonth() + 1).padStart(2, "0") + "-" +
        String(d.getUTCDate()).padStart(2, "0");
    }
  }
  // Last-resort: let Date() try
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  return str;
}
function rcCombSubcat(tipo) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("petr")) return "diesel";
  if (t.includes("kerosene")) return "kerosene";
  if (t.includes("gas natural")) return "gas-natural";
  if (t.includes("gas") || t.includes("glp")) return "glp";
  return null;
}
function rcNum(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  // strip thousand separators (.) and currency
  const s = String(v).replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

async function rcReadAllRecords() {
  if (!__rcAuth.token) return [];
  const ranges = [
    RC_CONFIG.SHEETS.COMBUSTIBLE,
    RC_CONFIG.SHEETS.ELECTRICIDAD,
    RC_CONFIG.SHEETS.AGUA,
  ];
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    RC_CONFIG.SPREADSHEET_ID +
    "/values:batchGet?" +
    ranges.map((r) => "ranges=" + encodeURIComponent(r)).join("&");
  const resp = await rcGapi(url);
  const records = [];
  const [comb, elec, agua] = resp.valueRanges || [];

  ((comb && comb.values) || []).slice(1).forEach((row, i) => {
    const [link, fecha, consumo, costo, , sucursal, tipo, proveedor] = row;
    if (!fecha && !consumo) return;
    const subcat = rcCombSubcat(tipo);
    records.push({
      id: "comb-" + i,
      date: rcParseDate(fecha),
      sucursal: sucursal || "",
      type: "combustible",
      subcat,
      provider: proveedor || "",
      cantidad: rcNum(consumo),
      unit: (subcat === "glp" || subcat === "gas-natural") ? "kg" : "L",
      costo: rcNum(costo),
      origen: "sheets",
      _driveLink: link || "",
    });
  });

  ((elec && elec.values) || []).slice(1).forEach((row, i) => {
    const [link, numCli, fecha, consumo, costo, , sucursal, , proveedor] = row;
    if (!fecha && !consumo) return;
    records.push({
      id: "elec-" + i,
      date: rcParseDate(fecha),
      sucursal: sucursal || "",
      type: "electricidad",
      subcat: null,
      provider: proveedor || "",
      cantidad: rcNum(consumo),
      unit: "kWh",
      costo: rcNum(costo),
      origen: "sheets",
      numeroCliente: numCli || "",
      _driveLink: link || "",
    });
  });

  ((agua && agua.values) || []).slice(1).forEach((row, i) => {
    const [link, numCli, fecha, consumo, costo, , sucursal, , proveedor] = row;
    if (!fecha && !consumo) return;
    records.push({
      id: "agua-" + i,
      date: rcParseDate(fecha),
      sucursal: sucursal || "",
      type: "agua",
      subcat: null,
      provider: proveedor || "",
      cantidad: rcNum(consumo),
      unit: "m³",
      costo: rcNum(costo),
      origen: "sheets",
      numeroCliente: numCli || "",
      _driveLink: link || "",
    });
  });

  return records;
}

async function rcRefreshDashboard() {
  const { dispatch } = window.__rcStoreRef || {};
  if (!__rcAuth.token) return;
  if (dispatch) dispatch({ type: "RECORDS/LOADING", loading: true });
  window.dispatchEvent(new CustomEvent("rc:refresh-start"));
  try {
    const records = await rcReadAllRecords();
    console.log("[rc-sync] refresh: loaded", records.length, "records");
    if (dispatch) dispatch({ type: "RECORDS/REPLACE", records });
    window.dispatchEvent(new CustomEvent("rc:refresh-done", { detail: { ok: true, count: records.length } }));
  } catch (e) {
    console.error("[rc-sync] refresh failed", e);
    if (dispatch) dispatch({ type: "RECORDS/LOADING", loading: false });
    window.dispatchEvent(new CustomEvent("rc:refresh-done", { detail: { ok: false, msg: e.message } }));
  }
}
window.rcRefreshDashboard = rcRefreshDashboard;
window.rcReadAllRecords = rcReadAllRecords;

async function rcEnsureSheet(sheetName) {
  const titles = await rcLoadSheetTitles();
  if (titles.includes(sheetName)) return;
  await rcCreateSheet(sheetName, RC_HEADERS[sheetName]);
}

async function rcAppend(sheetName, values) {
  await rcEnsureSheet(sheetName);
  const range = encodeURIComponent(sheetName + "!A1");
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    RC_CONFIG.SPREADSHEET_ID +
    "/values/" +
    range +
    ":append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS";
  return rcGapi(url, { method: "POST", body: JSON.stringify({ values }) });
}
async function rcMoveFile(fileId, fromFolderId, toFolderId) {
  const url =
    "https://www.googleapis.com/drive/v3/files/" +
    fileId +
    "?addParents=" + toFolderId +
    "&removeParents=" + fromFolderId +
    "&fields=id,parents";
  return rcGapi(url, { method: "PATCH" });
}
async function rcUpload(file, folderId) {
  const metadata = { name: file.name, parents: [folderId] };
  const boundary = "-------" + Date.now();
  const delim = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";
  const buf = await file.arrayBuffer();
  // Encode safely for large files
  let b64 = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    b64 += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  b64 = btoa(b64);
  const body =
    delim +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delim +
    "Content-Type: " + (file.type || "application/octet-stream") + "\r\n" +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    b64 +
    closeDelim;
  const r = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + __rcAuth.token,
        "Content-Type": 'multipart/related; boundary="' + boundary + '"',
      },
      body,
    }
  );
  if (!r.ok) throw new Error("Upload failed: " + r.status);
  return r.json();
}

// ----- row-mapping per sheet ----------------------------------------------
// Each design "record" is mapped to the destination sheet's columns,
// keeping the same column order as the original scripts.
function fmtDateForSheet(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d + "/" + m + "/" + y;
}
function endOfMonth(iso) {
  if (!iso) return "";
  const [y, m] = iso.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return String(last).padStart(2, "0") + "/" + String(m).padStart(2, "0") + "/" + y;
}
function rowsByType(records) {
  const byType = { combustible: [], electricidad: [], agua: [] };
  for (const r of records) {
    if (r.type === "combustible") {
      byType.combustible.push([
        r._driveLink || "",
        endOfMonth(r.date),
        r.cantidad,
        r.costo,
        RC_CONFIG.EMPRESA,
        r.sucursal,
        r.subcat ? subcatLabel(r.type, r.subcat) : "Petróleo Diesel",
        r.provider || "",
      ]);
    } else if (r.type === "electricidad") {
      byType.electricidad.push([
        r._driveLink || "",
        r.numeroCliente || "",
        r.date,
        r.cantidad,
        r.costo,
        RC_CONFIG.EMPRESA,
        r.sucursal,
        "⚡Energía kWh",
        r.provider || "Enel",
      ]);
    } else if (r.type === "agua") {
      byType.agua.push([
        r._driveLink || "",
        r.numeroCliente || "",
        r.date,
        r.cantidad,
        r.costo,
        RC_CONFIG.EMPRESA,
        r.sucursal,
        "💧Agua m3",
        r.provider || "Aguas Andinas",
      ]);
    }
  }
  return byType;
}

// ----- handle confirm events --------------------------------------------
async function rcHandleConfirm(ev) {
  const detail = ev.detail || {};
  const { source, provider, records, files } = detail;
  console.log("[rc-sync] rc:confirm received", detail);
  if (!__rcAuth.token) {
    console.warn("[rc-sync] no token, aborting write");
    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: false, msg: "Sin sesión de Google. Inicia sesión para escribir en Sheets." },
    }));
    return;
  }
  try {
    // 1) Upload each unique File to the matching Drive folder
    //    key = file.name → { driveId, link, folderOrigen, folderDestino }
    const uploads = {};
    if (source === "upload" && files && files.length) {
      const providerName = (provider && provider.name) || "";
      const isEnel  = /Enel/i.test(providerName);
      const isAguas = /Aguas/i.test(providerName);
      const folderOrigen = isEnel ? RC_CONFIG.FOLDERS.ENEL_POR_PROCESAR
                        : isAguas ? RC_CONFIG.FOLDERS.AGUAS_POR_PROCESAR
                        : null;
      const folderDestino = isEnel ? RC_CONFIG.FOLDERS.ENEL_PROCESADOS
                         : isAguas ? RC_CONFIG.FOLDERS.AGUAS_PROCESADOS
                         : null;
      if (folderOrigen) {
        for (const f of files) {
          if (!f.file) continue;
          if (uploads[f.name]) continue; // dedupe
          try {
            console.log("[rc-sync] uploading to Drive:", f.name);
            const up = await rcUpload(f.file, folderOrigen);
            uploads[f.name] = { id: up.id, link: up.webViewLink, folderOrigen, folderDestino };
            console.log("[rc-sync] uploaded:", up);
          } catch (e) { console.warn("[rc-sync] upload failed", f.name, e); }
        }
      }
    }

    // 2) Attach Drive link to records that share the same sourceFile
    if (Object.keys(uploads).length && records) {
      records.forEach((r) => {
        if (r.sourceFile && uploads[r.sourceFile]) {
          r._driveLink = uploads[r.sourceFile].link;
        }
      });
    }

    // 3) Append to the appropriate sheets
    const byType = rowsByType(records);
    console.log("[rc-sync] rows ready to write", byType);
    let written = 0;
    if (byType.combustible.length) {
      console.log("[rc-sync] appending to Combustible", byType.combustible);
      const res = await rcAppend(RC_CONFIG.SHEETS.COMBUSTIBLE, byType.combustible);
      console.log("[rc-sync] Combustible response", res);
      written += byType.combustible.length;
    }
    if (byType.electricidad.length) {
      console.log("[rc-sync] appending to Electricidad", byType.electricidad);
      const res = await rcAppend(RC_CONFIG.SHEETS.ELECTRICIDAD, byType.electricidad);
      console.log("[rc-sync] Electricidad response", res);
      written += byType.electricidad.length;
    }
    if (byType.agua.length) {
      console.log("[rc-sync] appending to Agua", byType.agua);
      const res = await rcAppend(RC_CONFIG.SHEETS.AGUA, byType.agua);
      console.log("[rc-sync] Agua response", res);
      written += byType.agua.length;
    }

    // 4) Move PDFs to "Procesados"
    for (const u of Object.values(uploads)) {
      if (u.folderOrigen && u.folderDestino) {
        try {
          await rcMoveFile(u.id, u.folderOrigen, u.folderDestino);
          console.log("[rc-sync] moved file to Procesados:", u.id);
        } catch (e) { console.warn("[rc-sync] move failed", e); }
      }
    }

    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: true, written, source },
    }));
    // After a successful write, pull the dashboard back from Sheets so the
    // charts/tables reflect the new rows we just appended.
    if (written > 0 && typeof rcRefreshDashboard === "function") rcRefreshDashboard();
  } catch (e) {
    console.error("Sheets sync failed", e);
    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: false, msg: e.message },
    }));
  }
}
window.addEventListener("rc:confirm", rcHandleConfirm);

// ----- React: AuthGate + UserChip + status toast --------------------------
const AuthGate = ({ children }) => {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    // wait for google script
    let t = setInterval(() => { if (rcInitAuth()) clearInterval(t); }, 250);
    const off = rcOn(force);
    return () => { clearInterval(t); off(); };
  }, []);
  React.useEffect(() => {
    function onSyncDone(ev) {
      const { state, dispatch } = window.__rcStoreRef || {};
      if (!dispatch) return;
      const d = ev.detail || {};
      if (d.ok) {
        dispatch({
          type: "TOAST/SHOW",
          toast: {
            kind: "success",
            title: "Sincronizado con Google Sheets",
            body: d.written + " fila" + (d.written !== 1 ? "s" : "") + " escrita" + (d.written !== 1 ? "s" : "") + " en el spreadsheet sandbox.",
          },
        });
      } else {
        dispatch({
          type: "TOAST/SHOW",
          toast: { kind: "error", title: "No se pudo sincronizar", body: d.msg || "Error desconocido" },
        });
      }
    }
    window.addEventListener("rc:sync-done", onSyncDone);
    return () => window.removeEventListener("rc:sync-done", onSyncDone);
  }, []);

  if (!__rcAuth.token) {
    return (
      <div className="rc-auth-overlay">
        <div className="rc-auth-card">
          <div className="rc-auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </div>
          <div className="prt-eyebrow">Registro de consumos</div>
          <h1 style={{ marginTop: 4 }}>Inicia sesión con Google</h1>
          <p className="prt-muted" style={{ marginTop: 8, maxWidth: 340 }}>
            La aplicación necesita acceso a Google Sheets y Google Drive para escribir los registros en el spreadsheet sandbox.
          </p>
          <button className="prt-btn primary lg" style={{ marginTop: 18, width: "100%" }} onClick={rcLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Continuar con Google
          </button>
          <div className="prt-hint" style={{ marginTop: 14, fontSize: 11 }}>
            Sandbox · solo desktop · scopes: spreadsheets, drive
          </div>
        </div>
      </div>
    );
  }
  return children;
};

const UserChip = () => {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => rcOn(force), []);
  if (!__rcAuth.user) return null;
  const u = __rcAuth.user;
  return (
    <div className="rc-userchip" title={u.email || ""}>
      {u.picture
        ? <img src={u.picture} alt="" />
        : <div className="rc-userchip-avatar">{(u.name || "?")[0]}</div>}
      <span className="rc-userchip-name">{u.name || u.email}</span>
      <button className="rc-userchip-logout" onClick={rcLogout} title="Cerrar sesión">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
      <a className="rc-sheet-link" href={RC_CONFIG.SPREADSHEET_URL} target="_blank" rel="noopener" title="Abrir Spreadsheet Sandbox">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Sheet
      </a>
    </div>
  );
};

// Expose store ref for sync handler to dispatch toasts
const StoreBridge = () => {
  const app = useApp();
  React.useEffect(() => {
    window.__rcStoreRef = app;
    return () => { window.__rcStoreRef = null; };
  }, [app]);
  return null;
};

// Persistent banner with last-sync status — visible even after the toast fades.
const SyncStatus = () => {
  const [status, setStatus] = React.useState(null);
  React.useEffect(() => {
    function onSyncStart() { setStatus({ kind: "loading", at: Date.now() }); }
    function onSyncDone(ev) {
      const d = ev.detail || {};
      setStatus({
        kind: d.ok ? "ok" : "err",
        at: Date.now(),
        msg: d.ok
          ? (d.msg
              ? d.msg + " · " + new Date().toLocaleTimeString("es-CL")
              : "Última sincronización: " + d.written + " fila" + (d.written !== 1 ? "s" : "") + " · " + new Date().toLocaleTimeString("es-CL"))
          : "Error: " + (d.msg || "desconocido"),
      });
    }
    window.addEventListener("rc:confirm", onSyncStart);
    window.addEventListener("rc:sync-done", onSyncDone);
    return () => {
      window.removeEventListener("rc:confirm", onSyncStart);
      window.removeEventListener("rc:sync-done", onSyncDone);
    };
  }, []);
  if (!status) return null;
  return (
    <div className={"rc-sync-banner " + status.kind} role="status">
      {status.kind === "loading" && <span className="prt-spinner" />}
      {status.kind === "ok" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {status.kind === "err" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      <span>{status.kind === "loading" ? "Escribiendo en Google Sheets…" : status.msg}</span>
    </div>
  );
};

Object.assign(window, { AuthGate, UserChip, StoreBridge, SyncStatus, RC_CONFIG, rcLogin, rcLogout });
