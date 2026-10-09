# TokenPause

**A five-minute decision room before you pay a property token.**

TokenPause helps someone who is being asked to pay a token amount for a property organise
what they know, what evidence they still need, and who they should involve — before
transferring money. Six short questions produce a personalised "Before You Pay" board: the
details they already hold, the questions to ask next, a few concrete actions, and a calm
pressure check. The board turns into a plain-text summary they can copy and discuss with
family, a co-buyer, or an independent lawyer.

---

## Independent-concept disclaimer

TokenPause is an **independent portfolio concept by Urval**. It is not affiliated with
BhuMe, a law firm, a property broker, a government body, or any property-verification
service.

TokenPause is an educational decision-support prototype. It does not verify a property,
provide legal advice, or replace independent professional review.

All example data is fictional. No real people, properties, documents, customer data or
government records are used anywhere in this project.

---

## Local setup

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`) and builds the static site into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |

Stack: React 19 + TypeScript + Vite. No backend, no database, no authentication, no
payments, no document upload, no third-party APIs, and no runtime dependencies beyond
React.

---

## Product insight and target user

The important moment is not when someone searches for a property report. It is the
high-pressure moment when someone says:

> "The broker needs a token today."

At that point the buyer often feels urgency before they have organised what they know,
what they need to ask, or what deserves independent review. Documents may exist without
being understood; a claim may have been made verbally and never written down.

**Target user:** a first-time or infrequent property buyer — typically in a metro or
tier-2 city — who has been asked for a token amount and has hours or days, not weeks, to
respond. They are not looking for a legal opinion in that moment. They are looking for a
way to think clearly and to bring other people into the decision.

TokenPause takes that urgency and turns it into a discussion plan. It never produces a
conclusion about the property.

---

## Core user journey

1. A visitor arrives from a short-form content campaign (or directly).
2. The hero explains the product in one line and offers two ways in.
3. They start the guided decision room.
4. They answer six short questions (about one to two minutes; uncertainty is a valid
   answer and any question can be skipped).
5. TokenPause builds a personalised **Before You Pay** board.
6. They tick off actions, add a note, and can come back to the board after a refresh.
7. They generate and copy a decision summary for family, a lawyer, or another advisor.
8. They can open the Growth Lab to see how the funnel would be measured.
9. Every meaningful interaction updates browser-local prototype analytics.

---

## Main interactions

- **Guided six-step flow** with a progress rail, working Previous/Next, jump-to-question,
  restart, and answers preserved when navigating backward.
- **Exclusive multi-select options** — choosing "Nothing collected yet" or "I am not sure"
  clears the other boxes in that question, and vice versa.
- **Adaptive board.** Questions and actions are scored against the answers, so a visitor
  who mentions a loan-clearance claim gets the loan-document question near the top, and a
  visitor who has collected nothing gets "gather the identifier and documents" first.
- **Action checkboxes** with live progress and an expandable "Why" explanation per action.
- **Free-text note**, saved locally and included in the summary.
- **Pressure check** keyed to the stated decision timing — never a score, grade or verdict.
- **Copyable decision summary** using the Clipboard API, with a text-selection fallback
  when the browser blocks it.
- **Fictional sample decision room**, held separately in memory so exploring it never
  overwrites the visitor's own progress unless they explicitly choose
  "Use these answers as my starting point".
- **Growth Lab** with an illustrative funnel plus a live panel of this browser session's
  real events, and a reset for local demo activity only.

---

## Content-to-product campaign strategy

TokenPause is designed to be discovered at the moment the pressure appears — in a
short-form video someone watches while a broker waits for an answer. Three concepts are
documented in the product, each pointing at a different part of the funnel:

| Concept | Hook | Lands on | Intended event | Learning question |
| --- | --- | --- | --- | --- |
| Reel 1 — The broker wants a token today | "Before you pay a token, ask yourself these three questions." | Decision room, question one | `decision_room_started` | Does pressure-based content create high-intent decision-room starts? |
| Reel 2 — A document is not the same as clarity | "Having a property document does not automatically answer every question." | Fictional sample decision room | `sample_decision_room_opened` | Does document-education content increase completed action boards? |
| Reel 3 — How to slow down without losing the deal | "You can ask for time without sounding uninterested." | Decision summary panel | `decision_summary_copied` | Does a script-based reassurance hook increase summary-copy actions? |

These are **planned concepts only**. They have not been posted, have no views or reach, and
no results are claimed. "Preview journey" attributes the visit locally (`source` becomes
`reel_1`, `reel_2` or `reel_3`) and scrolls the visitor into the relevant part of the
product, so the intended journey can be demonstrated end to end.

---

## Analytics event schema

All events are flat objects stored in `localStorage`, with an in-memory fallback when
storage is unavailable:

```ts
{
  event_name: string,
  timestamp: string,
  session_id: string,
  page_or_section: string,
  source?: "direct" | "reel_1" | "reel_2" | "reel_3" | "sample",
  decision_timing?: string,
  selected_detail_count?: number,
  action_completion_count?: number,
  cta_label?: string
}
```

Implemented events:

```
landing_viewed            decision_answer_selected   decision_summary_viewed
campaign_section_viewed   decision_room_completed    decision_summary_copied
reel_card_opened          action_board_viewed        sample_decision_room_opened
reel_journey_started      action_item_toggled        new_decision_room_started
decision_room_started     decision_step_viewed       growth_lab_viewed
local_demo_reset
```

The helper lives in [`src/lib/analytics.ts`](src/lib/analytics.ts): a single `track()`
call site, a subscribable snapshot for the dashboard, and a reset that clears local data
only.

> In a production product, these events could be sent to tools such as PostHog, Mixpanel,
> Amplitude, or GA4. This prototype keeps all interaction data in the user's browser.

---

## Funnel definitions and primary metric

| Stage | Definition |
| --- | --- |
| Landing visits | Any visitor who reaches the TokenPause landing page. |
| Content-linked visits | Visits attributed to a short-form content campaign rather than a direct visit. |
| Decision rooms started | Visitors who answer at least the first question of the guided flow. |
| Action boards created | Visitors who complete the six questions and reach a Before You Pay board. |
| Summaries copied | Visitors who copy the decision summary — the strongest signal of intent to discuss. |
| Next-step exploration clicks | Visitors who explore what to do next after the board. |

**Primary metric: action boards created per unique visitor.** It is the first point at
which a visitor has done real thinking work rather than just clicking.

**Supporting metrics:** decision-room start rate, summary-copy rate, next-step exploration
rate.

**Proposed learning statement:** the experiment tests whether helping people organise
uncertainty before asking for a next step creates more meaningful engagement than a direct
CTA. The control arm is a direct "Pay token safely" CTA; the variant is the TokenPause
decision-room journey. **Neither has been run.** No lift, significance, revenue or user
counts are claimed anywhere.

---

## Illustrative data vs live local-session data

The Growth Lab keeps these strictly separate and labels them in the interface:

- **Illustrative demo data** — the funnel table, the 14-day trend, the experiment design
  and the headline metric figures. Hard-coded in
  [`src/data/funnel.ts`](src/data/funnel.ts) for a portfolio exercise. Every block carries
  the label *"Illustrative demo data — not live performance, campaign results, or customer
  data."*
- **This session** — real counts derived from events this browser recorded while you used
  the prototype. Stored on your device only; never transmitted. "Reset local demo
  activity" clears these events and your saved decision room, and leaves the illustrative
  data untouched.

---

## Safety and accuracy constraints

TokenPause deliberately does **not**:

- verify a property;
- determine ownership, title, legal risk, fraud, loans, disputes, or transaction safety;
- provide legal advice;
- replace an independent qualified property lawyer or other appropriate professional;
- use words such as "safe to buy", "verified", "clear title", "approved", "low risk" or
  "risk score";
- show a score, percentage, grade or verdict of any kind;
- use real people, real property details, real customer data, actual documents or
  government records;
- collect names, email addresses, phone numbers or any contact details;
- offer login, payment, document upload, property search, a backend, or any sharing link.

Everything the board produces is framed as a question to ask or an action to take, and the
disclaimer appears on the landing page, in the summary text, and in the footer.

---

## Deployment

The build output is a static site in `dist/`, with relative asset paths, so it works from
any host or subpath.

```bash
npm run build
```

**Vercel** — import the repository and accept the defaults (framework: Vite, build
command `npm run build`, output directory `dist`), or:

```bash
npx vercel --prod
```

**Netlify** — build command `npm run build`, publish directory `dist`, or:

```bash
npx netlify deploy --prod --dir=dist
```

**Anywhere else** — upload `dist/` to any static host (GitHub Pages, S3, Cloudflare Pages).
There is no server, no environment variable and no API key to configure.

---

## Suggested 60–90 second demo walkthrough

1. **Arrive via Reel 1.** Scroll to "From content pressure to product clarity", open Reel
   1's storyboard, and press **Preview journey** — the visit is attributed to `reel_1` and
   the decision room opens at question one.
2. **Start the decision room.** Answer question 1 ("The broker asked for a token amount").
3. **Complete the flow.** Pick a couple of details, mark the loan-clearance claim in
   "what has been shared", choose an independent lawyer as the audience, and set the
   timing to **Today** to show the gentle deadline message. Press **Build my board**.
4. **Explore the action board.** Point out that the loan-document question is near the top
   because of the loan-clearance claim, expand one action's **Why**, tick two actions and
   add a note.
5. **Copy the decision summary.** Show the plain-text output, the "Saved locally on this
   device" line, and that nothing is shared automatically.
6. **Open the Growth Lab.** Contrast the illustrative funnel with the "This session" panel,
   which now shows the real events from the previous 60 seconds, then press **Reset local
   demo activity** to show that only local data clears.

---

## What I would validate next

- **Interview users about the pressure moment** — what they were told, what they did in the
  next hour, and who they called first.
- **Test whether visitors understand the limitations** after using the product, not merely
  after reading the disclaimer. Ask them, unprompted, what TokenPause told them about the
  property; the right answer is "nothing".
- **Measure action-board creation by channel**, to see which hook brings people who
  actually do the thinking work rather than people who only watch.
- **Test different content hooks** against the same decision room, so the flow is held
  constant while the acquisition story varies.
- **Validate downstream quality with real, consented data only** — whether people took the
  summary into a conversation, and whether anything was reviewed before money moved.

---

## Project structure

```
src/
  components/      Landing sections, decision room, action board, summary, Growth Lab
    ui/            Section heading, illustrative notice, trend chart
  data/            Flow questions, campaign concepts, illustrative funnel data
  hooks/           useDecisionRoom (state + persistence), analytics snapshot, view events
  lib/             analytics, board generation, storage, clipboard, scroll
  styles/          tokens, base, layout, product
```
