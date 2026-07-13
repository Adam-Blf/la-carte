"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHRASES = [
  "Ce soir, la maison vous offre l'essentiel : du temps.",
  "L'addition ? Déjà réglée. Le reste vous appartient.",
  "Chaque rendez-vous mérite sa propre légende.",
  "La meilleure soirée est celle qu'on n'avait pas prévu d'avoir.",
  "On ne choisit pas ce qu'on aime. On compose.",
  "Le secret d'une belle soirée : ne rien presser.",
  "Deux couverts, une fenêtre sur la soirée.",
  "Ce soir, vous êtes les auteurs du menu.",
  "Tout commence par une table pour deux.",
  "Un seul ingrédient obligatoire : avoir envie d'y être.",
  "Le chef recommande de laisser la soirée surprendre.",
  "Certains soirs se souviennent d'eux-mêmes.",
  "La carte change. Les souvenirs, eux, restent.",
  "Service continu jusqu'aux dernières étoiles.",
  "La maison n'accepte que les réservations sincères.",
  "Mise en bouche, plat, dessert. Et puis encore.",
  "Ce qu'on commande ensemble finit toujours mieux.",
  "Aucune allergie à la bonne humeur.",
  "La soirée idéale n'existe pas. La vôtre, si.",
  "Nous ne servons que des soirées uniques.",
  "Fermé le lendemain qui gronde. Ouvert ce soir.",
  "Prix fixe : zéro euro, une présence.",
  "La table est mise. Il ne manque que vous.",
  "Tout le monde peut cuisiner une belle soirée.",
  "Notre spécialité : les moments qu'on raconte après.",
];

function pick(exclude: number): number {
  let next: number;
  do { next = Math.floor(Math.random() * PHRASES.length); } while (next === exclude);
  return next;
}

export default function Tagline() {
  const [idx, setIdx] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * PHRASES.length));
  }, []);

  const next = useCallback(() => {
    setIdx((prev) => pick(prev ?? 0));
    setKey((k) => k + 1);
  }, []);

  if (idx === null) return null;

  return (
    <div className="flex flex-col items-center gap-4 pt-6">
      <div className="relative h-14 w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.p
            key={key}
            className="absolute inset-0 flex items-center justify-center px-2 text-center text-base italic text-ink-soft"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {PHRASES[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={next}
        aria-label="Nouvelle phrase"
        className="smallcaps cursor-pointer text-xs text-brass/60 transition-colors duration-300 hover:text-brass"
      >
        ✦ une autre
      </button>
    </div>
  );
}
