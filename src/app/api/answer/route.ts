import { appendAnswerToSheet } from "@/lib/google";
import { MAX_ANSWER_LENGTH, getTeam, isTeamId } from "@/lib/teams";

/** POST JSON: { team: TeamId, answer: string } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const team = body?.team;
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";

  if (!isTeamId(team)) {
    return Response.json({ error: "Equipo no válido" }, { status: 400 });
  }
  if (!answer || answer.length > MAX_ANSWER_LENGTH) {
    return Response.json(
      { error: `La respuesta debe tener entre 1 y ${MAX_ANSWER_LENGTH} caracteres` },
      { status: 400 },
    );
  }

  try {
    await appendAnswerToSheet({ team: getTeam(team).label, answer });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error escribiendo en Sheets", err);
    return Response.json({ error: "No se pudo guardar la respuesta" }, { status: 502 });
  }
}
