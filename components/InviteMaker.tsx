"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { buildHostLink } from "@/lib/host";

export default function InviteMaker() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const cleanedPhone = phone.replace(/\D/g, "");
    if (!name.trim()) {
      setError("Il manque votre prénom.");
      return;
    }
    if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
      setError(
        "Numéro WhatsApp au format international, ex. 33612345678 (sans le +).",
      );
      return;
    }
    setError("");
    try {
      await navigator.clipboard.writeText(buildHostLink(name, cleanedPhone));
      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    } catch {
      setError("Copie impossible · sélectionnez le lien à la main.");
    }
  }

  return (
    <motion.section
      aria-label="Envoyer votre propre carte"
      className="mx-auto max-w-xl px-5 pt-24 text-center sm:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <p className="smallcaps text-sm text-brass">VI</p>
      <h2 className="mt-2 font-display text-3xl font-light italic sm:text-4xl">
        La carte est à vous
      </h2>
      <p className="mt-3 italic text-ink-soft">
        Vous aussi, invitez quelqu&apos;un · votre prénom, votre WhatsApp, et la
        réservation arrivera chez vous.
      </p>

      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-4">
        <label className="text-left">
          <span className="smallcaps text-xs text-ink-soft">Votre prénom</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jules"
            autoComplete="given-name"
            className="mt-1 w-full border-b border-line bg-transparent pb-1.5 font-display text-xl italic outline-none transition-colors duration-300 placeholder:text-ink-soft/40 focus:border-brass"
          />
        </label>
        <label className="text-left">
          <span className="smallcaps text-xs text-ink-soft">
            Votre numéro WhatsApp · format international
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="33612345678"
            autoComplete="tel"
            inputMode="numeric"
            className="mt-1 w-full border-b border-line bg-transparent pb-1.5 font-mono text-lg outline-none transition-colors duration-300 placeholder:text-ink-soft/40 focus:border-brass"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm italic text-brass">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={copyLink}
          className="smallcaps mt-2 cursor-pointer border border-brass px-8 py-3.5 text-sm transition-colors duration-300 hover:bg-brass hover:text-paper"
        >
          {copied ? "Lien copié · envoyez-le ✦" : "Copier mon lien d'invitation"}
        </button>
      </div>
    </motion.section>
  );
}
