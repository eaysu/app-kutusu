"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Idea } from "@/lib/ideas";

type Props = {
  idea: Idea;
  expanded: boolean;
  upvoted: boolean;
  onToggle: () => void;
  onUpvote: () => void;
};

export function FeedCard({ idea, expanded, upvoted, onToggle, onUpvote }: Props) {
  return (
    <motion.div
      layout
      className="bg-surface-container-lowest border-[3px] border-on-background rounded-3xl shadow-brutal-md p-6 flex flex-col gap-2 cursor-pointer"
      onClick={onToggle}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <motion.div layout="position" className="flex items-center gap-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onUpvote();
          }}
          className={`flex items-center gap-1 px-3 py-1 border-[2px] border-on-background rounded-full transition-colors ${
            upvoted ? "bg-tertiary-container" : "bg-surface-variant"
          }`}
          aria-label={`Upvote ${idea.title}`}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined text-xl">keyboard_arrow_up</span>
          <span
            className="text-[20px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {idea.upvotes}
          </span>
        </motion.button>
        <h3
          className="text-[20px] md:text-[24px] leading-[1.3] font-bold flex-grow"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {idea.title}
        </h3>
        <motion.span
          className="material-symbols-outlined text-on-surface-variant"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
        >
          expand_more
        </motion.span>
      </motion.div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 mt-2 pt-3 border-t-2 border-on-background/10">
              <p
                className="text-[16px] leading-[1.5] text-on-surface-variant"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {idea.description}
              </p>
              {idea.similarLinks && idea.similarLinks.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {idea.similarLinks.map((link) => (
                    <li key={link}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full border border-on-background text-[14px] font-bold tracking-[0.05em] underline-offset-2 hover:underline"
                        style={{ fontFamily: "var(--font-label)" }}
                      >
                        {safeHost(link)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function safeHost(link: string): string {
  try {
    const url = new URL(link.startsWith("http") ? link : `https://${link}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}
