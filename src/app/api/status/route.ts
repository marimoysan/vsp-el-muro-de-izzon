import { connection } from "next/server";
import { getSavedStatus } from "@/lib/google";
import { TEAMS } from "@/lib/teams";

/**
 * GET → { photo: TeamId[], answer: TeamId[] }: equipos con foto en Drive
 * (archivo con el nombre del equipo) y con fila de respuesta en Sheets.
 */
export async function GET() {
  await connection(); // siempre en el momento: nunca prerenderizar ni cachear
  try {
    const { photos, answers } = await getSavedStatus();
    const withPhoto = new Set(photos);
    const withAnswer = new Set(answers);
    return Response.json(
      {
        photo: TEAMS.filter((t) => withPhoto.has(t.label)).map((t) => t.id),
        answer: TEAMS.filter((t) => withAnswer.has(t.label)).map((t) => t.id),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Error leyendo el estado de Drive/Sheets", err);
    return Response.json(
      { error: "No se pudo leer el estado" },
      { status: 502 },
    );
  }
}
