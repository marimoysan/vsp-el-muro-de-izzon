"use client";

import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import styles from "./page.module.css";

/** Icono del selector; en gris si el equipo ya tiene foto y respuesta guardadas. */
export function TeamLink({
  team,
  completed,
}: {
  team: Team;
  completed: boolean;
}) {
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
