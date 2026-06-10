"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { COURSES, DAYS, SERVICES } from "@/data/menu";
import type { SlotId } from "@/components/Reservation";

const PHONE = "33786466834";

function Dashes() {
  return <div className="my-3 border-t border-dashed border-receipt-ink/40" />;
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span>{left}</span>
      <span className="flex-1 overflow-hidden whitespace-nowrap text-receipt-ink/35">
        ··············································
      </span>
      <span className="shrink-0">{right}</span>
    </div>
  );
}

// Quelques pourcents de pause entre chaque avancée, comme un vrai massicot
const FEED_Y = ["-105%", "-88%", "-88%", "-70%", "-70%", "-50%", "-50%", "-31%", "-31%", "-14%", "-14%", "0%"];
const FEED_TIMES = [0, 0.09, 0.16, 0.25, 0.32, 0.43, 0.5, 0.62, 0.69, 0.82, 0.89, 1];

export default function Receipt({
  selections,
  slots,
  guestName,
  onClose,
}: {
  selections: Set<string>;
  slots: Set<SlotId>;
  guestName: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [kitchen, setKitchen] = useState<"idle" | "sent" | "error">("idle");

  const orderedCourses = useMemo(
    () =>
      COURSES.map((course) => ({
        course,
        items: course.items.filter((i) => selections.has(i.id)),
      })).filter((c) => c.items.length > 0),
    [selections],
  );

  const slotLabels = useMemo(
    () =>
      DAYS.flatMap((day) =>
        SERVICES.filter((s) => slots.has(`${day.id}-${s.id}` as SlotId)).map(
          (s) => `${day.label} ${s.label.toLowerCase()}`,
        ),
      ),
    [slots],
  );

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
        new Date(),
      ),
    [],
  );

  const summary = useMemo(() => {
    const lines = [
      "Réservation · La Carte de Maison A.",
      guestName ? `Au nom de ${guestName}` : "",
      "",
      "Menu choisi :",
      ...orderedCourses.flatMap(({ course, items }) => [
        `· ${course.title} : ${items.map((i) => i.name).join(", ")}`,
      ]),
      "",
      `Disponibilités : ${slotLabels.join(" / ")}`,
      "",
      "Total : 0,00 € · réglé d'avance par la maison",
    ];
    return lines.filter((l, i) => l !== "" || lines[i - 1] !== "").join("\n");
  }, [orderedCourses, slotLabels, guestName]);

  const whatsappUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(summary)}`;

  // Dès que l'addition sort, la commande part en cuisine (une seule fois par contenu)
  useEffect(() => {
    let cancelled = false;
    try {
      if (sessionStorage.getItem("carte-last-sent") === summary) {
        setKitchen("sent");
        return;
      }
    } catch {
      // stockage privé bloqué · on enverra quand même
    }
    fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, guestName }),
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setKitchen("sent");
          try {
            sessionStorage.setItem("carte-last-sent", summary);
          } catch {
            // tant pis pour la déduplication
          }
        } else {
          setKitchen("error");
        }
      })
      .catch(() => {
        if (!cancelled) setKitchen("error");
      });
    return () => {
      cancelled = true;
    };
  }, [summary, guestName]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // presse-papiers indisponible · le bouton WhatsApp reste la voie royale
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Votre addition"
    >
      <div
        className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center px-4 pb-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fente de l'imprimante */}
        <div className="sticky top-0 z-10 h-6 w-full max-w-[360px] rounded-b-md bg-ink shadow-lg shadow-black/40" />

        <div className="w-full max-w-[360px] overflow-hidden">
          <motion.div
            className="tooth-bottom bg-receipt-paper px-6 pt-6 pb-10 font-mono text-[13px] leading-relaxed text-receipt-ink shadow-2xl"
            initial={{ y: "-105%" }}
            animate={{ y: FEED_Y }}
            transition={{ duration: 3.2, times: FEED_TIMES, ease: "linear" }}
          >
            <div className="text-center">
              <p className="text-lg font-semibold tracking-[0.3em]">MAISON A.</p>
              <p className="mt-1">la carte des rendez-vous</p>
              <p className="text-receipt-ink/60">
                quelque part entre deux fous rires
              </p>
              <p className="mt-2 text-receipt-ink/60">
                {today} · ticket nº 0002 · table 02
              </p>
            </div>

            <Dashes />

            {orderedCourses.map(({ course, items }) => (
              <div key={course.id} className="mb-2">
                <p className="font-semibold uppercase">{course.title}</p>
                {items.map((item) => (
                  <div key={item.id} className="mt-1">
                    <Row left={`1× ${item.name}`} right="" />
                    <p className="pl-4 text-receipt-ink/60">{item.price}</p>
                  </div>
                ))}
              </div>
            ))}

            <Dashes />

            <Row left="SOUS-TOTAL" right="inestimable" />
            <Row left="TVA (100% intentions)" right="incluse" />
            <Row left="POURBOIRE" right="en sourires" />
            <div className="mt-2 text-base font-semibold">
              <Row left="TOTAL" right="0,00 €" />
            </div>
            <p className="mt-1 text-center font-semibold uppercase">
              réglé d&apos;avance par la maison
            </p>

            <Dashes />

            <p className="font-semibold uppercase">Disponibilités retenues</p>
            {slotLabels.length > 0 ? (
              slotLabels.map((label) => <p key={label}>· {label}</p>)
            ) : (
              <p className="text-receipt-ink/60">à préciser au comptoir</p>
            )}

            {guestName && (
              <>
                <Dashes />
                <p className="text-center">
                  table dressée au nom de{" "}
                  <span className="font-semibold uppercase">{guestName}</span>
                </p>
              </>
            )}

            <Dashes />

            <div className="relative">
              <div className="barcode" aria-hidden />
              <p className="mt-1 text-center tracking-[0.5em] text-receipt-ink/60">
                0002·MAISON·A
              </p>

              <motion.div
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 -rotate-12 border-4 border-double border-brass px-4 py-2 text-center"
                initial={{ opacity: 0, scale: 2.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5, type: "spring", stiffness: 320, damping: 18 }}
              >
                <p className="text-sm font-semibold tracking-[0.2em] text-brass">
                  RÉSERVATION
                </p>
                <p className="text-sm font-semibold tracking-[0.2em] text-brass">
                  CONFIRMÉE
                </p>
              </motion.div>
            </div>

            <p className="mt-8 text-center font-semibold">
              MERCI DE VOTRE VISITE
            </p>
            <p className="text-center">à très vite · A.</p>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 flex w-full max-w-[360px] flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.9, duration: 0.6 }}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="smallcaps border border-brass-bright bg-brass-bright px-6 py-4 text-center text-base text-[#0a1422] transition-opacity hover:opacity-90"
          >
            Envoyer ma réservation
          </a>
          <button
            type="button"
            onClick={copySummary}
            className="smallcaps cursor-pointer border border-paper/50 px-6 py-3 text-sm text-paper transition-colors hover:border-paper"
          >
            {copied ? "Récapitulatif copié ✦" : "Copier le récapitulatif"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="smallcaps cursor-pointer px-6 py-2 text-sm text-paper/70 transition-colors hover:text-paper"
          >
            Retourner à la carte
          </button>
          <p
            className="text-center font-mono text-xs text-paper/60"
            aria-live="polite"
          >
            {kitchen === "sent"
              ? "✦ commande transmise en cuisine"
              : kitchen === "error"
                ? "la cuisine est injoignable · pensez au bouton WhatsApp"
                : "transmission de la commande en cuisine…"}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
