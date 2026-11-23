"use client";

import { useSyncExternalStore } from "react";
import type { TeamId } from "./teams";

/**
 * Recuerda en el móvil qué acciones ha completado cada equipo, para marcarlas
 * como hechas. Se guarda en localStorage: sobrevive a recargas, pero es solo
 * por dispositivo (si el equipo cambia de móvil, no se verá marcado).
 */
export type Action = "foto" | "pregunta";

const EVENT = "izzon-progress";
const key = (team: TeamId, action: Action) => `izzon:hecho:${team}:${action}`;

export function markDone(team: TeamId, action: Action) {
  try {
    localStorage.setItem(key(team, action), "1");
  } catch {
    // Navegación privada o almacenamiento bloqueado: no pasa nada.
  }
  window.dispatchEvent(new Event(EVENT));
}

function isDone(team: TeamId, action: Action) {
  try {
    return localStorage.getItem(key(team, action)) === "1";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useDone(team: TeamId, action: Action) {
  return useSyncExternalStore(
    subscribe,
    () => isDone(team, action),
    () => false,
  );
}

/** El equipo ha enviado foto y respuesta desde este móvil. */
export function useCompleted(team: TeamId) {
  const photo = useDone(team, "foto");
  const answer = useDone(team, "pregunta");
  return photo && answer;
}
