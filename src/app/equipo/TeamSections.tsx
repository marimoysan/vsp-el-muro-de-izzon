"use client";

import { COLORS, TEAMS } from "@/lib/teams";
import styles from "./page.module.css";
import { useTeamStatus } from "@/lib/status";
import { TeamLink } from "./TeamLink";

/** Rejilla de equipos por color; los completados (Drive + Sheets) en gris. */
export function TeamSections() {
  // Si aún carga o falla la consulta, todos los equipos se muestran activos.
  const status = useTeamStatus();
  return (
    <div className={styles.sections}>
      {COLORS.map((color) => (
        <section key={color.id} className={styles.section}>
          <h2 className={styles.title}>{color.label}</h2>
          <ul className={styles.grid}>
            {TEAMS.filter((t) => t.color === color.id).map((team) => (
              <li key={team.id}>
                <TeamLink
                  team={team}
                  completed={
                    status.state === "ok" &&
                    status.photo.has(team.id) &&
                    status.answer.has(team.id)
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
