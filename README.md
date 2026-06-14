# MealBuddy — Frontend (Next.js 15)

Milestone 1 of the prototype → production migration: the Next.js foundation with the
**landing** and **auth** pages ported pixel-faithfully from the original HTML, the routing
finally connected (no dead links), and the auth flow wired end-to-end.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand · Axios ·
React Hook Form · Zod · Sonner (toasts).

## Run it

```bash
npm install
cp .env.example .env.local   # optional until the backend exists
npm run dev                  # http://localhost:3000
```

Build / checks:

```bash
npm run build       # production build (passes; all routes prerender)
npm run typecheck   # tsc --noEmit
npm run lint
```

## What works now

- `/` — landing page, faithful port of `layout.html` (scroll-reveal + hero meal toggle preserved).
- `/auth` — register (2-step) + login, faithful port of `input.html`, now powered by
  React Hook Form + Zod with the password-strength meter intact.
- Full journey is clickable: **landing → auth → onboarding → dashboard**.
- Smooth route transitions (Framer), toast notifications, visible keyboard focus, and
  reduced-motion support added **without** changing the visual design.

Auth currently runs in **mock mode** (`BACKEND_READY = false` in `src/lib/api.ts`): registering
or signing in creates a local session so you can walk the flow today. Flipping that flag to the
real Django endpoints is the M4 task — the store and Axios client are already shaped for it.

## How the design was preserved

Each page's original CSS is ported **verbatim** into a scoped stylesheet
(`src/app/(marketing)/landing.css`, `src/app/auth/auth.css`) so there is zero visual drift.
Stylesheets are scoped to a page wrapper (`.mb-landing`, `.mb-auth`) to stop pages bleeding into
one another. The palette decision from the blueprint is implemented: the **app's indigo theme is
the canonical token set** (`globals.css` + `tailwind.config.ts`), while the **landing keeps its
own navy/mint surface**, scoped to `.mb-landing`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx            root: fonts + providers
│   ├── template.tsx          Framer route transitions
│   ├── globals.css           canonical indigo tokens + base
│   ├── (marketing)/page.tsx  landing  (+ landing.css)
│   ├── auth/page.tsx         auth      (+ auth.css)
│   └── (app)/                dashboard + onboarding placeholders (full ports in M2)
├── components/
│   ├── marketing/LandingInteractions.tsx
│   └── auth/AuthClient.tsx
├── lib/        api (axios) · calc (BMI/TDEE) · utils
├── stores/     auth (Zustand, persisted)
├── schemas/    auth (Zod)
└── types/
middleware.ts   route-guard skeleton (enforced in M4)
```

## Fidelity notes — preserved as-is, please confirm

These look like leftovers in the original prototype. They were kept **exactly** as they render so
nothing changed silently; flag if you'd like them corrected:

1. The landing's hero CTA buttons and nav menu links are commented out in the source, so they
   don't render — the only entry point is the nav "Get started".
2. The landing's primary-button CSS sets **red** text (`#bb2f2f`), and a couple of color values use
   invalid `(rgb(...))` syntax (so they fall back).
3. Several landing sections say **"NutriGuide"** instead of "MealBuddy".
4. The metrics page has a **duplicated goal card** ("Gain muscle" twice; the 4th is "Gain weight").
   Relevant in M2.

## Next: Milestone 2

Port the onboarding metrics form (live BMI/TDEE — math already in `src/lib/calc.ts`) and the
recommendations dashboard (sidebar, weekly plan, food modal, nutrition donut, ML feedback),
componentised with skeletons, animated counters/charts, and the glassmorphism layer.
