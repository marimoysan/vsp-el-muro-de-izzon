import { Screen } from "@/components/Screen";
import { QUESTION } from "@/lib/teams";

/**
 * Flujo "Responde a la pregunta". Pendiente de implementar:
 *  1. ¿Qué equipo sois? → selector de icono (pantallas 3-5 del diseño)
 *  2. Textarea (máx. 250 caracteres, pantalla 2) → POST /api/answer
 */
export default function PreguntaPage() {
  return (
    <Screen compact>
      <h1>{QUESTION}</h1>
      <p>Respuesta — en construcción</p>
    </Screen>
  );
}
