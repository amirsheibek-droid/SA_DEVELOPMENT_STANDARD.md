---
name: design-research
description: "Run BEFORE designing any new app screen or UI direction — for this studio, no design work starts from a blank page or a remembered pattern. Grounds every design decision in current, real reference points (award-winning apps, current platform guidelines, what's actually shipping) and explicitly rules out dated/overused patterns before any pixel gets drawn. Trigger whenever the user asks to design, mock up, or template a new app, screen, or product UI."
disable-model-invocation: false
---

# Design research — run before every new app design

The rule: **never design from memory alone.** Every new app UI direction starts with a short, sourced research pass, not a jump straight to a palette and a phone frame. This is what keeps output from converging on the same "AI-generated" defaults (cream + terracotta, near-black + acid green, purple-to-blue gradient hero, Inter-and-rounded-corners-everywhere).

## Process

1. **Research current reference points** (use WebSearch/an Explore-style agent). For the product category in question, find:
   - Current platform/design-system shifts (e.g. iOS Human Interface Guidelines updates, Material Design revisions) — these move roughly yearly and change what looks current vs. dated.
   - 3–5 real, named apps people would recognize in or near the category, and the **specific** interaction/layout/type choice that makes each one distinctive — not "it's clean," but the actual mechanism (e.g. "motion tied to state, not decoration"; "swipeable charts instead of dense tables").
   - What's currently flagged as overused or dated in that space (so it's actively avoided, not accidentally repeated).
   - Do this research fresh each time — don't reuse a stale mental snapshot of "what's trendy." Trends named above have a shelf life of months, not years.

2. **Write a short design plan before building anything**, derived from step 1's findings, not generic defaults:
   - **Color**: 4–6 named hex values, chosen for this subject specifically.
   - **Type**: 2+ typefaces with distinct roles (display / body / utility), paired deliberately.
   - **Layout**: one or two sentences on the structural idea, tied to what the research surfaced.
   - **One deliberate deviation**: name at least one place the design pushes against a pattern flagged as "dated" or "default" in step 1, and say what replaces it.

3. **Build only after the plan is written**, and check the finished screens back against the plan — if a choice reads like the generic default for any similar app, it hasn't used the research; revise it.

4. **Name real sources.** When reporting back, cite what was actually found (app names, guideline names, article titles) — not just "based on current trends." If research can't be done (no web access), say so explicitly rather than presenting memorized patterns as current research.

## Where designs get built

- Prefer building directly in Figma via the `use_figma` / `figma-generate-design` / `figma-generate-library` skills when a Figma connection is available, so work is real, editable, and shareable — not a one-off static mock.
- Use an HTML/artifact mock-up only for quick internal review before Figma work, or when no Figma connection exists.
