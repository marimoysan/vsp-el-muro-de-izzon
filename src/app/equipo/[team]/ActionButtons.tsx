"use client";

import Link from "next/link";
import pill from "@/components/PillButton.module.css";
import { BackLink } from "@/components/Screen";
import { useDone } from "@/lib/progress";
import { useTeamStatus } from "@/lib/status";
import type { TeamId } from "@/lib/teams";
import styles from "./page.module.css";

/**
 * Acciones del equipo. Lo que está hecho sale de Drive (foto) y Sheets
 * (respuesta). Mientras llega esa consulta, o si falla, se usa lo recordado
 * en este móvil, sin pantalla de espera.
 */
export function ActionButtons({ team }: { team: TeamId }) {
  const status = useTeamStatus();
  const localPhoto = useDone(team, "foto");
  const localAnswer = useDone(team, "pregunta");

  const photoDone = status.state === "ok" ? status.photo.has(team) : localPhoto;
  const answerDone =
    status.state === "ok" ? status.answer.has(team) : localAnswer;

  if (photoDone && answerDone) {
    return (
      <div className={styles.completion}>
        <p className={styles.completionTitle}>¡Completado!</p>
        <p>Podéis seguir disfrutando del Coffee Break</p>
      </div>
    );
  }

  // Sin flecha atrás en la pantalla de completado.
  return (
    <>
      <BackLink href="/equipo" />
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
    </>
  );
}
