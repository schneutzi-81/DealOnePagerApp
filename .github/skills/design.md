---
name: presales-design
description: Design language for SoftwareOne presales deliverables — dashboards, slides, one-pagers, opportunity views, and customer-facing UI mockups. Use whenever the user asks for any visual artifact in a presales, customer advisory, or sales context: executive dashboards, opportunity trackers, KPI views, proposal mockups, workshop summaries, AI use case discovery boards, pipeline funnels, funding status views, or "Apple-like" / "executive-ready" interfaces around Microsoft, Azure, Fabric, GitHub Copilot, or GitHub Advanced Security. Trigger this skill even when the user does not say the word "design" — phrases like "build me a quick view of the pipeline", "make a one-pager for the customer", "mock up a dashboard for the steering committee", or "show this opportunity to the exec" all qualify.
---

# Presales Design (SoftwareOne, DACH)

A design language for SoftwareOne presales deliverables. Audience is enterprise customers, sellers, IT leaders, and executives in the DACH region. Domain is Microsoft, Azure, Data, AI, GitHub, Cloud, and Digital Transformation.

## Voice

Calm, confident, consulting-grade. The viewer should grasp the business message in seconds, not minutes. Aim closer to an Apple keynote slide than to a traditional enterprise dashboard.

## Mandatory message hierarchy

Every deliverable answers these in order, and the layout reflects that order:

1. What is the business problem?
2. What is the customer opportunity?
3. What is the recommended solution?
4. What is the expected value?
5. What are the risks or blockers?
6. What are the next steps?

If a layout buries the value or leads with technology, restructure it. Executives read top-left to bottom-right and stop early.

## Brand (SoftwareOne 2026)

These override any generic "Apple" palette guidance.

- Primary text / dark surface: Near-Black `#0E0E0E`
- Primary accent: Coral `#F7675E` — use sparingly, for emphasis, CTAs, and key metrics
- Secondary accent: Sky Blue `#62C7EF` — for Microsoft, Azure, cloud, trust signals
- Neutrals: white, light silver, soft gray for backgrounds and dividers
- Typography: Arial only (regular, bold). No display fonts, no Inter, no SF Pro substitutes.
- Slides default to dark-first (Near-Black background, white text, Coral accent). Web/dashboard work defaults to light (white background, Near-Black text, Coral accent).
- One accent per page. Coral OR Sky Blue, not both at once unless one is genuinely subordinate.

Do not introduce purple, green, or gradient accents. If "success" or "AI" needs a color, use Coral for the moment that matters and let the rest stay neutral.

## Layout principles

- Generous whitespace. If the page feels tight, remove a panel rather than shrinking the gaps.
- Card-based composition with subtle shadows, 12–16px corner radius, hairline borders only when needed for separation.
- Group related content visually; never rely on the user to mentally re-sort the page.
- One headline per view. Subordinate content supports it.
- Charts: minimal chrome, no 3D, no heavy gridlines, axis labels in muted gray. Coral for the series being argued for, neutral gray for comparators.
- No stock-photo backgrounds, no decorative icons, no skeuomorphic illustration.

## Typography rules

- Executive headline: large, bold Arial, Near-Black on light or white on dark.
- Metric numbers: oversized (the number is the message), Arial Bold.
- Body: short. If a paragraph runs past three lines, it is doing the wrong job — convert it to a subheading plus bullet, or cut it.
- Bold only for the single most important phrase in a section.

## Component patterns

Reach for these named patterns when they fit the task. They exist so deliverables feel like they come from the same shop.

- Executive summary card — one-line problem, one-line opportunity, one-line recommendation
- KPI tile — single oversized number, label below, optional trend indicator
- Opportunity tracker — customer, stage, value, MS funding status, next step
- Customer account card — logo placeholder, account name, top-of-mind topics, owner
- AI maturity scorecard — four-pillar view (DevOps/GitHub, AI, Data, Apps) tied to AI-Envision
- Proposal timeline — phases, milestones, decision points
- Workshop summary panel — outcomes, decisions, open questions
- Pipeline funnel — stages with values and conversion
- Funding status tracker — Azure Frontier / AMM / Azure Innovate / ECIF / Peanut, status + amount
- Architecture overview card — boxed-and-arrowed, Sky Blue for MS components, neutral for everything else
- Risk and blocker panel — risk, owner, mitigation, RAG status (use Coral only for red)
- Next-best-action section — three or fewer items, each with an owner

## What to avoid

- Multiple accent colors competing on one view
- Heavy gradients, glow effects, or saturated fills
- Dense bullet slides — one message per slide
- Old-school enterprise UI: thick borders, hard drop shadows, busy headers, "ribbon" navigation
- Generic SaaS startup look (gradient hero, three-column feature grid, emoji)
- Buzzword-heavy copy ("synergize", "leverage", "next-gen")
- Technical jargon when a business reader is in the audience

## Content writing style

Short, direct, outcome-driven. Prefer "Cuts forecast error by 30%" over "Leverages advanced ML to optimize forecasting accuracy." If the same claim works for any vendor, it is too vague — make it specific to the customer's situation.

## When the user asks for a refactor

Apply this checklist to existing UI:

- Strip to one accent color
- Increase whitespace; remove every border that isn't load-bearing
- Promote the headline; demote everything else
- Replace dense paragraphs with cards or short bullets
- Re-order to follow the message hierarchy above
- Verify the brand palette and Arial typography

## Format-specific defaults

**Dashboards (web/HTML).** Light background, Near-Black text, one Coral accent. KPI row up top, two-column body. Responsive down to tablet width.

**Slides (PowerPoint).** Dark-first: Near-Black background, white text, Coral for the one thing that matters. One headline per slide. Speaker notes carry the detail; the slide carries the message.

**One-pagers (PDF/print).** Light background, three vertical zones: situation → recommendation → value/next steps. No more than one chart.

**Customer-facing mockups.** Match the customer's apparent maturity. Conservative industries (manufacturing, automotive, pharma) get more neutral and less Coral; tech-forward customers can take more accent.
