/**
 * El muro de IZZON · Puente entre la app (Vercel) y Google Drive / Sheets.
 *
 * Se publica como aplicación web ("Ejecutar como: yo", "Acceso: cualquier
 * usuario"). Solo la llama el servidor de Vercel, que envía un secreto
 * compartido en cada petición.
 *
 * Configuración en Configuración del proyecto → Propiedades del script:
 *   SECRET      Cadena larga aleatoria (la misma que APPS_SCRIPT_SECRET en Vercel)
 *   FOLDER_ID   ID de la carpeta de Drive donde se guardan las fotos
 *   SHEET_ID    ID de la hoja de cálculo de respuestas
 *   SHEET_NAME  Nombre de la pestaña (por defecto "Respuestas")
 *
 * Este archivo es una copia versionada: el código que se ejecuta es el que
 * está pegado en script.google.com. Si cambias algo aquí, pégalo allí y
 * publica una nueva versión del despliegue existente (misma URL).
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var body = JSON.parse(e.postData.contents);

    var expected = props.getProperty("SECRET");
    if (!body.secret || body.secret !== expected) {
      // Solo longitudes (nunca los valores) para diagnosticar desajustes.
      var got = body.secret ? String(body.secret).length : 0;
      var want = expected === null ? "sin propiedad SECRET" : expected.length;
      return json({ ok: false, error: "unauthorized (recibida: " + got + " car., esperada: " + want + ")" });
    }

    if (body.action === "photo") return json(savePhoto(body, props));
    if (body.action === "answer") return json(saveAnswer(body, props));
    return json({ ok: false, error: "unknown_action" });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

/** { fileName, mimeType, data (base64) } → archivo en la carpeta de Drive */
function savePhoto(body, props) {
  var blob = Utilities.newBlob(
    Utilities.base64Decode(body.data),
    body.mimeType,
    body.fileName
  );
  var file = DriveApp.getFolderById(props.getProperty("FOLDER_ID")).createFile(blob);
  return { ok: true, id: file.getId() };
}

/** { team, answer } → nueva fila "Equipo | Respuesta" */
function saveAnswer(body, props) {
  var sheet = SpreadsheetApp.openById(props.getProperty("SHEET_ID")).getSheetByName(
    props.getProperty("SHEET_NAME") || "Respuestas"
  );
  if (!sheet) return { ok: false, error: "sheet_not_found" };
  sheet.appendRow([asText(body.team), asText(body.answer)]);
  return { ok: true };
}

/** Evita que un texto que empieza por = + - @ se interprete como fórmula. */
function asText(value) {
  var s = String(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
