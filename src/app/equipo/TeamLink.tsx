"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompleted } from "@/lib/progress";
import type { Team } from "@/lib/teams";
import styles from "./page.module.css";

/** Icono del selector; en gris si el equipo ya envió foto y respuesta. */
export function TeamLink({ team }: { team: Team }) {
  const completed = useCompleted(team.id);
  return (
    <Link
      href={`/equipo/${team.id}`}
      className={completed ? `${styles.team} ${styles.completed}` : styles.team}
    >
      <Image
        src={team.icon}
        alt={completed ? `${team.label} (completado)` : team.label}
        width={88}
        height={88}
        className={styles.icon}
      />
    </Link>
  );
}
