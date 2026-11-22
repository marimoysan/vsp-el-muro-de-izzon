import "server-only";

/**
 * Acceso a Google Drive y Sheets a través de la aplicación web de Apps Script
 * (código en apps-script/Code.gs). El script se ejecuta con la cuenta de
 * Google de la organizadora, así que usa su Drive y sus permisos.
 *
 * Solo se usa en el servidor: la URL y el secreto nunca llegan al navegador.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

async function callAppsScript(payload: Record<string, unknown>) {
  const res = await fetch(requireEnv("APPS_SCRIPT_URL"), {
    method: "POST",
    // text/plain: Apps Script lo lee igual en e.postData.contents.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, secret: requireEnv("APPS_SCRIPT_SECRET") }),
    // Apps Script responde con una redirección a googleusercontent.com.
    redirect: "follow",
    cache: "no-store",
  });

  const text = await res.text();
  let data: { ok?: boolean; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    // Suele significar que el despliegue no es público o la URL es incorrecta
    // (Google devuelve una página HTML de login o de error).
    throw new Error(`Respuesta no JSON de Apps Script (HTTP ${res.status})`);
  }
  if (!data.ok) throw new Error(`Apps Script: ${data.error ?? "error desconocido"}`);
  return data;
}

export async function uploadPhotoToDrive(params: {
  fileName: string;
  mimeType: string;
  data: Buffer;
}) {
  return callAppsScript({
    action: "photo",
    fileName: params.fileName,
    mimeType: params.mimeType,
    data: params.data.toString("base64"),
  });
}

export async function appendAnswerToSheet(params: { team: string; answer: string }) {
  return callAppsScript({ action: "answer", team: params.team, answer: params.answer });
}
