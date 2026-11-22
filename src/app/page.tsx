import Link from "next/link";
import { Screen } from "@/components/Screen";
import pill from "@/components/PillButton.module.css";

/** Pantalla 1 del diseño: elegir entre subir foto o responder a la pregunta. */
export default function Home() {
  return (
    <Screen>
      <Link href="/foto" className={pill.pill}>
        Sube tu foto
      </Link>
      <Link href="/pregunta" className={pill.pill}>
        Responde a la pregunta
      </Link>
    </Screen>
  );
}
