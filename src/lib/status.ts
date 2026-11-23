"use client";

import { useEffect, useState } from "react";
import type { TeamId } from "./teams";

/**
 * Qué equipos tienen ya foto en Drive y respuesta en Sheets (vía /api/status).
 *
 * La consulta tarda 1-2 s (Apps Script), así que se lanza ya en la landing
 * (`prefetchTeamStatus`) y el resultado se guarda en memoria: el selector y la
 * pantalla del equipo lo muestran al instante y lo refrescan en segundo plano.
 */
export type TeamStatus =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ok"; photo: Set<TeamId>; answer: Set<TeamId> };

type Loaded = Extract<TeamStatus, { state: "ok" }>;

/** Con un resultado más reciente que esto no se vuelve a consultar. */
const FRESH_MS = 5_000;

let cached: { status: Loaded; at: number } | null = null;
let inFlight: Promise<TeamStatus> | null = null;
const listeners = new Set<(s: TeamStatus) => void>();

function publish(status: TeamStatus) {
  listeners.forEach((l) => l(status));
}

function fetchStatus(): Promise<TeamStatus> {
  if (inFlight) return inFlight;
  inFlight = fetch("/api/status", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<{ photo: TeamId[]; answer: TeamId[] }>;
    })
    .then((data): TeamStatus => {
      const status: Loaded = {
        state: "ok",
        photo: new Set(data.photo),
        answer: new Set(data.answer),
      };
      cached = { status, at: Date.now() };
      return status;
    })
    .catch((): TeamStatus => ({ state: "error" }))
    .finally(() => {
      inFlight = null;
    });
  inFlight.then(publish);
  return inFlight;
}

/** Lanza la consulta por adelantado (landing). */
export function prefetchTeamStatus() {
  if (!cached || Date.now() - cached.at > FRESH_MS) void fetchStatus();
}

/** Tras enviar foto o respuesta: se refleja ya, sin esperar a Google. */
export function noteSaved(team: TeamId, kind: "photo" | "answer") {
  if (cached) {
    const next: Loaded = {
      state: "ok",
      photo: new Set(cached.status.photo),
      answer: new Set(cached.status.answer),
    };
    next[kind].add(team);
    cached = { status: next, at: cached.at };
    publish(next);
  }
}

export function useTeamStatus(): TeamStatus {
  const [status, setStatus] = useState<TeamStatus>(() =>
    cached ? cached.status : { state: "loading" },
  );
  useEffect(() => {
    const listener = (s: TeamStatus) => {
      // Si falla un refresco pero ya teníamos datos, se mantienen.
      if (s.state === "error" && cached) return;
      setStatus(s);
    };
    listeners.add(listener);
    prefetchTeamStatus();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return status;
}
