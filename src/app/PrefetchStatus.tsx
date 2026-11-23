"use client";

import { useEffect } from "react";
import { prefetchTeamStatus } from "@/lib/status";

/** Empieza a consultar Drive/Sheets mientras el equipo está en la landing. */
export function PrefetchStatus() {
  useEffect(() => prefetchTeamStatus(), []);
  return null;
}
