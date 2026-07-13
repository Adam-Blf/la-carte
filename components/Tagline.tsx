"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "form" | "loading" | "result";

export default function Tagline() {
  const [step, setStep] = useState<Step>("form");
  const [personne, setPersonne] = useState("");
  const [situation, setSituation] = useState("");
  const [vibe, setVibe] = useState("");
  const [phrases, setPhrases] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");

  async function generate() {
    if (!personne.trim() || !situation.trim()) return;
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/accroche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personne, situation, vibe }),
      });
      const data = await res.json();
      if (!res.ok || !data.phrases?.length) throw new Error(data.error || "Erreur");
      setPhrases(data.phrases);
      setSelected(0);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur serveur");
      setStep("form");
    }
  }

  return (
    <div className="mt-10 w-full border-t border-line pt-8">
      <p className="smallcaps mb-6 text-center text-xs text-brass tracking-widest">
        ✦ Générateur d'accroches ✦
      </p>

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="smallcaps text-xs text-ink-soft">
                Qui est-elle / il ?
              </label>
              <input
                type="text"
                value={personne}
                onChange={(e) => setPersonne(e.target.value)}
                placeholder="ex. grande brune, l'air artiste, un livre à la main…"
                className="border border-line bg-transparent px-4 py-3 text-sm text-ink placeholder-ink-soft/50 outline-none focus:border-brass transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="smallcaps text-xs text-ink-soft">
                La situation / le lieu
              </label>
              <input
                type="text"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="ex. café du 11e, vernissage, quai de métro…"
                className="border border-line bg-transparent px-4 py-3 text-sm text-ink placeholder-ink-soft/50 outline-none focus:border-brass transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="smallcaps text-xs text-ink-soft">
                Vibe souhaitée
              </label>
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="ex. poétique, audacieux, léger et drôle… (optionnel)"
                className="border border-line bg-transparent px-4 py-3 text-sm text-ink placeholder-ink-soft/50 outline-none focus:border-brass transition-colors"
              />
            </div>

            {error && (
              <p className="text-center text-xs text-brass/80 italic">{error}</p>
            )}

            <button
              type="button"
              onClick={generate}
              disabled={!personne.trim() || !situation.trim()}
              className="smallcaps mt-2 cursor-pointer border border-brass px-8 py-3 text-sm text-ink transition-colors duration-300 hover:bg-brass hover:text-paper disabled:opacity-40 disabled:cursor-default"
            >
              Générer des accroches
            </button>
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <motion.span
              className="text-2xl text-brass"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              ✦
            </motion.span>
            <p className="smallcaps text-xs text-ink-soft">La maison réfléchit…</p>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-center text-base italic text-ink leading-relaxed px-2"
              >
                « {phrases[selected]} »
              </motion.p>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-1">
              {phrases.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === selected ? "w-6 bg-brass" : "w-1.5 bg-line"
                  }`}
                  aria-label={`Accroche ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-3">
              <button
                type="button"
                onClick={() => setSelected((s) => (s + 1) % phrases.length)}
                className="smallcaps text-xs text-ink-soft hover:text-brass transition-colors"
              >
                ✦ suivante
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="smallcaps text-xs text-ink-soft hover:text-brass transition-colors"
              >
                ↩ nouveau contexte
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
