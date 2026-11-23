"use client";

/* eslint-disable @next/next/no-img-element -- vista previa de un blob local */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import pill from "@/components/PillButton.module.css";
import { compressImage } from "@/lib/image";
import { markDone } from "@/lib/progress";
import type { TeamId } from "@/lib/teams";
import styles from "./PhotoUploader.module.css";

type Status = "idle" | "sending" | "error";

export function PhotoUploader({ team }: { team: TeamId }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Liberar la URL de la vista previa al cambiarla o al salir de la pantalla.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setPreview(picked ? URL.createObjectURL(picked) : null);
    setStatus("idle");
    setError("");
  }

  async function onSend() {
    if (!file) return;
    setStatus("sending");
    setError("");
    try {
      const blob = await compressImage(file);
      const form = new FormData();
      form.append("photo", blob, "foto.jpg");
      form.append("team", team);
      const res = await fetch("/api/photo", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
      // Vuelve a las acciones del equipo, donde "Sube tu foto" aparece como hecha.
      markDone(team, "foto");
      router.replace(`/equipo/${team}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
      setStatus("error");
    }
  }

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className={styles.hiddenInput}
      />

      {preview && <img src={preview} alt="Vista previa" className={styles.preview} />}

      <button
        type="button"
        className={pill.pill}
        onClick={() => inputRef.current?.click()}
        disabled={status === "sending"}
      >
        {file ? "Cambiar foto" : "Elige tu foto"}
      </button>

      {file && (
        <button
          type="button"
          className={pill.pill}
          onClick={onSend}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Enviando…" : "Enviar"}
        </button>
      )}

      {status === "error" && <p className={styles.error}>{error}</p>}

      {status !== "sending" && (
        <Link href={`/equipo/${team}`} className={styles.back}>
          Volver
        </Link>
      )}
    </div>
  );
}
