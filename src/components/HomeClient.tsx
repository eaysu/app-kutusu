"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "./Hero";
import { SubmissionForm } from "./SubmissionForm";
import { LockedFeed } from "./LockedFeed";
import { Feed } from "./Feed";
import { BottomNav } from "./BottomNav";
import { CookieToast, CookieWarningBubble } from "./CookieWarning";
import { EditIdeaModal } from "./EditIdeaModal";
import { isLegacyAnalysis, type Idea } from "@/lib/ideas";
import { t, type Lang } from "@/lib/i18n";

type Tab = "feed" | "mine";

type Props = {
  myIdea: Idea | null;
  feed: Idea[];
  myUpvotedIds: string[];
  ideaCount: number;
  lang: Lang;
};

const fadeSwap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const },
};

export function HomeClient({
  myIdea,
  feed,
  myUpvotedIds,
  ideaCount,
  lang,
}: Props) {
  const router = useRouter();
  const [toastVisible, setToastVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("mine");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const unlocked = myIdea !== null;
  const needsAnalysis =
    myIdea !== null &&
    (!myIdea.uniqueness ||
      !myIdea.aiAnalysis ||
      isLegacyAnalysis(myIdea.aiAnalysis));
  const analyzeAttempted = useRef<string | null>(null);

  useEffect(() => {
    if (!needsAnalysis || !myIdea) return;
    if (analyzeAttempted.current === myIdea.id) return;
    analyzeAttempted.current = myIdea.id;
    (async () => {
      try {
        const res = await fetch("/api/ideas/analyze", { method: "POST" });
        if (res.ok) router.refresh();
      } catch {
        /* swallow */
      }
    })();
  }, [needsAnalysis, myIdea, router]);

  async function handleSubmit(data: { title: string; description: string }) {
    setSubmitError(null);
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, similarLinks: [] }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setSubmitError(payload.error ?? "submit_failed");
      return;
    }
    setToastVisible(true);
    setTab("mine");
    router.refresh();
  }

  async function handleEditSave(data: { title: string; description: string }) {
    setEditError(null);
    const res = await fetch("/api/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, similarLinks: [] }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setEditError(payload.error ?? "edit_failed");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <>
      <main className="flex-grow w-full max-w-[800px] mx-auto px-6 py-12 flex flex-col gap-12 pb-[120px] md:pb-12">
        <AnimatePresence mode="wait" initial={false}>
          {!unlocked ? (
            <motion.div
              key="locked"
              className="flex flex-col gap-12"
              {...fadeSwap}
            >
              <Hero ideaCount={ideaCount} lang={lang} />
              <SubmissionForm
                onSubmit={handleSubmit}
                serverError={submitError}
                lang={lang}
              />
              <LockedFeed lang={lang} />
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              className="flex flex-col gap-12"
              {...fadeSwap}
            >
              <div className={tab === "feed" ? "contents" : "hidden md:contents"}>
                <Feed
                  ideas={feed}
                  initialUpvotedIds={myUpvotedIds}
                  unlocked={unlocked}
                  lang={lang}
                  heading={t(lang, "feed_heading")}
                  onEdit={() => setEditing(true)}
                />
                <CookieWarningBubble lang={lang} />
              </div>
              <div className={tab === "mine" ? "contents" : "hidden"}>
                <Feed
                  ideas={myIdea ? [myIdea] : []}
                  initialUpvotedIds={myUpvotedIds}
                  unlocked={unlocked}
                  lang={lang}
                  heading={t(lang, "my_idea_heading")}
                  initialExpandedId={myIdea?.id ?? null}
                  onEdit={() => setEditing(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {unlocked && <BottomNav active={tab} onChange={setTab} lang={lang} />}

      <CookieToast
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        lang={lang}
      />

      {myIdea && (
        <EditIdeaModal
          idea={myIdea}
          onSave={handleEditSave}
          onClose={() => setEditing(false)}
          serverError={editError}
          lang={lang}
          open={editing}
        />
      )}
    </>
  );
}
