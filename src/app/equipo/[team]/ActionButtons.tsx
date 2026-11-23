"use client";

import Link from "next/link";
import pill from "@/components/PillButton.module.css";
import { useDone } from "@/lib/progress";
import type { TeamId } from "@/lib/teams";
import styles from "./page.module.css";

export function ActionButtons({ team }: { team: TeamId }) {
  const photoDone = useDone(team, "foto");
  const answerDone = useDone(team, "pregunta");

  return (
    <div className={styles.actions}>
      <Link
        href={`/equipo/${team}/foto`}
        className={photoDone ? `${pill.pill} ${styles.done}` : pill.pill}
      >
        {photoDone && <span className={styles.check}>✓</span>}
        {photoDone ? "Foto enviada" : "Sube tu foto"}
      </Link>

      <Link
        href={`/equipo/${team}/pregunta`}
        className={answerDone ? `${pill.pill} ${styles.done}` : pill.pill}
      >
        {answerDone && <span className={styles.check}>✓</span>}
        {answerDone ? "Respuesta enviada" : "Responde a la pregunta"}
      </Link>
    </div>
  );
}
