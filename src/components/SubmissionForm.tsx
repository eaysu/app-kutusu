"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

type Errors = {
  title?: string;
  description?: string;
};

type Props = {
  onSubmit: (data: { title: string; description: string }) => Promise<void> | void;
  serverError?: string | null;
  lang: Lang;
};

export function SubmissionForm({ onSubmit, serverError, lang }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    const tt = title.trim();
    const dd = description.trim();
    if (tt.length < 3) {
      next.title = t(lang, "form_err_title");
    } else if (tt.length > 120) {
      next.title = t(lang, "form_err_too_long");
    } else if (/[<>]/.test(tt)) {
      next.title = t(lang, "form_err_html");
    }
    if (dd.length < 80) {
      next.description = t(lang, "form_err_desc", { n: dd.length });
    } else if (dd.length > 2000) {
      next.description = t(lang, "form_err_too_long");
    } else if (/[<>]/.test(dd)) {
      next.description = t(lang, "form_err_html");
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
    } finally {
      setSubmitting(false);
    }
  }

  function serverErrorText(): string | null {
    if (!serverError) return null;
    if (serverError === "validation") return t(lang, "form_err_validation");
    if (serverError === "moderation") return t(lang, "form_err_moderation");
    if (serverError === "session_already_has_idea") return t(lang, "form_err_session_dup");
    return t(lang, "form_err_generic", { err: serverError });
  }

  return (
    <section
      className="w-full bg-form-cream border-[3px] border-on-background p-6 rounded-3xl shadow-brutal-lg flex flex-col gap-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="idea-title"
            className="text-[14px] font-bold tracking-[0.05em]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {t(lang, "form_title_label")}
          </label>
          <input
            id="idea-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            placeholder={t(lang, "form_title_placeholder")}
            className={`w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none placeholder:text-on-surface-variant/60 disabled:opacity-60 ${
              errors.title ? "border-error" : ""
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          />
          {errors.title && (
            <span className="text-error text-sm font-medium">{errors.title}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="idea-desc"
            className="text-[14px] font-bold tracking-[0.05em]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {t(lang, "form_desc_label")}
          </label>
          <textarea
            id="idea-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder={t(lang, "form_desc_placeholder")}
            className={`w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none placeholder:text-on-surface-variant/60 resize-none disabled:opacity-60 ${
              errors.description ? "border-error" : ""
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          />
          {errors.description && (
            <span className="text-error text-sm font-medium">{errors.description}</span>
          )}
          <span
            className="text-[13px] text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t(lang, "form_detail_hint")}
          </span>
        </div>

        {serverErrorText() && (
          <span className="text-error text-sm font-medium">{serverErrorText()}</span>
        )}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full bg-secondary-container text-on-background border-[4px] border-on-background rounded-2xl py-4 shadow-brutal brutal-press mt-2 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-80"
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "1.3",
          }}
        >
          {submitting && (
            <span className="material-symbols-outlined animate-spin text-[26px]">
              progress_activity
            </span>
          )}
          {submitting ? t(lang, "form_submitting") : t(lang, "form_submit")}
        </button>
      </form>
    </section>
  );
}
