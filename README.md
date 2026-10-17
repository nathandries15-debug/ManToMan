# Man to Man

An early website prototype for men's emotional support, habit building, and everyday health.

## Run

Requires Node.js 20 or newer. No dependencies or credentials are required.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Run `npm test` for HTTP smoke tests.

## Current behavior

Three paths open an accessible conversation dialog with suggestions and scripted responses. Each path also has a journal, task list, on-site calendar, rotating editorial daily notes, and a curated external resource shelf. Chat messages can be copied into explicit drafts for review before saving. No real AI provider is connected. Conversations exist only in the current page's memory, are cleared when the dialog closes, and are not persisted or sent to a backend. Workspace entries remain in memory by default. Users may opt into localStorage on their device, export their data as JSON, or clear it. Device storage is not encrypted by this application and has no cloud sync. Resource links are not live news or AI research summaries. Daily notes rotate by local calendar date and are editorial content, not personalized AI advice. The demo includes human crisis-support information; its keyword matching is limited and must not be treated as a safety assessment.

## Next stage

Before offering a real AI service, add server-side provider integration, validated response handling, abuse protection, clear privacy and retention controls, and reviewed mental-health safety behavior. Never put provider credentials in browser code. Add explicit consent and deletion controls before collecting habit or health data. This prototype is not therapy, medical care, or an emergency service.

## Vercel

This prototype is a static site. The included `vercel.json` selects `npm run build` and the `dist` output directory. Import the repository into Vercel with the repository root as the Root Directory and framework set to Other. Remove conflicting build/output overrides in the Vercel project settings, then redeploy after the source files are pushed to GitHub. No environment variables are required for the demo. `npm start` is for local development, not the Vercel deployment.
