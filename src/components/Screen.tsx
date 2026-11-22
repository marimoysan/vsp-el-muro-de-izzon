/* eslint-disable @next/next/no-img-element -- SVGs de marca estáticos */
import styles from "./Screen.module.css";

/**
 * Marco común de todas las pantallas: cabecera Evoluzzión arriba,
 * contenido en el centro y logo IZZON Lab abajo.
 * `compact` reduce la cabecera (pantallas de pregunta y selector de equipo).
 */
export function Screen({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <main className={styles.screen}>
      <header className={compact ? styles.headerCompact : styles.header}>
        <img
          src="/brand/evoluzzion-annual-meeting-2026.svg"
          alt="Annual Meeting 2026 · Evoluzzión · La fuerza de crecer juntos"
        />
      </header>
      <section className={styles.content}>{children}</section>
      <footer className={styles.footer}>
        <img src="/brand/izzon-lab.svg" alt="IZZON Lab" />
      </footer>
    </main>
  );
}
