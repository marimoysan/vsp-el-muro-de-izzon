/**
 * Equipos del evento: 30 = 10 iconos × 3 colores (negro, blanco, beige).
 * Cada equipo se identifica como "<icono>-<color>", p. ej. "hoja-negro",
 * que coincide con su imagen en public/icons/<icono>-<color>.png.
 */
export const ICONS = [
  { id: "hoja", label: "Hoja" },
  { id: "tubo", label: "Tubo" },
  { id: "molecula", label: "Molécula" },
  { id: "gota", label: "Gota" },
  { id: "matraz", label: "Matraz" },
  { id: "frasco", label: "Frasco" },
  { id: "engranaje", label: "Engranaje" },
  { id: "camion", label: "Camión" },
  { id: "dropper", label: "Cuentagotas" },
  { id: "zz", label: "ZZ" },
] as const;

export const COLORS = [
  { id: "negro", label: "Negro" },
  { id: "blanco", label: "Blanco" },
  { id: "beige", label: "Beige" },
] as const;

type IconId = (typeof ICONS)[number]["id"];
export type ColorId = (typeof COLORS)[number]["id"];
export type TeamId = `${IconId}-${ColorId}`;

export type Team = { id: TeamId; label: string; color: ColorId; icon: string };

export const TEAMS: Team[] = COLORS.flatMap((c) =>
  ICONS.map((i) => ({
    id: `${i.id}-${c.id}` as TeamId,
    label: `${i.label} ${c.label}`,
    color: c.id,
    icon: `/icons/${i.id}-${c.id}.png`,
  })),
);

export function isTeamId(value: unknown): value is TeamId {
  return TEAMS.some((t) => t.id === value);
}

export function getTeam(id: TeamId): Team {
  return TEAMS.find((t) => t.id === id)!;
}

export const QUESTION = "¿Qué nos impulsa a seguir evolucionando juntos?";
export const MAX_ANSWER_LENGTH = 250;
