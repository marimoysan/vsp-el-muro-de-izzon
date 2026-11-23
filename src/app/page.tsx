import Link from "next/link";
import { Screen } from "@/components/Screen";
import pill from "@/components/PillButton.module.css";
import { PrefetchStatus } from "./PrefetchStatus";

/** Pantalla 3 del diseño (entrada desde el QR): "¿Qué equipo sois?". */
export default function Home() {
  return (
    <Screen>
      <PrefetchStatus />
      <Link href="/equipo" className={pill.pill}>
        ¿Qué equipo sois?
      </Link>
    </Screen>
  );
}
