"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Idea } from "@/lib/ideas";
import { t, type Lang } from "@/lib/i18n";

type Props = {
  idea: Idea;
  onSave: (data: { title: string; description: string }) => void;
  onClose: () => void;
  serverError?: string | null;
  lang: Lang;
  open: boolean;
};

export function EditIdeaModal({
  idea,
  onSave,
  onClose,
  serverError,
  lang,
  open,
}: Props) {
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError(t(lang, "form_err_title"));
      return;
    }
    if (description.trim().length < 80) {
      setError(t(lang, "form_err_desc", { n: description.trim().length }));
      return;
    }
    setError(null);
    onSave({ title: title.trim(), description: description.trim() });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-on-background/40 flex items-center justify-center px-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="w-full max-w-lg bg-form-cream border-[3px] border-on-background rounded-3xl shadow-brutal-lg p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-[24px] leading-[1.3] font-bold"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {t(lang, "edit_modal_heading")}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="material-symbols-outlined p-1"
              >
                close
              </button>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-2">
                <label
                  className="text-[14px] font-bold tracking-[0.05em]"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {t(lang, "form_title_label")}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-[14px] font-bold tracking-[0.05em]"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {t(lang, "form_desc_label")}
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none resize-none"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>
              <span
                className="text-[13px] text-on-surface-variant"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t(lang, "edit_limit_note")} {t(lang, "form_detail_hint")}
              </span>
              {error && (
                <span className="text-error text-sm font-medium">{error}</span>
              )}
              {!error && serverError && (
                <span className="text-error text-sm font-medium">
                  {serverError === "edit_limit"
                    ? t(lang, "edit_modal_err_limit")
                    : t(lang, "edit_modal_err_generic", { err: serverError })}
                </span>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-surface text-on-surface border-[3px] border-on-background rounded-2xl py-3 shadow-brutal brutal-press"
                  style={{
                    fontFamily: "var(--font-label)",
                    fontWeight: 700,
                    fontSize: "14px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t(lang, "edit_modal_cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-container text-on-primary-container border-[4px] border-on-background rounded-2xl py-3 shadow-brutal brutal-press"
                  style={{
                    fontFamily: "var(--font-label)",
                    fontWeight: 700,
                    fontSize: "14px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t(lang, "edit_modal_save")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
