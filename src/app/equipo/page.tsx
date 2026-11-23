import { Screen } from "@/components/Screen";
import { COLORS, TEAMS } from "@/lib/teams";
import styles from "./page.module.css";
import { TeamLink } from "./TeamLink";

/** Pantallas 4-5 del diseño: rejilla de equipos por color, con scroll. */
export default function TeamPickerPage() {
  return (
    <Screen compact back="/">
      <div className={styles.sections}>
        {COLORS.map((color) => (
          <section key={color.id} className={styles.section}>
            <h2 className={styles.title}>{color.label}</h2>
            <ul className={styles.grid}>
              {TEAMS.filter((t) => t.color === color.id).map((team) => (
                <li key={team.id}>
                  <TeamLink team={team} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Screen>
  );
}
