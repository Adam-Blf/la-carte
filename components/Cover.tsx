"use client";

import { motion } from "framer-motion";
import Tagline from "@/components/Tagline";

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
}: {
  maison: string;
  onOpen: () => void;
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

          <motion.h1
            className="mt-6 font-display text-[clamp(3.5rem,14vw,9rem)] leading-none font-light italic"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={1}
          >
            La Carte
          </motion.h1>

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

          <motion.button
            type="button"
            onClick={onOpen}
            className="smallcaps mt-12 cursor-pointer border border-brass px-10 py-4 text-base text-ink transition-colors duration-300 hover:bg-brass hover:text-paper"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={5}
            whileTap={{ scale: 0.97 }}
          >
            Consulter la carte
          </motion.button>

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

          <motion.div
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={8}
            className="w-full"
          >
            <Tagline />
          </motion.div>
        </div>
      </div>
      </motion.div>
    </motion.section>
  );
}
