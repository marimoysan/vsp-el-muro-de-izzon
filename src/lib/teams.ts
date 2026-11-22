/**
 * Equipos del evento. Cada equipo se identifica por un icono de la
 * iconografía de Evoluzzión (public/icons/<id>-<variante>.png).
 *
 * TODO: confirmar la lista definitiva de equipos y sus nombres visibles
 * (el diseño muestra 10 iconos en variante NEGRO y BLANCO).
 */
export const TEAMS = [
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

export type TeamId = (typeof TEAMS)[number]["id"];
export type IconVariant = "negro" | "blanco" | "beige";

export function iconSrc(id: TeamId, variant: IconVariant) {
  return `/icons/${id}-${variant}.png`;
}

export function isTeamId(value: unknown): value is TeamId {
  return TEAMS.some((t) => t.id === value);
}

export function teamLabel(id: TeamId) {
  return TEAMS.find((t) => t.id === id)!.label;
}

export const QUESTION = "¿Qué nos impulsa a seguir evolucionando juntos?";
export const MAX_ANSWER_LENGTH = 250;
