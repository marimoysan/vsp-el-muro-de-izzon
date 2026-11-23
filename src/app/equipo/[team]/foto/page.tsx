import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import { TEAMS, isTeamId } from "@/lib/teams";
import { PhotoUploader } from "./PhotoUploader";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ team: t.id }));
}

/** Flujo "Sube tu foto": elegir foto → compressImage() → POST /api/photo con el equipo. */
export default async function FotoPage({ params }: { params: Promise<{ team: string }> }) {
  const { team } = await params;
  if (!isTeamId(team)) notFound();

  return (
    <Screen compact>
      <PhotoUploader team={team} />
    </Screen>
  );
}
