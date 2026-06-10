"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function CommandBar({
  dishCount,
  slotCount,
  ready,
  onRequestBill,
}: {
  dishCount: number;
  slotCount: number;
  ready: boolean;
  onRequestBill: () => void;
}) {
  const hint =
    dishCount === 0
      ? "Choisissez au moins un plat"
      : slotCount === 0
        ? "Indiquez vos disponibilités"
        : `${dishCount} choix · ${slotCount} ${slotCount > 1 ? "créneaux" : "créneau"}`;

  return (
    <AnimatePresence>
      {dishCount > 0 && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-5"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          <div className="flex w-full max-w-md items-center justify-between gap-4 border border-line bg-paper/95 py-3 pr-3 pl-5 shadow-xl shadow-black/10 backdrop-blur">
            <p className="smallcaps text-xs text-ink-soft">{hint}</p>
            <button
              type="button"
              onClick={onRequestBill}
              disabled={!ready}
              className={`smallcaps shrink-0 px-5 py-3 text-sm transition-all duration-300 ${
                ready
                  ? "cursor-pointer bg-brass text-paper hover:bg-brass-bright"
                  : "cursor-not-allowed border border-line text-ink-soft/60"
              }`}
            >
              L&apos;addition, s&apos;il vous plaît
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
