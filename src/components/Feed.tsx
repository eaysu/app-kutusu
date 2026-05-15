"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Idea } from "@/lib/ideas";
import { t, type Lang } from "@/lib/i18n";
import { FeedCard } from "./FeedCard";

type Props = {
  ideas: Idea[];
  initialUpvotedIds: string[];
  unlocked: boolean;
  lang: Lang;
};

export function Feed({ ideas, initialUpvotedIds, unlocked, lang }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const sorted = [...ideas].sort(
    (a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0),
  );

  return (
    <section className="flex flex-col gap-6">
      <h2
        className="text-[28px] md:text-[32px] leading-[1.2] font-bold text-on-background"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {t(lang, "feed_heading")}
      </h2>
      <motion.div layout className="flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {sorted.map((idea) => (
            <motion.div key={idea.id} layout>
              <FeedCard
                idea={{ ...idea, upvotes: voteCounts[idea.id] ?? idea.upvotes }}
                expanded={expandedId === idea.id}
                upvoted={upvoted.has(idea.id)}
                onToggle={() => toggle(idea.id)}
                onUpvote={() => upvote(idea.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
