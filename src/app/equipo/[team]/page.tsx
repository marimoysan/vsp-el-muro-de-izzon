import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Screen } from "@/components/Screen";
import { TEAMS, getTeam, isTeamId } from "@/lib/teams";
import { ActionButtons } from "./ActionButtons";
import styles from "./page.module.css";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ team: t.id }));
}

/** Pantalla 1 del diseño: las dos acciones del equipo elegido. */
export default async function TeamPage({ params }: { params: Promise<{ team: string }> }) {
  const { team: id } = await params;
  if (!isTeamId(id)) notFound();
  const team = getTeam(id);

  return (
    <Screen back="/equipo">
      <Link href="/equipo" className={styles.team} aria-label="Cambiar de equipo">
        <Image src={team.icon} alt="" width={56} height={56} className={styles.icon} />
        <span>{team.label}</span>
      </Link>
      <ActionButtons team={team.id} />
    </Screen>
  );
}
