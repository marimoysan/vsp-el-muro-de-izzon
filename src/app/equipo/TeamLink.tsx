"use client";

import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/lib/teams";
import styles from "./page.module.css";

/** Icono del selector; si el equipo ya tiene foto y respuesta, en gris y no pulsable. */
export function TeamLink({
  team,
  completed,
}: {
  team: Team;
  completed: boolean;
}) {
  if (completed) {
    return (
      <span
        className={`${styles.team} ${styles.completed}`}
        aria-disabled="true"
      >
        <Image
          src={team.icon}
          alt={`${team.label} (completado)`}
          width={88}
          height={88}
          className={styles.icon}
          unoptimized
          loading="eager"
        />
      </span>
    );
  }
  return (
    <Link href={`/equipo/${team.id}`} className={styles.team}>
      <Image
        src={team.icon}
        alt={team.label}
        width={88}
        height={88}
        className={styles.icon}
        unoptimized
        loading="eager"
      />
    </Link>
  );
}
