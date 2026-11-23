import { Screen } from "@/components/Screen";
import { TeamSections } from "./TeamSections";

/** Pantallas 4-5 del diseño: rejilla de equipos por color, con scroll. */
export default function TeamPickerPage() {
  return (
    <Screen compact back="/">
      <TeamSections />
    </Screen>
  );
}
