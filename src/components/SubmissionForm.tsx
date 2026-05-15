"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

type Errors = {
  title?: string;
  description?: string;
};

type Props = {
  onSubmit: (data: { title: string; description: string; similarLinks: string[] }) => void;
  serverError?: string | null;
  lang: Lang;
};

export function SubmissionForm({ onSubmit, serverError, lang }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [similar, setSimilar] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const next: Errors = {};
    if (title.trim().length < 3) {
      next.title = t(lang, "form_err_title");
    }
    if (description.trim().length < 80) {
      next.description = t(lang, "form_err_desc", { n: description.trim().length });
    }
    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const links = similar
      .split(/\s*,\s*|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({ title: title.trim(), description: description.trim(), similarLinks: links });
  }

  function serverErrorText(): string | null {
    if (!serverError) return null;
    if (serverError === "validation") return t(lang, "form_err_validation");
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
            placeholder={t(lang, "form_title_placeholder")}
            className={`w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none placeholder:text-on-surface-variant/60 ${
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
            placeholder={t(lang, "form_desc_placeholder")}
            className={`w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none placeholder:text-on-surface-variant/60 resize-none ${
              errors.description ? "border-error" : ""
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          />
          {errors.description && (
            <span className="text-error text-sm font-medium">{errors.description}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="idea-similar"
            className="text-[14px] font-bold tracking-[0.05em]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {t(lang, "form_similar_label")}
          </label>
          <input
            id="idea-similar"
            type="text"
            value={similar}
            onChange={(e) => setSimilar(e.target.value)}
            placeholder={t(lang, "form_similar_placeholder")}
            className="w-full bg-surface-container-lowest border-[3px] border-on-background rounded-2xl px-4 py-3 text-[18px] focus:border-[5px] focus:outline-none placeholder:text-on-surface-variant/60"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>

        {serverErrorText() && (
          <span className="text-error text-sm font-medium">{serverErrorText()}</span>
        )}
        <button
          type="submit"
          className="w-full bg-secondary-container text-on-background border-[4px] border-on-background rounded-2xl py-4 shadow-brutal brutal-press mt-2"
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "1.3",
          }}
        >
          {t(lang, "form_submit")}
        </button>
      </form>
    </section>
  );
}
