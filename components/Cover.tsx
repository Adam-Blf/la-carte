"use client";

import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.25 + i * 0.18, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] as const },
  }),
};

export default function Cover({
  maison,
  onOpen,
  onAccroche,
}: {
  maison: string;
  onOpen: () => void;
  onAccroche: () => void;
}) {
  return (
    <motion.section
      className="fixed inset-0 z-40"
      style={{ perspective: "2200px" }}
      exit={{ opacity: 0, transition: { duration: 0.3, delay: 1.15 } }}
      aria-label="Couverture de la carte"
    >
      {/* La couverture pivote sur sa tranche gauche, comme une carte qu'on ouvre */}
      <motion.div
        className="flex h-full w-full items-center justify-center overflow-y-auto bg-paper p-4 sm:p-8"
        style={{ transformOrigin: "left center", willChange: "transform" }}
        exit={{
          rotateY: -112,
          boxShadow: "70px 0 90px rgba(0, 0, 0, 0.38)",
          transition: { duration: 1.25, ease: [0.65, 0, 0.22, 1] },
        }}
      >
      <div className="relative flex h-full min-h-fit w-full items-center justify-center border border-line py-8">
        <div className="pointer-events-none absolute inset-2 border border-line" />

        {/* Ornements d'angle */}
        {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(
          (pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute ${pos} font-display text-sm text-brass`}
            >
              ✦
            </span>
          ),
        )}

        <div className="flex max-w-2xl flex-col items-center px-6 text-center">
          <motion.p
            className="smallcaps text-sm text-ink-soft"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={0}
          >
            {maison} · depuis toujours
          </motion.p>

          <motion.div
            className="mt-6 w-[clamp(220px,70vw,480px)]"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={1}
            aria-label="La Carte"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" aria-hidden>
              <line x1="12" y1="50" x2="48" y2="50" stroke="currentColor" strokeWidth="0.75" className="text-brass" opacity="0.5"/>
              <circle cx="52" cy="50" r="1.5" fill="currentColor" className="text-brass" opacity="0.7"/>
              <text x="160" y="44" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="300" fontSize="40" fill="currentColor" textAnchor="middle" letterSpacing="2" className="text-ink">La Carte</text>
              <text x="160" y="62" fontFamily="Georgia, serif" fontSize="8.5" fill="currentColor" textAnchor="middle" letterSpacing="5" className="text-brass">MAISON A.</text>
              <line x1="108" y1="72" x2="146" y2="72" stroke="currentColor" strokeWidth="0.5" className="text-brass" opacity="0.45"/>
              <text x="160" y="76" fontFamily="Georgia, serif" fontSize="7" fill="currentColor" textAnchor="middle" className="text-brass">✦</text>
              <line x1="174" y1="72" x2="212" y2="72" stroke="currentColor" strokeWidth="0.5" className="text-brass" opacity="0.45"/>
              <circle cx="268" cy="50" r="1.5" fill="currentColor" className="text-brass" opacity="0.7"/>
              <line x1="272" y1="50" x2="308" y2="50" stroke="currentColor" strokeWidth="0.75" className="text-brass" opacity="0.5"/>
            </svg>
          </motion.div>

          <motion.p
            className="smallcaps mt-4 text-base text-brass"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={2}
          >
            des rendez-vous
          </motion.p>

          <motion.div
            className="mt-8 flex w-40 items-center gap-3"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <span className="filet flex-1" />
            <span aria-hidden className="text-brass">
              ❦
            </span>
            <span className="filet flex-1" />
          </motion.div>

          <motion.p
            className="mt-8 max-w-md text-lg italic text-ink-soft"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={4}
          >
            Une invitation à composer la soirée idéale · mise en bouche, plat,
            dessert. La maison s'occupe du reste.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col items-center gap-3 sm:flex-row"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={5}
          >
            <motion.button
              type="button"
              onClick={onOpen}
              className="smallcaps cursor-pointer border border-brass px-8 py-4 text-base text-ink transition-colors duration-300 hover:bg-brass hover:text-paper"
              whileTap={{ scale: 0.97 }}
            >
              Consulter la carte
            </motion.button>
            <motion.button
              type="button"
              onClick={onAccroche}
              className="smallcaps cursor-pointer border border-line px-8 py-4 text-base text-ink-soft transition-colors duration-300 hover:border-brass hover:text-ink"
              whileTap={{ scale: 0.97 }}
            >
              L'art de l'approche
            </motion.button>
          </motion.div>

          <motion.p
            className="mt-10 max-w-xs text-base italic text-ink-soft"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={6}
          >
            « Tout le monde peut cuisiner. »
            <span className="smallcaps mt-1 block text-xs not-italic">
              Chef Gusteau
            </span>
          </motion.p>

          <motion.p
            className="smallcaps mt-6 text-xs text-ink-soft"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={7}
          >
            Table pour deux · service unique
          </motion.p>

        </div>
      </div>
      </motion.div>
    </motion.section>
  );
}
