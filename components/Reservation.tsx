"use client";

import { motion } from "framer-motion";
import { DAYS, SERVICES } from "@/data/menu";

export type SlotId = `${(typeof DAYS)[number]["id"]}-${(typeof SERVICES)[number]["id"]}`;

export default function Reservation({
  slots,
  onToggleSlot,
  guestName,
  onGuestName,
}: {
  slots: Set<SlotId>;
  onToggleSlot: (id: SlotId) => void;
  guestName: string;
  onGuestName: (name: string) => void;
}) {
  return (
    <section
      id="reservation"
      aria-label="Carnet de réservations"
      className="mx-auto max-w-3xl px-5 pt-24 sm:px-8"
    >
      <header className="text-center">
        <p className="smallcaps text-sm text-brass">V</p>
        <h2 className="mt-2 font-display text-4xl font-light italic sm:text-5xl">
          Le carnet de réservations
        </h2>
        <p className="mt-3 italic text-ink-soft">
          Cochez tous les services où votre table pourrait être dressée
        </p>
        <div className="mx-auto mt-6 flex w-32 items-center gap-3">
          <span className="filet flex-1" />
          <span aria-hidden className="text-sm text-brass">
            ✦
          </span>
          <span className="filet flex-1" />
        </div>
      </header>

      <motion.div
        className="mx-auto mt-12 max-w-xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-24 sm:w-28" aria-label="Jour" />
              {SERVICES.map((service) => (
                <th
                  key={service.id}
                  scope="col"
                  className="smallcaps pb-4 text-center text-xs font-normal text-ink-soft sm:text-sm"
                >
                  {service.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, di) => (
              <tr key={day.id}>
                <th
                  scope="row"
                  className="smallcaps pr-3 text-left text-xs font-normal whitespace-nowrap text-ink-soft sm:text-sm"
                  style={{ letterSpacing: "0.16em" }}
                >
                  {day.label}
                </th>
                {SERVICES.map((service) => {
                  const id = `${day.id}-${service.id}` as SlotId;
                  const active = slots.has(id);
                  return (
                    <td key={id} className="p-1 sm:p-1.5">
                      <motion.button
                        type="button"
                        onClick={() => onToggleSlot(id)}
                        aria-pressed={active}
                        aria-label={`${day.label}, ${service.label}`}
                        className={`flex h-12 w-full cursor-pointer items-center justify-center border transition-colors duration-300 ${
                          active
                            ? "border-brass bg-brass text-paper"
                            : "border-line hover:border-brass"
                        }`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: di * 0.05, duration: 0.45 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.span
                          aria-hidden
                          className="font-display text-lg"
                          initial={false}
                          animate={
                            active
                              ? { scale: 1, opacity: 1 }
                              : { scale: 0.4, opacity: 0 }
                          }
                          transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        >
                          ✦
                        </motion.span>
                      </motion.button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        className="mx-auto mt-12 max-w-sm text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <label htmlFor="guest-name" className="smallcaps text-sm text-ink-soft">
          La table sera dressée au nom de
        </label>
        <input
          id="guest-name"
          type="text"
          value={guestName}
          onChange={(e) => onGuestName(e.target.value)}
          placeholder="votre prénom"
          autoComplete="given-name"
          className="mt-4 w-full border-b border-line bg-transparent pb-2 text-center font-display text-2xl italic text-ink outline-none transition-colors duration-300 placeholder:text-ink-soft/50 focus:border-brass"
        />
      </motion.div>
    </section>
  );
}
