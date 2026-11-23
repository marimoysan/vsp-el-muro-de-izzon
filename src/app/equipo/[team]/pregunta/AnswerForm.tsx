"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import pill from "@/components/PillButton.module.css";
import { markDone } from "@/lib/progress";
import { MAX_ANSWER_LENGTH, MIN_ANSWER_LENGTH, QUESTION, type TeamId } from "@/lib/teams";
import styles from "./AnswerForm.module.css";

export function AnswerForm({ team }: { team: TeamId }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Se cuenta sin espacios al principio/final, igual que valida el servidor.
  const length = answer.trim().length;
  const tooShort = length < MIN_ANSWER_LENGTH;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team, answer }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la respuesta");
      // Vuelve a las acciones del equipo, donde la pregunta aparece como hecha.
      markDone(team, "pregunta");
      router.replace(`/equipo/${team}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la respuesta");
      setSending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label htmlFor="answer" className={styles.question}>
        {QUESTION}
      </label>

      <textarea
        id="answer"
        className={styles.textarea}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        maxLength={MAX_ANSWER_LENGTH}
        placeholder={`Mín ${MIN_ANSWER_LENGTH} - Máx ${MAX_ANSWER_LENGTH} caracteres.`}
        disabled={sending}
      />

      <p className={tooShort ? styles.counter : `${styles.counter} ${styles.counterOk}`}>
        {tooShort
          ? `${length} / ${MAX_ANSWER_LENGTH} · faltan ${MIN_ANSWER_LENGTH - length}`
          : `${length} / ${MAX_ANSWER_LENGTH}`}
      </p>

      <button type="submit" className={pill.pill} disabled={tooShort || sending}>
        {sending ? "Enviando…" : "Enviar"}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
