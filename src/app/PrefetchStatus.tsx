"use client";

import { useEffect } from "react";
import { prefetchTeamStatus } from "@/lib/status";
import { TEAMS } from "@/lib/teams";

/**
 * Mientras el equipo está en la landing: empieza a consultar Drive/Sheets y
 * descarga los 30 iconos (~230 KB) para que el selector salga al instante.
 */
export function PrefetchStatus() {
  useEffect(() => {
    prefetchTeamStatus();
    for (const team of TEAMS) new window.Image().src = team.icon;
  }, []);
  return null;
}
