# Man to Man: accounts and Plus concept

## Current preview

Sign in and Upgrade open honest UI previews. They do not authenticate, send email, create accounts, process payments, or unlock functionality. The email field is validated locally and cleared on submit/close. No email address is saved. All existing tools remain available. AI remains scripted.

## Recommended first paid offering

Sell continuity and useful planning, not a promise of better mental health.

| Free baseline | Proposed Plus |
| --- | --- |
| Three paths and basic journaling/planning | More AI usage and longer conversations, subject to sustainable limits |
| Clear limits for AI once connected | Optional memory with a user-visible editor and deletion controls |
| Manual calendar and task management | External calendar sync and flexible reminders |
| Basic check-ins and editorial notes | Weekly reflections on user-selected journal/goals/habits |
| Trusted reading shelf | Evidence-aware digests with citations, dates, and uncertainty |
| Export, deletion, urgent-help resources | Guided multi-week programs for sleep routines, movement, or productivity |

Basic account security, privacy settings, export/deletion, urgent-help information, and crisis routing must remain available regardless of plan. Avoid unlimited-usage promises before actual model costs are measured. Never gate a crisis response on billing or market the paid tier as a clinician or diagnosis.

## Pricing hypotheses, not published prices

Test a simple $6–$9/month plan for an early low-cost model offering, only after measuring typical conversation cost and infrastructure overhead. An annual option can follow after retention is understood, with total billed price clearly disclosed. Do not choose a permanent price based on this guess. Offer clear usage allowances and an easy cancellation process. A free pilot with no card is easier to evaluate than introducing automatic trial billing now.

## What must be connected before launch

1. A managed identity provider (e.g. Supabase Auth), approved email delivery, redirect allowlists, a verified sender domain, and secure sessions. Apply per-user database access policies before moving local data to cloud storage. Do not upload existing browser entries without explicit consent.
2. Server-side AI integration, per-user usage limits, evaluated support behavior, consent for memory, and retention/deletion policies.
3. Billing (e.g. Stripe Checkout and its hosted customer portal). Verify webhook signatures and derive entitlements from trusted server-side subscription state. Never unlock a paid plan based on a browser flag or checkout redirect alone. Handle cancellations, expired/failed payments, and retries idempotently.
4. Actual pricing, terms/privacy information, support contact, and tests for account isolation and subscription lifecycle. Account and billing providers may offer free starting tiers, but AI, email delivery, hosting, and payment processing may incur fees.

Start with real accounts and cloud sync, then add Plus after the core conversational experience is useful enough to retain users. AI memory should be off by default and easy to inspect. Personal reflections should not be used to pressure people to upgrade.

## A more supportive conversation experience

The next priority is real conversational capability and evaluation, rather than styling it as therapy. Keep the AI identity visible; only describe an offering as therapy when actual qualified professionals provide that service.

- Begin with a choice: listen, help untangle a thought, or make a plan. Ask one question at a time; do not automatically turn every difficult feeling into productivity advice.
- Reflect back what was heard and ask whether it fits before interpreting or suggesting steps. Avoid canned reassurance, diagnoses, and telling users what they feel.
- Offer an optional session shape: brief check-in, one chosen topic, reflection or exercise, then a user-reviewed takeaway. Do not impose homework or streaks.
- Offer clinician-reviewed exercises such as grounding, emotion naming, and thought-record prompts with opt-in pacing. Explain limitations and evaluate model behavior with qualified reviewers before a mental-health launch.
- Build continuity only through memories users explicitly choose to save, inspect, correct, and delete. Do not infer clinical conditions from journals or present automated summaries as facts.
- Support connection with people: a draft message to a trusted person, information on finding a professional, or an export the user can choose to share. If adding actual therapy, integrate qualified professionals rather than impersonating one.
- Keep urgent human support easy to access and improve safety evaluation beyond the current keyword matcher. No implication that the app monitors users or can guarantee safety.

For the next prototype, prioritize the conversation-mode choice and an optional end-of-session reflection. Real AI, authenticated continuity, and reviewed mental-health behavior remain prerequisites for a credible live support offering.
