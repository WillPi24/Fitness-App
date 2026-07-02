# Helm — Positioning Plan: Physique / Bodybuilding Niche

**Decision (July 2026):** Keep the product all-in-one, but market and present Helm as a
**physique / bodybuilding progress tracker**. The story: *"Track the results, not just the workouts."*

## Why this niche

- The founder (William) is a bodybuilder — authentic content, community presence, and
  feature instincts are only possible in a sport you actually do.
- Helm's strongest unique material is physique-native: progress photos with pose/date
  tagging + side-by-side compare, weekly muscle map, macro + micronutrient tracking,
  body measurements, bodyweight trends.
- No incumbent owns "your physique progress in one place." Hevy/Strong own logging,
  MacroFactor owns nutrition — but photos, measurements, muscle map, and diet are
  currently scattered across 3–4 apps. Helm consolidates them.
- The no-fluff / no-gamification philosophy fits bodybuilders: process-driven, allergic to gimmicks.
- The powerlifting suite (Meet Simulator, Attempt Selector) stays as-is — a bonus for
  strength users via Training Focus, but not the marketing story.

## What changes in the app

1. **Onboarding order** — put the Bodybuilding training focus first in the Training Focus
   selection so the flagship audience sees itself first. (No features removed for anyone.)
2. **Free-tier taste of the hook** — let free users take a limited number of progress
   photos (e.g. 1 per month, no side-by-side compare). The signature feature must be
   tasteable before the paywall; side-by-side compare + unlimited photos stay Pro.
   Files: `frontend/src/services/subscriptionConfig.ts`, `frontend/src/services/featureRegistry.ts`.
3. **No other product changes.** This is a positioning shift, not a rebuild.

## What changes in marketing / store presence

4. **App Store / Play listing rewrite** (physique-first):
   - Working title direction: "Helm — Physique & Muscle Tracker"
   - Screenshots lead with: photo side-by-side compare → weekly muscle map → macro
     tracking → workout logging. Powerlifting tools appear last or not at all.
   - Keyword targets: physique tracker, progress photos, muscle tracker, bulk cut,
     body recomposition, macro tracker, bodybuilding log.
5. **helmfit.com** — physique-first landing page; blog/SEO content around bulk/cut
   tracking, progress photo methodology, split balance (muscle map).
6. **Founder-as-user marketing** — document William's own bulk/cut with Helm on
   Reddit (r/bodybuilding, r/naturalbodybuilding), TikTok/Instagram, YouTube.
   "Student who built the physique tracker he wanted" is the story. Costs time, not money.

## Explicitly out of scope

- Removing or hiding any existing features (runners/powerlifters keep working via Training Focus).
- Paid advertising (budget constraint).
- Renaming the app.

## Success signals to watch

- Store page conversion rate after listing rewrite.
- Free→Pro conversion driven by progress-photo limit hits.
- Which Training Focus new users pick (validates the niche bet).
