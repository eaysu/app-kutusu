import { TopAppBar } from "@/components/TopAppBar";
import { HomeClient } from "@/components/HomeClient";
import { getSessionId } from "@/lib/session";
import { getFeed, getIdeaCount, getMyIdea } from "@/lib/ideas";
import { resolveLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [sessionId, lang] = await Promise.all([getSessionId(), resolveLang()]);

  const [myIdea, feedResult, ideaCount] = await Promise.all([
    sessionId ? getMyIdea(sessionId) : Promise.resolve(null),
    sessionId
      ? getFeed(sessionId)
      : Promise.resolve({ ideas: [], myUpvotes: new Set<string>() }),
    getIdeaCount(),
  ]);

  return (
    <>
      <TopAppBar ideaCount={ideaCount} lang={lang} />
      <HomeClient
        myIdea={myIdea}
        feed={feedResult.ideas}
        myUpvotedIds={[...feedResult.myUpvotes]}
        ideaCount={ideaCount}
        lang={lang}
      />
    </>
  );
}
