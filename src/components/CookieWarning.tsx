"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { t, type Lang } from "@/lib/i18n";

export function CookieToast({
  visible,
  onDismiss,
  lang,
}: {
  visible: boolean;
  onDismiss: () => void;
  lang: Lang;
}) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-[90%] md:max-w-md"
        >
          <button
            onClick={onDismiss}
            className="w-full bg-primary-container text-on-primary-container border-[3px] border-on-background rounded-2xl px-4 py-3 shadow-brutal-md flex items-center gap-3 text-left"
          >
            <span className="material-symbols-outlined text-2xl flex-shrink-0">
              cookie
            </span>
            <span
              className="text-[14px] leading-snug font-bold tracking-[0.02em]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {t(lang, "cookie_toast")}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CookieWarningBubble({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 flex justify-center pb-8 relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-surface-variant text-on-surface border-[3px] border-on-background rounded-full px-6 py-3 shadow-brutal brutal-press flex items-center gap-3"
      >
        <span className="material-symbols-outlined text-error">warning</span>
        <span
          className="text-[14px] font-bold tracking-[0.05em]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {t(lang, "cookie_bubble")}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full mb-2 max-w-sm bg-surface-container-lowest border-[3px] border-on-background rounded-2xl shadow-brutal p-4 text-[14px]"
          >
            {t(lang, "cookie_detail")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
