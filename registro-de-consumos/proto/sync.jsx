// sync.jsx — Capa de integración con Google Sheets / Drive vía Apps Script.
// El acceso es PÚBLICO: la app no requiere login. Todas las operaciones se
// canalizan a través de un endpoint de Apps Script desplegado como "Aplicación
// web" con acceso "Cualquier usuario". Ese script corre con la cuenta del
// dueño y escribe en la planilla/Drive en su nombre.
//
// Para desplegar el backend ver `apps-script.gs` en la raíz del proyecto y
// pegar la URL resultante en APPS_SCRIPT_URL más abajo.

const RC_CONFIG = {
  // 👉 Pega aquí la URL /exec de tu Apps Script desplegado.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxP25MmfKXbCQJzh1gj2KCkMjOMLGLLs6zuWcZdPTQ58_E9prlNfhXwThVIaLFyPANu/exec",

  SPREADSHEET_URL:
    "https://docs.google.com/spreadsheets/d/1e6v7yPP05w05OIfsHRyyU3cfXXDPhVzg43TL_HvXihU",

  SHEETS: {
    COMBUSTIBLE: "Combustible",
    ELECTRICIDAD: "Electricidad",
    AGUA: "Agua",
  },

  FOLDERS: {
    ENEL_POR_PROCESAR:  "1led0ePxm2yEuJSPWVuV-aPik-28hlbG7",
    ENEL_PROCESADOS:    "1AI2biUrUAZFHV9dYubNm2xGKh1gmzpus",
    AGUAS_POR_PROCESAR: "1IHvHFeB-OWSIIfyxaUh3YvpoBnmGMXz9",
    AGUAS_PROCESADOS:   "1rp-qUzPUYu9dX24YZmCeNR7CXgwSzY8p",
    // Folder where manual-entry facturas/boletas land. Leave empty to skip the upload
    // (the filename will still be captured locally on the record).
    MANUAL_FACTURAS:    "",
    // Optional dedicated folder for documents uploaded via "Subir documento" with
    // providers other than Enel/Aguas (e.g. Iconstruye). Falls back to MANUAL_FACTURAS
    // when empty so a single config covers both flows.
    UPLOAD_FACTURAS:    "",
  },

  EMPRESA: "Euro",
};

// ----- Endpoint helpers ---------------------------------------------------

function rcEndpointConfigured() {
  const u = RC_CONFIG.APPS_SCRIPT_URL;
  return typeof u === "string" && u.indexOf("script.google.com") !== -1;
}

async function rcApiGet(params) {
  const qs = Object.keys(params || {})
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
  const url = RC_CONFIG.APPS_SCRIPT_URL + (qs ? "?" + qs : "");
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const data = await r.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

// Apps Script GET-as-POST trick: usamos text/plain para evitar preflight CORS.
async function rcApiPost(body) {
  const r = await fetch(RC_CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const data = await r.json();
  if (data && data.error) throw new Error(data.error);
  return data;
}

// ----- Parsing utilities --------------------------------------------------

function rcParseDate(s) {
  if (s == null || s === "") return "";
  const str = String(s).trim();
  let m;
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  m = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
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
// Map a human-readable agua subcat label (as stored in the Sheets column) back to a subcat id.
// Predefined: "Potable" → "potable", "Gris" → "gris", "Industrial" → "industrial".
// Anything else (custom tipos like "Riego") → "otro:<slug>" — matches getSubcatsFor().
function rcAguaSubcat(label) {
  if (!label) return null;
  const t = String(label).trim();
  if (!t) return null;
  const tl = t.toLowerCase();
  if (tl === "potable")    return "potable";
  if (tl === "gris")       return "gris";
  if (tl === "industrial") return "industrial";
  return "otro:" + tl.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
function rcNum(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// ----- Read all records ---------------------------------------------------

async function rcReadAllRecords() {
  if (!rcEndpointConfigured()) return [];
  const data = await rcApiGet({ action: "read" });
  const records = [];

  ((data.Combustible || []).slice(1)).forEach(function (row, i) {
    const link = row[0], fecha = row[1], consumo = row[2], costo = row[3];
    const sucursal = row[5], tipo = row[6], proveedor = row[7], estadoLbl = row[8];
    if (!fecha && !consumo) return;
    const subcat = rcCombSubcat(tipo);
    records.push({
      id: "comb-" + i,
      _sheetName: "Combustible",
      _sheetRow: i + 2,
      _estadoCol: 9,
      date: rcParseDate(fecha),
      sucursal: sucursal || "",
      type: "combustible",
      subcat: subcat,
      provider: proveedor || "",
      cantidad: rcNum(consumo),
      unit: (subcat === "glp" || subcat === "gas-natural") ? "kg" : "L",
      costo: rcNum(costo),
      origen: "sheets",
      estado: rcEstadoValue(estadoLbl),
      _driveLink: link || "",
    });
  });

  ((data.Electricidad || []).slice(1)).forEach(function (row, i) {
    const link = row[0], numCli = row[1], fecha = row[2], consumo = row[3];
    const costo = row[4], sucursal = row[6], proveedor = row[8], estadoLbl = row[9];
    if (!fecha && !consumo) return;
    records.push({
      id: "elec-" + i,
      _sheetName: "Electricidad",
      _sheetRow: i + 2,
      _estadoCol: 10,
      date: rcParseDate(fecha),
      sucursal: sucursal || "",
      type: "electricidad",
      subcat: null,
      provider: proveedor || "",
      cantidad: rcNum(consumo),
      unit: "kWh",
      costo: rcNum(costo),
      origen: "sheets",
      estado: rcEstadoValue(estadoLbl),
      numeroCliente: numCli || "",
      _driveLink: link || "",
    });
  });

  ((data.Agua || []).slice(1)).forEach(function (row, i) {
    const link = row[0], numCli = row[1], fecha = row[2], consumo = row[3];
    const costo = row[4], sucursal = row[6], proveedor = row[8], subcatLbl = row[9], estadoLbl = row[10];
    if (!fecha && !consumo) return;
    records.push({
      id: "agua-" + i,
      _sheetName: "Agua",
      _sheetRow: i + 2,
      _estadoCol: 11,
      date: rcParseDate(fecha),
      sucursal: sucursal || "",
      type: "agua",
      subcat: rcAguaSubcat(subcatLbl),
      provider: proveedor || "",
      cantidad: rcNum(consumo),
      unit: "m³",
      costo: rcNum(costo),
      origen: "sheets",
      estado: rcEstadoValue(estadoLbl),
      numeroCliente: numCli || "",
      _driveLink: link || "",
    });
  });

  return records;
}

async function rcRefreshDashboard() {
  const { dispatch } = window.__rcStoreRef || {};
  if (!rcEndpointConfigured()) {
    console.warn("[rc-sync] APPS_SCRIPT_URL no configurada — saltando refresh");
    return;
  }
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

// ----- Row mapping --------------------------------------------------------

function endOfMonth(iso) {
  if (!iso) return "";
  const [y, m] = iso.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return String(last).padStart(2, "0") + "/" + String(m).padStart(2, "0") + "/" + y;
}
function rcEstadoLabel(estado) {
  return estado === "eliminada" ? "Eliminada" : "Activa";
}
function rcEstadoValue(label) {
  if (!label) return "activa";
  const t = String(label).trim().toLowerCase();
  return t === "eliminada" || t === "eliminado" ? "eliminada" : "activa";
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
        rcEstadoLabel(r.estado),
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
        rcEstadoLabel(r.estado),
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
        r.subcat ? subcatLabel("agua", r.subcat) : "",
        rcEstadoLabel(r.estado),
      ]);
    }
  }
  return byType;
}

// ----- File upload helper (base64) ---------------------------------------

async function rcFileToBase64(file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// ----- Confirm handler ----------------------------------------------------

async function rcHandleConfirm(ev) {
  const detail = ev.detail || {};
  const { source, provider, records, files } = detail;
  console.log("[rc-sync] rc:confirm received", detail);
  if (!rcEndpointConfigured()) {
    console.warn("[rc-sync] APPS_SCRIPT_URL no configurada");
    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: false, msg: "Backend no configurado. Edita APPS_SCRIPT_URL en sync.jsx." },
    }));
    return;
  }
  try {
    // 1) Subir cada archivo único a la carpeta Drive correspondiente
    const uploads = {};
    if (source === "upload" && files && files.length) {
      const providerName = (provider && provider.name) || "";
      const isEnel  = /Enel/i.test(providerName);
      const isAguas = /Aguas/i.test(providerName);
      const folderOrigen = isEnel ? RC_CONFIG.FOLDERS.ENEL_POR_PROCESAR
                        : isAguas ? RC_CONFIG.FOLDERS.AGUAS_POR_PROCESAR
                        : (RC_CONFIG.FOLDERS.UPLOAD_FACTURAS || RC_CONFIG.FOLDERS.MANUAL_FACTURAS || null);
      // Only Enel/Aguas have a "Procesados" sibling; generic uploads stay in their source folder.
      const folderDestino = isEnel ? RC_CONFIG.FOLDERS.ENEL_PROCESADOS
                         : isAguas ? RC_CONFIG.FOLDERS.AGUAS_PROCESADOS
                         : null;
      if (folderOrigen) {
        for (const f of files) {
          if (!f.file) continue;
          if (uploads[f.name]) continue;
          try {
            console.log("[rc-sync] uploading to Drive:", f.name);
            const base64 = await rcFileToBase64(f.file);
            const up = await rcApiPost({
              action: "upload",
              name: f.file.name,
              mimeType: f.file.type || "application/octet-stream",
              base64: base64,
              folderId: folderOrigen,
            });
            uploads[f.name] = { id: up.id, link: up.link, folderOrigen, folderDestino };
            console.log("[rc-sync] uploaded:", up);
          } catch (e) { console.warn("[rc-sync] upload failed", f.name, e); }
        }
      }
    }

    // 1b) Subir factura adjunta a una entrada manual (un archivo por record)
    if (source === "manual" && detail.factura && detail.factura.file) {
      const folder = RC_CONFIG.FOLDERS.MANUAL_FACTURAS;
      if (folder) {
        try {
          console.log("[rc-sync] uploading factura:", detail.factura.name);
          const base64 = await rcFileToBase64(detail.factura.file);
          const up = await rcApiPost({
            action: "upload",
            name: detail.factura.file.name,
            mimeType: detail.factura.file.type || "application/octet-stream",
            base64: base64,
            folderId: folder,
          });
          // attach the link to every manual record in this confirm batch
          (records || []).forEach((r) => { r._driveLink = up.link; });
          console.log("[rc-sync] factura uploaded:", up);
        } catch (e) { console.warn("[rc-sync] factura upload failed", e); }
      } else {
        console.log("[rc-sync] MANUAL_FACTURAS folder not configured — skipping factura upload");
      }
    }

    // 2) Anexar drive link a registros con mismo sourceFile
    if (Object.keys(uploads).length && records) {
      records.forEach((r) => {
        if (r.sourceFile && uploads[r.sourceFile]) {
          r._driveLink = uploads[r.sourceFile].link;
        }
      });
    }

    // 3) Append a las hojas correspondientes
    const byType = rowsByType(records);
    console.log("[rc-sync] rows ready to write", byType);
    let written = 0;
    if (byType.combustible.length) {
      await rcApiPost({ action: "append", sheet: RC_CONFIG.SHEETS.COMBUSTIBLE, values: byType.combustible });
      written += byType.combustible.length;
    }
    if (byType.electricidad.length) {
      await rcApiPost({ action: "append", sheet: RC_CONFIG.SHEETS.ELECTRICIDAD, values: byType.electricidad });
      written += byType.electricidad.length;
    }
    if (byType.agua.length) {
      await rcApiPost({ action: "append", sheet: RC_CONFIG.SHEETS.AGUA, values: byType.agua });
      written += byType.agua.length;
    }

    // 4) Mover PDFs a "Procesados"
    for (const u of Object.values(uploads)) {
      if (u.folderOrigen && u.folderDestino) {
        try {
          await rcApiPost({
            action: "move",
            fileId: u.id,
            fromFolderId: u.folderOrigen,
            toFolderId: u.folderDestino,
          });
          console.log("[rc-sync] moved file to Procesados:", u.id);
        } catch (e) { console.warn("[rc-sync] move failed", e); }
      }
    }

    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: true, written, source },
    }));
    if (written > 0 && typeof rcRefreshDashboard === "function") rcRefreshDashboard();
  } catch (e) {
    console.error("Sheets sync failed", e);
    window.dispatchEvent(new CustomEvent("rc:sync-done", {
      detail: { ok: false, msg: e.message },
    }));
  }
}
window.addEventListener("rc:confirm", rcHandleConfirm);

// ----- Inline edit sync ---------------------------------------------------
// id format from rcReadAllRecords: "comb-{i}" / "elec-{i}" / "agua-{i}",
// where i is the 0-based index AFTER the header row. Sheet row (1-based)
// = i + 2. Columns (1-based) match the layouts in CONFIG.HEADERS:
//   Combustible  → Consumo=3, Costo=4
//   Electricidad → Consumo total=4, Costo=5
//   Agua         → Consumo total=4, Costo=5
function rcResolveSheetCell(id, field) {
  const m = /^(comb|elec|agua)-(\d+)$/.exec(id || "");
  if (!m) return null;
  const kind = m[1];
  const row = parseInt(m[2], 10) + 2;
  const COLS = {
    comb: { cantidad: 3, costo: 4, estado: 9,  sheet: RC_CONFIG.SHEETS.COMBUSTIBLE },
    elec: { cantidad: 4, costo: 5, estado: 10, sheet: RC_CONFIG.SHEETS.ELECTRICIDAD },
    agua: { cantidad: 4, costo: 5, estado: 11, sheet: RC_CONFIG.SHEETS.AGUA },
  }[kind];
  if (!COLS || !COLS[field]) return null;
  return { sheet: COLS.sheet, row, col: COLS[field] };
}

async function rcHandleEdit(ev) {
  const { id, field, value } = ev.detail || {};
  if (!rcEndpointConfigured()) return;
  const target = rcResolveSheetCell(id, field);
  if (!target) {
    console.warn("[rc-sync] edit ignored — record not from sheets:", id, field);
    return;
  }
  try {
    await rcApiPost({ action: "update", sheet: target.sheet, row: target.row, col: target.col, value });
    console.log("[rc-sync] cell updated", target, "=", value);
    window.dispatchEvent(new CustomEvent("rc:edit-done", { detail: { ok: true } }));
  } catch (e) {
    console.error("[rc-sync] cell update failed", e);
    window.dispatchEvent(new CustomEvent("rc:edit-done", { detail: { ok: false, msg: e.message } }));
  }
}
window.addEventListener("rc:edit", rcHandleEdit);

// ----- React helpers ------------------------------------------------------

// Bootstrap: cargar registros desde Sheets al iniciar.
const SyncBootstrap = () => {
  React.useEffect(() => {
    if (rcEndpointConfigured()) {
      rcRefreshDashboard();
    } else {
      console.warn("[rc-sync] APPS_SCRIPT_URL no está configurada — el dashboard quedará vacío.");
    }
  }, []);
  return null;
};

// Toast en respuesta a sync-done.
const SyncToaster = () => {
  React.useEffect(() => {
    function onSyncDone(ev) {
      const { dispatch } = window.__rcStoreRef || {};
      if (!dispatch) return;
      const d = ev.detail || {};
      if (d.ok) {
        dispatch({
          type: "TOAST/SHOW",
          toast: {
            kind: "success",
            title: "Sincronizado",
            body: d.written + " fila" + (d.written !== 1 ? "s" : "") + " escrita" + (d.written !== 1 ? "s" : "") + ".",
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
  return null;
};

// Expone el store al handler.
const StoreBridge = () => {
  const app = useApp();
  React.useEffect(() => {
    window.__rcStoreRef = app;
    return () => { window.__rcStoreRef = null; };
  }, [app]);
  return null;
};

// Banner persistente con el último estado de sync.
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
      <span>{status.kind === "loading" ? "Guardando…" : status.msg}</span>
    </div>
  );
};

// Placeholder — el link al spreadsheet ya no se expone al usuario final.
const SheetLink = () => null;

Object.assign(window, {
  StoreBridge, SyncBootstrap, SyncToaster, SyncStatus, SheetLink, RC_CONFIG,
});
