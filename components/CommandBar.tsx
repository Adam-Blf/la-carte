"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function CommandBar({
  dishCount,
  slotCount,
  hasPlat,
  onRequestBill,
}: {
  dishCount: number;
  slotCount: number;
  hasPlat: boolean;
  onRequestBill: () => void;
}) {
  const ready = hasPlat && slotCount > 0;
  const hint = !hasPlat
    ? "Il manque un plat à votre menu"
    : slotCount === 0
      ? "Cochez vos disponibilités"
      : `${dishCount} choix · ${slotCount} ${slotCount > 1 ? "créneaux" : "créneau"}`;

  // Toujours cliquable · si la commande est incomplète, on guide vers ce qui manque
  function handleClick() {
    if (ready) {
      onRequestBill();
      return;
    }
    const target = !hasPlat ? "plats" : "reservation";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }

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
          <div className="flex w-full max-w-md items-center justify-between gap-3 border border-line bg-paper/95 py-3 pr-3 pl-4 shadow-xl shadow-black/10 backdrop-blur sm:gap-4 sm:pl-5">
            <p className="smallcaps min-w-0 flex-1 text-xs leading-snug text-ink-soft">
              {hint}
            </p>
            <button
              type="button"
              onClick={handleClick}
              className={`smallcaps shrink-0 cursor-pointer px-4 py-3 text-xs transition-all duration-300 sm:px-5 sm:text-sm ${
                ready
                  ? "bg-brass text-paper hover:bg-brass-bright"
                  : "border border-brass text-brass hover:bg-paper-deep"
              }`}
            >
              {ready ? "L'addition, s'il vous plaît" : "Compléter ma commande"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
