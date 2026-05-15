# App Kutusu

A playful, anonymous app-idea wall. Share one idea, see them all.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 with custom Neobrutalism-Lite tokens
- Supabase (Postgres) for storage
- OpenAI for one-shot idea analysis (cached on submit)
- Framer Motion for accordion / toast / layout animations
- Quicksand + Rubik (Google Fonts), Material Symbols Outlined for icons

## Getting started

```bash
cp .env.example .env.local   # fill SUPABASE_* and OPENAI_API_KEY
# then in Supabase SQL editor, run supabase/schema.sql once
npm install
npm run dev
```

Open http://localhost:3000.

If env is empty the app falls back to an in-memory store so the UI still works
locally; data is lost on server restart.

## Layout

- `src/app/` — App Router pages and API routes (`/api/ideas`, `/api/ideas/[id]/upvote`, `/api/ideas/analyze`, `/api/lang`)
- `src/components/` — Client/server UI pieces (TopAppBar, Hero, Feed, MyIdeaCard, …)
- `src/lib/` — `ideas.ts` (data layer), `session.ts` (cookie), `i18n.ts` (TR/EN dictionary), `lang.ts` (locale resolution), `ai.ts` (OpenAI), `supabase.ts` (service-role client)
- `supabase/schema.sql` — Database schema with triggers for upvote count + `updated_at`

## i18n

Default Turkish; falls back to English when the browser's `Accept-Language` does
not include `tr`. Users can toggle TR/EN from the top app bar; the choice is
persisted in the `ak_lang` cookie.
