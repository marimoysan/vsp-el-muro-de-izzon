/* eslint-disable @next/next/no-img-element -- SVGs de marca estáticos */
import Link from "next/link";
import styles from "./Screen.module.css";

/**
 * Marco común de todas las pantallas: cabecera Evoluzzión arriba,
 * contenido en el centro y logo IZZON Lab abajo.
 * `compact` reduce la cabecera (pantallas de pregunta y selector de equipo).
 * `back` muestra una flecha arriba a la izquierda que lleva a esa ruta.
 */
export function Screen({
  children,
  compact = false,
  back,
}: {
  children: React.ReactNode;
  compact?: boolean;
  back?: string;
}) {
  return (
    <main className={styles.screen}>
      {back && <BackLink href={back} />}
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

/** Flecha "atrás" en la esquina superior izquierda de la pantalla. */
export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.back} aria-label="Atrás">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
