import { uploadPhotoToDrive } from "@/lib/google";
import { isTeamId } from "@/lib/teams";

export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024; // por debajo del límite de 4,5 MB de Vercel

/** POST multipart/form-data: { photo: File, team: TeamId } */
export async function POST(request: Request) {
  const form = await request.formData();
  const photo = form.get("photo");
  const team = form.get("team");

  if (!isTeamId(team)) {
    return Response.json({ error: "Equipo no válido" }, { status: 400 });
  }

  if (!(photo instanceof File) || !photo.type.startsWith("image/")) {
    return Response.json({ error: "Falta la foto" }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return Response.json({ error: "La foto es demasiado grande" }, { status: 413 });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = photo.type === "image/png" ? "png" : "jpg";

  try {
    await uploadPhotoToDrive({
      fileName: `${team}_${stamp}.${ext}`,
      mimeType: photo.type,
      data: Buffer.from(await photo.arrayBuffer()),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error subiendo a Drive", err);
    return Response.json({ error: "No se pudo subir la foto" }, { status: 502 });
  }
}
