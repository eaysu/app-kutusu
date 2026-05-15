"use client";

import { motion } from "framer-motion";
import { t, type Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
};

export function LockedFeed({ lang }: Props) {
  return (
    <section className="w-full flex flex-col items-center gap-6 mt-12 relative">
      <div className="absolute inset-0 bg-surface/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-3xl border-[3px] border-on-background border-dashed">
        <motion.span
          className="material-symbols-outlined text-[96px] text-secondary-container drop-shadow-[4px_4px_0_#1b1b1c] mb-4"
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          lock
        </motion.span>
        <motion.h2
          className="bg-surface px-6 py-2 border-[3px] border-on-background rounded-2xl shadow-brutal rotate-1 text-[32px] font-bold leading-[1.2]"
          style={{ fontFamily: "var(--font-headline)" }}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
        >
          {t(lang, "locked_label")}
        </motion.h2>
      </div>
      <div className="w-full flex flex-col gap-6 opacity-30 blur-[3px]">
        <div className="w-full bg-surface-variant border-[3px] border-on-background rounded-3xl h-32 flex flex-col p-4 gap-4">
          <div className="h-6 bg-surface-dim rounded w-1/3" />
          <div className="h-4 bg-surface-dim rounded w-3/4" />
          <div className="h-4 bg-surface-dim rounded w-1/2" />
        </div>
        <div className="w-full bg-surface-variant border-[3px] border-on-background rounded-3xl h-32 flex flex-col p-4 gap-4">
          <div className="h-6 bg-surface-dim rounded w-1/4" />
          <div className="h-4 bg-surface-dim rounded w-2/3" />
          <div className="h-4 bg-surface-dim rounded w-4/5" />
        </div>
        <div className="w-full bg-surface-variant border-[3px] border-on-background rounded-3xl h-32 flex flex-col p-4 gap-4">
          <div className="h-6 bg-surface-dim rounded w-1/2" />
          <div className="h-4 bg-surface-dim rounded w-3/5" />
          <div className="h-4 bg-surface-dim rounded w-4/5" />
        </div>
      </div>
    </section>
  );
}
