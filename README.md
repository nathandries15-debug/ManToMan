# Man to Man

An early website prototype for men's emotional support, habit building, and everyday health.

## Run

Requires Node.js 20 or newer. No dependencies or credentials are required.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Run `npm test` for HTTP smoke tests.

## Current behavior

Each path opens a dedicated conversation view. Emotional support includes a journal; self-improvement includes a calendar and next-step list; general health includes a needs check-in, optional cross-path overview, and relevant resources. Tools open on demand from the conversation in a dialog rather than in a separate dashboard. Daily notes and data settings are collapsed by default. Chat messages can be copied into explicit drafts for review before saving. Daily editorial notes and external reading shelves remain available within each path. No real AI provider is connected. Conversations exist only in the current page's memory, are cleared when the dialog closes, and are not persisted or sent to a backend. Workspace entries remain in memory by default. Users may opt into localStorage on their device, export their data as JSON, or clear it. Device storage is not encrypted by this application and has no cloud sync. The health path can use a saved focus and goal in its scripted prompts. An optional local overview includes emotional-support journal count and latest mood plus unfinished self-improvement task count, never journal text. This permission resets on reload. Existing device data remains compatible; export includes all entries, including entries from tools that are no longer exposed in a given path. Resource links are not live news or AI research summaries. Daily notes rotate by local calendar date and are editorial content, not personalized AI advice. The demo includes human crisis-support information; its keyword matching is limited and must not be treated as a safety assessment.

## Next stage

Before offering a real AI service, add server-side provider integration, validated response handling, abuse protection, clear privacy and retention controls, and reviewed mental-health safety behavior. Never put provider credentials in browser code. Add explicit consent and deletion controls before collecting habit or health data. This prototype is not therapy, medical care, or an emergency service.

## Vercel

This prototype is a static site. The included `vercel.json` selects `npm run build` and the `dist` output directory. Import the repository into Vercel with the repository root as the Root Directory and framework set to Other. Remove conflicting build/output overrides in the Vercel project settings, then redeploy after the source files are pushed to GitHub. No environment variables are required for the demo. `npm start` is for local development, not the Vercel deployment.

## Guided starting-point check-in

The homepage entry points and “Let’s make some room” CTA open a three-question conversational check-in, showing one question at a time with prior answers in an expandable history. Explicit preferences outweigh simple keyword signals, ambiguous answers offer choices, and the result explains why a path was suggested. This is not live AI or a clinical assessment. Recognized urgent language shows human support information instead of a routine recommendation; keyword matching cannot reliably assess safety. Answers remain in memory only and clear when leaving. An unchecked-by-default control can copy the first answer into an editable chat draft. No automatic submission or journal saving occurs.

## Account and upgrade previews

The header contains Sign in and Upgrade previews. Sign in validates an email locally, then explains that no email was sent or account created; it clears the field and makes no network request. Plus describes proposed features and a sample weekly reflection, with no payment or entitlements implemented. Actual authentication and subscriptions require backend/provider setup. See PRODUCT_NOTES.md for the feature split, pricing hypotheses, and activation requirements.

## Conversation modes, closing, and voice

Listen (the default) offers space to share without planning advice; Reflect offers a thought/feeling prompt; Plan offers a small practical step. All replies remain scripted, with recognized urgent language routed to human-support information before mode-specific responses. Wrap up opens an optional user-written takeaway; users can download it, draft it into the current path’s journal/task list where available, keep chatting, or finish and clear the conversation. Nothing is summarized or saved automatically.

Voice uses browser SpeechSynthesis, with manual replay/stop and an off-by-default automatic read-aloud switch. If SpeechRecognition is supported, users can explicitly enable microphone dictation, then start it and grant browser permission. Dictation fills a draft without sending. Browser/device speech providers may process reply text or microphone audio; the site provides no speech backend and stores no recordings. Voice and microphone consent reset when leaving a path. Playback/capture stop on navigation, page hiding, and dialog opening. Support and installed voices vary by browser and device; text chat remains usable when unavailable. Actual speech quality/audibility must be checked on the intended devices.
