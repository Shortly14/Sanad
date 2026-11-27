# Sanad

Vanilla HTML/CSS/JS single-page app (no build step, no framework, no package manager) backed by
Supabase. Five languages: English, Arabic (RTL), Urdu (RTL), Hindi, Bengali.

**Before changing anything in this repository, read [`AGENTS.md`](AGENTS.md) — its rules are
mandatory — and [`WORKFLOW.md`](WORKFLOW.md) for branching, testing and release rules.**

Quick facts:
- `index.html` · `app.js` · `styles.css` · `schema.sql` are the whole application.
- Run it with `python3 -m http.server 8000`, not `file://`.
- Never introduce React, a bundler, or an npm dependency.
- Every user-facing string goes into all five dictionaries in `app.js` (`en`, `ar`, `ur`, `hi`, `bn`).
- Never commit directly to `main` or `develop`.
