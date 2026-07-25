# Student Wellness Tracker

A wellness + academic-performance tracker for university students — mood, study, sleep,
hydration, exercise, attendance, tasks, goals, journal, and AI-generated insights, in one
dashboard.

This repo is being built in phases.

- ✅ **Phase 1** — project setup, database schema, authentication
- ✅ **Phase 2** — dashboard and core wellness trackers (this commit)
- ⬜ Phase 3 — analytics and charts
- ⬜ Phase 4 — AI wellness assistant
- ⬜ Phase 5 — notifications and gamification (badge-unlock logic, streaks)
- ⬜ Phase 6 — testing, optimization, deployment, docs

## Stack

| Layer      | Choice                                                               |
| ---------- | --------------------------------------------------------------------- |
| Framework  | Next.js 15.5 (App Router), React 19, TypeScript                       |
| Styling    | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)           |
| Forms      | React Hook Form + Zod                                                 |
| Charts     | Recharts (weekly study trend on the dashboard)                        |
| ORM / DB   | Prisma 7 (driver-adapter client) + PostgreSQL                         |
| Auth       | Better Auth (email/password, email verification)                     |
| Email      | Resend                                                                 |
| Storage    | Supabase Storage (not yet wired — no file uploads exist yet)         |
| AI         | Claude API (wired in Phase 4)                                         |
| Deployment | Vercel                                                                 |

**Two open choices from the brief were decided, not left ambiguous:** Better Auth over Clerk,
and the Claude API over OpenAI for the Phase 4 assistant. Both are easy to swap — the auth
surface is isolated to `lib/auth.ts` / `lib/auth-client.ts`, and nothing yet calls an AI
provider.

**Next.js 15 vs 16:** the brief asked for 15, so that's what's pinned (`15.5.21`, current
Maintenance LTS). Next 16 is Active LTS and **Next 15 support ends October 21, 2026**. Nothing
in Phase 1 or 2 uses anything 16-specific, so upgrading later is low-risk — say the word if
you'd rather retarget now.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY at minimum
npx prisma generate
npx prisma db push     # or `npx prisma migrate dev` once you want tracked migrations
npm run db:seed        # populates the achievement catalog
npm run dev
```

**This code hasn't been run** — same caveat as Phase 1: written without package-registry or
database access, so nothing has been through a real compiler. I did a manual consistency pass
before shipping this batch (every `@/` import resolves to a real file, every Zod enum matches
its Prisma enum, the Prisma compound-unique key name matches the schema) but that's not a
substitute for `npm install && npm run typecheck`. Do that first.

## What Phase 2 adds

- **Server actions** (`app/actions/`) — one file per domain (mood, sleep, water, exercise,
  study, attendance/courses, tasks, goals). Every action re-derives the user id from the
  session server-side (`lib/auth-utils.ts`) rather than trusting a client-supplied id, and
  every query is scoped `where: { id, userId }` — the ownership check isn't optional or
  bolted on after the fact.
- **Dashboard overview** (`app/dashboard/page.tsx`) — wellness score (average of today's
  sleep/water/study/exercise vs. goals — see `lib/wellness.ts`), today's stat tiles, mood
  quick-log, hydration one-tap logging, a weekly study-minutes chart, upcoming tasks, active
  goals with live progress, achievement badges, a motivational quote, and an AI-insight
  placeholder card (real in Phase 4). All server-rendered from `lib/dashboard-data.ts`.
- **Nine tracker pages** under `/dashboard/*` — mood, sleep, water, exercise, study (with a
  live start/stop timer, optional 25-minute Pomodoro mode, and course tagging), attendance
  (per-course percentage with a threshold warning), tasks, and goals. Each has a log/create
  form and a history list with delete (soft-delete where the schema has `deletedAt`, hard
  delete for water logs and attendance records, which don't).
- **Journal was deferred, not forgotten** — everything else in the "core wellness trackers"
  scope is done; journal didn't make it into this batch and is the natural start of whatever
  comes next, alongside Phase 3.

## Known rough edges

Flagging these now rather than letting them surface as confusing bugs later:

1. **Day boundaries use server local time, not the student's.** `UserProfile.timezone` exists
   in the schema for exactly this purpose but isn't wired up yet — `lib/wellness.ts`'s
   `startOfDay`/`endOfDay`/`daysAgo` all use the server's local clock. Fine for a single-region
   deploy, wrong once your users span time zones. Worth fixing before Phase 6 (deployment).
2. **The attendance date-picker's default value** (`new Date().toISOString().slice(0, 10)` in
   `attendance-form.tsx`) uses UTC "today," which can be off by one day right around midnight
   in timezones far from UTC. The date is still user-editable, so it's a defaults issue, not a
   data-integrity one — I did fix the more serious version of this bug in the attendance
   *server action* itself, where a `new Date(str)` + `.setHours()` combination was silently
   shifting the stored date backward a day west of UTC.
3. **No delete confirmation.** `DeleteButton` fires immediately on click, anywhere it's used.
   Fine for low-stakes rows (a water glass), less fine for a study session someone spent real
   time logging. Worth a confirm step before this is customer-facing.
4. **Achievement badges don't unlock yet.** The catalog seeds and renders (grayed out until
   unlocked), but nothing evaluates streaks or thresholds to actually grant a `UserAchievement`
   row — that's Phase 5's job, and the dashboard is already wired to display it once it exists.
5. Same auth caveats as Phase 1 still apply (rate limiting, `trustedOrigins`, email-verification
   strictness) — see the Phase 1 notes below if you're reading this fresh.

## Project structure

```
app/
  (auth)/               login, register, forgot-password, reset-password, verify-email
  actions/              server actions — one file per tracker domain
  api/auth/[...all]/    Better Auth's route handler
  dashboard/
    page.tsx            overview (wellness score, widgets)
    mood/ sleep/ water/ exercise/ study/ attendance/ tasks/ goals/   one page each
components/
  ui/                   button, input, label, card — lean primitives, no Radix dependency yet
  auth/                 one form component per auth flow
  landing/               navbar, hero, rhythm-wave, features, gamification strip, footer
  theme/                 dark/light provider + toggle
  dashboard/              header, nav, wellness-score-ring, stat-tile, and one widget per
                          dashboard card (mood, water, weekly chart, tasks, goals, badges,
                          quote/AI-insight, calendar strip) + shared delete-button
  trackers/               per-tracker forms and history lists used by the /dashboard/* pages
lib/
  auth.ts / auth-client.ts / auth-utils.ts   Better Auth config + session helper
  prisma.ts                                   Prisma client singleton (driver-adapter style)
  dashboard-data.ts                           aggregates everything the overview page needs
  today-stats.ts                              shared "today's numbers" fetcher
  wellness.ts                                 pure helpers: score math, attendance rate,
                                               goal progress, mood metadata, quote rotation
  validations/auth.ts, trackers.ts            Zod schemas
prisma/
  schema.prisma      full normalized schema (generator output → /generated/prisma)
  seed.ts             achievement catalog
prisma.config.ts      Prisma 7 CLI config
```

---

**Next up:** Journal, then Phase 3 (analytics/charts — the trend views the brief describes
per-tracker, like monthly study reports and mood trend lines, belong here rather than in
Phase 2's CRUD). Say the word and I'll continue.
