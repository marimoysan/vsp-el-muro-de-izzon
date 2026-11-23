import Image from "next/image";
import Link from "next/link";
import { Screen } from "@/components/Screen";
import { COLORS, TEAMS } from "@/lib/teams";
import styles from "./page.module.css";

/** Pantallas 4-5 del diseño: rejilla de equipos por color, con scroll. */
export default function TeamPickerPage() {
  return (
    <Screen compact>
      <div className={styles.sections}>
        {COLORS.map((color) => (
          <section key={color.id} className={styles.section}>
            <h2 className={styles.title}>{color.label}</h2>
            <ul className={styles.grid}>
              {TEAMS.filter((t) => t.color === color.id).map((team) => (
                <li key={team.id}>
                  <Link href={`/equipo/${team.id}`} className={styles.team}>
                    <Image
                      src={team.icon}
                      alt={team.label}
                      width={88}
                      height={88}
                      className={styles.icon}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Screen>
  );
}
