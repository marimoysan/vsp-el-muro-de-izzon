import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import { TEAMS, isTeamId } from "@/lib/teams";
import { AnswerForm } from "./AnswerForm";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ team: t.id }));
}

/** Pantalla 2 del diseño: pregunta + textarea → POST /api/answer → Sheets. */
export default async function PreguntaPage({ params }: { params: Promise<{ team: string }> }) {
  const { team } = await params;
  if (!isTeamId(team)) notFound();

  return (
    <Screen compact>
      <AnswerForm team={team} />
    </Screen>
  );
}
