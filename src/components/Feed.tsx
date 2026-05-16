"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { overallScore, type Idea } from "@/lib/analysis";
import { t, type Lang } from "@/lib/i18n";
import { FeedCard } from "./FeedCard";

type Props = {
  ideas: Idea[];
  initialUpvotedIds: string[];
  unlocked: boolean;
  lang: Lang;
  heading: string;
  initialExpandedId?: string | null;
  onEdit?: () => void;
};

export function Feed({
  ideas,
  initialUpvotedIds,
  unlocked,
  lang,
  heading,
  initialExpandedId = null,
  onEdit,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(initialExpandedId);
  const [upvoted, setUpvoted] = useState<Set<string>>(
    () => new Set(initialUpvotedIds),
  );
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(ideas.map((i) => [i.id, i.upvotes])),
  );
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    setExpandedId((curr) => (curr === id ? null : id));
  }

  function upvote(id: string) {
    if (!unlocked) return;
    const currentlyUpvoted = upvoted.has(id);
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (currentlyUpvoted) next.delete(id);
      else next.add(id);
      return next;
    });
    setVoteCounts((vc) => ({
      ...vc,
      [id]: Math.max(0, (vc[id] ?? 0) + (currentlyUpvoted ? -1 : 1)),
    }));

    startTransition(async () => {
      try {
        const res = await fetch(`/api/ideas/${id}/upvote`, { method: "POST" });
        if (!res.ok) throw new Error("upvote_failed");
        const data: { upvoted: boolean; upvotes: number } = await res.json();
        setUpvoted((prev) => {
          const next = new Set(prev);
          if (data.upvoted) next.add(id);
          else next.delete(id);
          return next;
        });
        setVoteCounts((vc) => ({ ...vc, [id]: data.upvotes }));
      } catch {
        setUpvoted((prev) => {
          const next = new Set(prev);
          if (currentlyUpvoted) next.add(id);
          else next.delete(id);
          return next;
        });
        setVoteCounts((vc) => ({
          ...vc,
          [id]: Math.max(0, (vc[id] ?? 0) + (currentlyUpvoted ? 1 : -1)),
        }));
      }
    });
  }

  const sorted = [...ideas].sort((a, b) => {
    const voteDiff = (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0);
    if (voteDiff !== 0) return voteDiff;
    // Tie-break equal upvotes by AI score; unscored ideas rank last.
    const sa = overallScore(a.aiAnalysis) ?? -1;
    const sb = overallScore(b.aiAnalysis) ?? -1;
    return sb - sa;
  });

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2
          className="text-[28px] md:text-[32px] leading-[1.2] font-bold text-on-background"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {heading}
        </h2>
        {sorted.length > 0 && (
          <p
            className="text-[14px] text-on-surface-variant"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t(lang, "feed_upvote_hint")}
          </p>
        )}
      </div>
      <motion.div layout className="flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {sorted.map((idea) => (
            <motion.div key={idea.id} layout>
              <FeedCard
                idea={{ ...idea, upvotes: voteCounts[idea.id] ?? idea.upvotes }}
                expanded={expandedId === idea.id}
                upvoted={upvoted.has(idea.id)}
                lang={lang}
                onToggle={() => toggle(idea.id)}
                onUpvote={() => upvote(idea.id)}
                onEdit={idea.isMine ? onEdit : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
