import "server-only";

import { Readable } from "node:stream";
import { google } from "googleapis";

/**
 * Cliente de Google (Drive + Sheets) autenticado con una service account.
 * Solo se usa en el servidor: las credenciales nunca llegan al navegador.
 *
 * IMPORTANTE (Drive): una service account no tiene cuota de almacenamiento
 * propia. La carpeta de destino debe estar en una Unidad compartida (Shared
 * Drive) donde la service account sea "Gestor de contenido", o la subida
 * fallará con "Service Accounts do not have storage quota".
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

function getAuth() {
  return new google.auth.JWT({
    email: requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    // En Vercel la clave se guarda con "\n" literales; los convertimos.
    key: requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

export async function uploadPhotoToDrive(params: {
  fileName: string;
  mimeType: string;
  data: Buffer;
}) {
  const drive = google.drive({ version: "v3", auth: getAuth() });
  const res = await drive.files.create({
    requestBody: {
      name: params.fileName,
      parents: [requireEnv("GOOGLE_DRIVE_FOLDER_ID")],
    },
    media: { mimeType: params.mimeType, body: Readable.from(params.data) },
    fields: "id, name",
    supportsAllDrives: true,
  });
  return res.data;
}

export async function appendAnswerToSheet(params: {
  team: string;
  answer: string;
}) {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: requireEnv("GOOGLE_SHEET_ID"),
    range: process.env.GOOGLE_SHEET_RANGE || "Respuestas!A:B",
    // RAW evita que una respuesta que empiece por "=" se interprete como fórmula.
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[params.team, params.answer]] },
  });
}
