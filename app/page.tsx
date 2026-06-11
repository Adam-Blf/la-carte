"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cover from "@/components/Cover";
import Carte from "@/components/Carte";
import Reservation, { type SlotId } from "@/components/Reservation";
import CommandBar from "@/components/CommandBar";
import Receipt from "@/components/Receipt";
import ThemeToggle from "@/components/ThemeToggle";
import MusicToggle from "@/components/MusicToggle";
import InviteMaker from "@/components/InviteMaker";
import { COURSES } from "@/data/menu";
import { VERSION } from "@/lib/version";
import { musicPrefOff, startMusic } from "@/lib/music";
import { hostInitial, parseHostFromLocation, type Host } from "@/lib/host";

const PLAT_IDS = new Set(
  COURSES.find((c) => c.id === "plats")?.items.map((i) => i.id) ?? [],
);

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [selections, setSelections] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<Set<SlotId>>(new Set());
  const [guestName, setGuestName] = useState("");
  const [billOpen, setBillOpen] = useState(false);
  const [host, setHost] = useState<Host | null>(null);

  // L'hôte voyage dans l'URL (?h=…) · lu après montage, pas de SSR mismatch
  useEffect(() => {
    setHost(parseHostFromLocation());
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSlot = useCallback((id: SlotId) => {
    setSlots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const hasPlat = useMemo(
    () => [...selections].some((id) => PLAT_IDS.has(id)),
    [selections],
  );

  const maison = host ? `Maison ${hostInitial(host)}.` : "Maison A.";

  return (
    <>
      <ThemeToggle />
      {opened && <MusicToggle />}

      <AnimatePresence>
        {!opened && (
          <Cover
            key="cover"
            maison={maison}
            onOpen={() => {
              setOpened(true);
              if (!musicPrefOff()) startMusic();
            }}
          />
        )}
      </AnimatePresence>

      {opened && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="pb-36"
        >
          <Carte selections={selections} onToggle={toggleItem} />
          <Reservation
            slots={slots}
            onToggleSlot={toggleSlot}
            guestName={guestName}
            onGuestName={setGuestName}
          />
          <InviteMaker />

          <footer className="mt-24 px-5 text-center">
            <div className="mx-auto flex w-32 items-center gap-3">
              <span className="filet flex-1" />
              <span aria-hidden className="text-sm text-brass">
                ❦
              </span>
              <span className="filet flex-1" />
            </div>
            <p className="smallcaps mt-6 text-xs text-ink-soft">
              {maison} · service en salle assuré par le chef lui-même
            </p>
            <p className="smallcaps mt-2 text-xs text-ink-soft/60">
              carte v{VERSION} · paris
            </p>
          </footer>
        </motion.main>
      )}

      {opened && (
        <CommandBar
          dishCount={selections.size}
          slotCount={slots.size}
          hasPlat={hasPlat}
          onRequestBill={() => setBillOpen(true)}
        />
      )}

      <AnimatePresence>
        {billOpen && (
          <Receipt
            key="receipt"
            selections={selections}
            slots={slots}
            guestName={guestName}
            host={host}
            onClose={() => setBillOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
