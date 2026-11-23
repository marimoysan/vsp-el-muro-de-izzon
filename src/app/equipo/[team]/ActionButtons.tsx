"use client";

import Link from "next/link";
import pill from "@/components/PillButton.module.css";
import { useDone } from "@/lib/progress";
import type { TeamId } from "@/lib/teams";
import styles from "./page.module.css";

export function ActionButtons({ team }: { team: TeamId }) {
  const photoDone = useDone(team, "foto");

  return (
    <div className={styles.actions}>
      <Link
        href={`/equipo/${team}/foto`}
        className={photoDone ? `${pill.pill} ${styles.done}` : pill.pill}
      >
        {photoDone && <span className={styles.check}>✓</span>}
        {photoDone ? "Foto enviada" : "Sube tu foto"}
      </Link>

      {/* Aparcado: se activará cuando completemos la parte de la pregunta. */}
      <span className={`${pill.pill} ${styles.inactive}`} aria-disabled="true">
        Responde a la pregunta
      </span>
    </div>
  );
}
