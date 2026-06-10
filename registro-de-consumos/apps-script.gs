/**
 * Registro de Consumos — Apps Script backend
 *
 * Este script vive dentro del Google Spreadsheet y expone un endpoint HTTP
 * público que la app web usa para leer/escribir registros y subir archivos
 * a Drive. Permite que cualquier usuario use la app SIN iniciar sesión con
 * su cuenta Google: las operaciones se ejecutan con TU cuenta (la que
 * desplegó el script).
 *
 * --- CÓMO DESPLEGAR ---
 *
 * 1. Abre la planilla:
 *    https://docs.google.com/spreadsheets/d/1e6v7yPP05w05OIfsHRyyU3cfXXDPhVzg43TL_HvXihU
 *
 * 2. Menú: Extensiones > Apps Script
 *
 * 3. Borra el contenido del archivo `Código.gs` y pega ESTE archivo completo.
 *
 * 4. Guarda (Ctrl+S). Pon un nombre al proyecto (ej: "Registro de Consumos API").
 *
 * 5. Botón "Implementar" (arriba a la derecha) > "Nueva implementación".
 *    - Tipo: "Aplicación web"
 *    - Descripción: lo que quieras
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario"
 *    - Click "Implementar"
 *
 * 6. La primera vez te pedirá autorizar. Acepta los permisos
 *    (Sheets + Drive). Si aparece "Esta app no está verificada" haz click en
 *    "Avanzado" > "Ir a [nombre] (no seguro)" y continúa. Es seguro: es tu
 *    propio script con tu propia cuenta.
 *
 * 7. Copia la URL que aparece bajo "URL de la app web". Termina en /exec.
 *
 * 8. Pega esa URL en `proto/sync.jsx`, en la constante APPS_SCRIPT_URL.
 *
 * --- ACTUALIZACIONES ---
 *
 * Si modificas este script: Implementar > "Administrar implementaciones"
 * > edita la existente (ícono de lápiz) > Versión "Nueva versión" >
 * Implementar. La URL no cambia.
 */

const CONFIG = {
  SPREADSHEET_ID: "1e6v7yPP05w05OIfsHRyyU3cfXXDPhVzg43TL_HvXihU",
  FOLDERS: {
    ENEL_POR_PROCESAR:  "1led0ePxm2yEuJSPWVuV-aPik-28hlbG7",
    ENEL_PROCESADOS:    "1AI2biUrUAZFHV9dYubNm2xGKh1gmzpus",
    AGUAS_POR_PROCESAR: "1IHvHFeB-OWSIIfyxaUh3YvpoBnmGMXz9",
    AGUAS_PROCESADOS:   "1rp-qUzPUYu9dX24YZmCeNR7CXgwSzY8p",
  },
  HEADERS: {
    Combustible:    ["Link", "Fecha", "Consumo", "Costo", "Empresa", "Sucursal", "Tipo", "Proveedor"],
    Electricidad:   ["Link PDF", "Número de cliente", "Fecha", "Consumo total", "Costo ($)", "Empresa", "Sucursal", "Tipo de consumo", "Proveedor"],
    Agua:           ["Link PDF", "Número de cliente", "Fecha emisión", "Consumo total", "Costo ($)", "Empresa", "Sucursal", "Tipo de consumo", "Proveedor"],
    "N° de cliente":["Número de cliente", "Empresa", "Sucursal", "Tipo de consumo", "Proveedor"],
    "Fill out":     ["Submission ID", "Submission time", "Nombre Usuario", "Nombre sucursal", "Mes de registro", "N° trabajadores", "N° trabajadoras", "m2 totales", "% Avance", "URL Excel Petróleo", "URL Excel Gas", "Procesado"],
  },
};

// ----- HTTP entrypoints --------------------------------------------------

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "read";
    if (action === "read") return jsonOut(readAll());
    if (action === "ping") return jsonOut({ ok: true, pong: new Date().toISOString() });
    return jsonOut({ error: "unknown action: " + action });
  } catch (err) {
    return jsonOut({ error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;
    if (action === "append") {
      appendRows(body.sheet, body.values || []);
      return jsonOut({ ok: true, appended: (body.values || []).length });
    }
    if (action === "upload") {
      return jsonOut(uploadFile(body.name, body.mimeType, body.base64, body.folderId));
    }
    if (action === "move") {
      moveFile(body.fileId, body.fromFolderId, body.toFolderId);
      return jsonOut({ ok: true });
    }
    if (action === "init") {
      ensureSheets();
      return jsonOut({ ok: true });
    }
    return jsonOut({ error: "unknown action: " + action });
  } catch (err) {
    return jsonOut({ error: String(err && err.message || err) });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----- Operations --------------------------------------------------------

function readAll() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const result = {};
  ["Combustible", "Electricidad", "Agua"].forEach(function (name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) { result[name] = []; return; }
    result[name] = sheet.getDataRange().getDisplayValues();
  });
  return result;
}

function appendRows(sheetName, values) {
  if (!sheetName) throw new Error("sheet name missing");
  if (!values || !values.length) return;
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = CONFIG.HEADERS[sheetName];
    if (headers) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  const start = sheet.getLastRow() + 1;
  sheet.getRange(start, 1, values.length, values[0].length).setValues(values);
}

function uploadFile(name, mimeType, base64, folderId) {
  if (!folderId) throw new Error("folderId missing");
  const bytes = Utilities.base64Decode(base64 || "");
  const blob = Utilities.newBlob(bytes, mimeType || "application/octet-stream", name || "archivo");
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);
  return { id: file.getId(), link: file.getUrl() };
}

function moveFile(fileId, fromFolderId, toFolderId) {
  const file = DriveApp.getFileById(fileId);
  if (toFolderId) DriveApp.getFolderById(toFolderId).addFile(file);
  if (fromFolderId) DriveApp.getFolderById(fromFolderId).removeFile(file);
}

function ensureSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  Object.keys(CONFIG.HEADERS).forEach(function (name) {
    if (!ss.getSheetByName(name)) {
      const sh = ss.insertSheet(name);
      const headers = CONFIG.HEADERS[name];
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  });
}
