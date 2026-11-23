"use client";

import { useEffect, useState } from "react";
import type { TeamId } from "./teams";

/**
 * Qué equipos tienen ya foto en Drive y respuesta en Sheets (vía /api/status).
 * `loading` mientras se consulta; `error` si no se pudo leer.
 */
export type TeamStatus =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ok"; photo: Set<TeamId>; answer: Set<TeamId> };

export function useTeamStatus(): TeamStatus {
  const [status, setStatus] = useState<TeamStatus>({ state: "loading" });
  useEffect(() => {
    let cancelled = false;
    fetch("/api/status", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ photo: TeamId[]; answer: TeamId[] }>;
      })
      .then((data) => {
        if (!cancelled)
          setStatus({
            state: "ok",
            photo: new Set(data.photo),
            answer: new Set(data.answer),
          });
      })
      .catch(() => {
        if (!cancelled) setStatus({ state: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}
