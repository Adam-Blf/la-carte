"use client";

import { motion } from "framer-motion";
import { COURSES, type Course, type MenuItem } from "@/data/menu";

function SectionHeader({ course }: { course: Course }) {
  return (
    <header className="text-center">
      <p className="smallcaps text-sm text-brass">{course.numeral}</p>
      <h2 className="mt-2 font-display text-4xl font-light italic sm:text-5xl">
        {course.title}
      </h2>
      <p className="mt-3 italic text-ink-soft">{course.subtitle}</p>
      <div className="mx-auto mt-6 flex w-32 items-center gap-3">
        <span className="filet flex-1" />
        <span aria-hidden className="text-sm text-brass">
          ✦
        </span>
        <span className="filet flex-1" />
      </div>
    </header>
  );
}

function CarteItem({
  item,
  index,
  selected,
  onToggle,
}: {
  item: MenuItem;
  index: number;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={selected}
        className={`group w-full cursor-pointer px-3 py-4 text-left transition-colors duration-300 sm:px-5 ${
          selected ? "bg-paper-deep" : "hover:bg-paper-deep/60"
        }`}
      >
        <span className="flex items-baseline">
          <span
            aria-hidden
            className={`mr-3 inline-flex h-5 w-5 shrink-0 translate-y-0.5 items-center justify-center rounded-full border text-[0.65rem] transition-all duration-300 ${
              selected
                ? "border-brass bg-brass text-paper"
                : "border-line text-transparent group-hover:border-brass"
            }`}
          >
            ✓
          </span>
          <span
            className={`font-display text-xl transition-colors duration-300 ${
              selected ? "text-brass" : ""
            }`}
          >
            {item.name}
          </span>
          <span className="leader" aria-hidden />
          <span
            className={`shrink-0 text-base italic ${
              selected ? "text-brass" : "text-ink-soft"
            }`}
          >
            {item.price}
          </span>
        </span>
        <span className="mt-1.5 block pl-8 text-base italic text-ink-soft">
          {item.description}
        </span>
      </button>
    </motion.li>
  );
}

export default function Carte({
  selections,
  onToggle,
}: {
  selections: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8">
      <p className="smallcaps pt-20 text-center text-sm text-ink-soft">
        Composez votre menu · touchez un plat pour le commander
      </p>

      {COURSES.map((course) => (
        <section key={course.id} className="pt-20" aria-label={course.title}>
          <SectionHeader course={course} />
          <ul className="mt-10 space-y-1">
            {course.items.map((item, i) => (
              <CarteItem
                key={item.id}
                item={item}
                index={i}
                selected={selections.has(item.id)}
                onToggle={onToggle}
              />
            ))}
          </ul>
        </section>
      ))}

      <motion.p
        className="mx-auto mt-20 max-w-xl text-center text-sm italic text-ink-soft"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        Prix nets, exprimés en moments. Service compris. Peut contenir des
        traces de flirt. La maison ne pratique aucun supplément pour les
        sourires.
      </motion.p>
    </div>
  );
}
