# Sanad — development workflow

How work moves from an idea to a release. **Read this before opening a pull request.**

```
feature/*  or  fix/*  ──PR──▶  develop  ──release process──▶  main  ──tag──▶  release
```

---

## What Sanad is (and why the workflow looks like this)

Sanad is a **static, no-build web application**:

| File | What it is |
|---|---|
| `index.html` | The entire markup for every view. Loaded directly by the browser. |
| `app.js` | All application logic: i18n, routing, Supabase calls, rendering. |
| `styles.css` | All styling, including RTL rules. |
| `schema.sql` | The Supabase database: tables, RLS policies, and SECURITY DEFINER functions. |

There is **no bundler, no framework, no package manager, and no compile step**. What is in the
repository is *literally* what runs in the user's browser. That has two consequences that shape
every rule below:

1. **There is no build to catch your mistakes.** A typo in `app.js` is a production outage, not a
   failed CI job. Verification is manual and it is mandatory.
2. **`main` is directly the deployed application.** Anything merged to `main` is live for real
   users the moment it is served.

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | **Production.** The code users run. Protected. Only a release reaches it. |
| `develop` | **Integration.** The latest finished development state. Protected; changes arrive by pull request. |
| `feature/*` | A new feature, branched from `develop` — e.g. `feature/explore-video-cards` |
| `fix/*` | A bug fix, branched from `develop` — e.g. `fix/create-post-category-toggle` |

Other short-lived branches are fine when they suit the work (`docs/*`, `chore/*`). Everything
branches from `develop` and returns to `develop` through a pull request.

**Never commit directly to `main` or `develop`.**

> **First-time setup:** if `develop` does not exist yet, create it once from `main`
> (`git switch main && git pull && git switch -c develop && git push -u origin develop`) and set
> it as the repository's default branch for pull requests.

---

## Day to day

```bash
git switch develop
git pull

git switch -c fix/create-post-category-toggle

# …implement, test in a real browser, commit locally…

git push -u origin fix/create-post-category-toggle   # only when finished — see below
# open a pull request into develop
```

Delete the branch once the pull request merges.

### Running it locally

There is nothing to install and nothing to build. Serve the folder over HTTP — do **not** open
`index.html` with `file://`, because the Supabase CDN script and some browser APIs behave
differently there:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

If Supabase is unreachable or unconfigured, `app.js` falls back to in-memory demo data and logs a
warning. **A feature that only works against the in-memory fallback is not tested.** Verify against
a real Supabase project before you call a data change done.

---

## Publish a branch only when the work is finished

A branch is pushed when the work is **done** — not to store it remotely. Push it when:

- the implementation is complete and actually works in a browser;
- it has been tested in **all five languages** and in **both text directions**;
- known issues are fixed, or written down deliberately;
- it is ready for someone else to read.

Local commits are the place for work in progress. An unfinished branch on the remote invites review
of something that is not ready and turns the remote into a backup drive.

**Test it the way a user will load it, not only the way it looks in your editor.** A hard-refreshed
browser has no stale cache, no leftover `localStorage` session, and none of the local state you
accumulated while working.

---

## The verification baseline

Because there is no automated test suite, **this checklist is the test suite.** Every pull request
that touches `index.html`, `app.js` or `styles.css` must be exercised against it:

- [ ] **Hard refresh** (Ctrl/Cmd + Shift + R) — no console errors, no console warnings you introduced.
- [ ] **English (LTR)** — the changed screen renders and behaves correctly.
- [ ] **Arabic (RTL)** — layout mirrors correctly; nothing overlaps, clips or escapes its container.
- [ ] **Urdu (RTL)** — every new string is translated, not falling back to English.
- [ ] **Hindi and Bengali (LTR)** — every new string is translated, and the script renders without
  clipped marks or overflowing text.
- [ ] **Mobile viewport** (~390 px wide) — Sanad is used on phones first.
- [ ] **Signed out** — browsing still works; login-gated actions prompt instead of failing silently.
- [ ] **Signed in** — the gated action completes and persists after a refresh.
- [ ] **Tab navigation** — Home, Guide, Explore, Community, Profile all still switch correctly.

Anything you could not check, say so in the pull request and say why.

---

## Database changes

The Supabase schema is not a side note — it is part of the application.

- Every schema change goes into **`schema.sql`**, in the same pull request as the code that needs it.
- `schema.sql` must stay **idempotent**: it is run repeatedly against live projects, so use
  `create table if not exists`, `create or replace function`, and guarded policy creation. A
  re-run must never fail and must never destroy data.
- Every new table needs an explicit **RLS policy**. Public boards (`housing_listings`,
  `forum_posts`, `forum_replies`, `share_links`, `share_clicks`, `buddies`) are readable by
  everyone by design. `app_users` is not — it holds `password_hash` and is reachable **only**
  through the `signup_user` / `login_user` SECURITY DEFINER functions.
- **Never loosen an RLS policy to make a feature work.** If a feature needs data it cannot reach,
  that is a design question for a human, not a policy to relax.
- Ship the code and the migration together, and state in the pull request that the reviewer must
  run `schema.sql` before testing.

---

## Secrets

- The **Supabase anon key** in `app.js` is publishable by design. It is protected by RLS, not by
  secrecy. It is fine that it lives in the repository.
- The **`service_role` key is a total compromise of the database.** It must never appear in
  `app.js`, in `index.html`, in a commit, in a comment, in a screenshot, or in a pull request
  description. It never touches this repository. If one is ever committed, treat it as leaked:
  rotate it in the Supabase dashboard immediately.
- The same goes for any admin token, database password, or connection string.
- Never paste real user data — names, phone numbers, WhatsApp numbers — into the repository, into
  seed data, or into an unredacted screenshot.

---

## Releases

**`main` is not a merge target.** It is a published snapshot of a verified `develop`.

The order is fixed, and nothing is published before it completes:

1. `develop` is green against the verification baseline above.
2. Audit the tree that is about to ship — no development-only material (see below), no leftover
   diagnostics, no placeholder credentials.
3. Publish `develop`'s verified tree to `main`.
4. Load the deployed `main` and smoke-test it: the app boots, Supabase connects, the tabs work in
   all five languages.
5. Tag the release.

The tree that is audited, the tree that is published and the tree that users load are the same
tree. **A release is never tagged before the deployed application has been loaded and checked.**

### What `main` must never contain

Development-only material of any kind: diagnostic `console.log` instrumentation, investigation
tooling, internal notes and plans, throwaway scripts, commented-out experiments, or anything else
not required to run Sanad.

Note that `plan.md` is a working document, not shipped product. Development notes belong in
`private/` or in the pull request — not in the repository root and not in `main`.

### `private/` — local only

`private/` is a personal workspace for internal material: notes, investigations, evidence, local
tools, scratch SQL, exported data.

It **never leaves your machine.** It is not committed, not pushed, not included in a pull request,
and never appears in a branch, a snapshot or a release. It is covered by `.gitignore`.

Do not reference anything under `private/` from public code or documentation.

---

## Related documents

- [`AGENTS.md`](AGENTS.md) — mandatory additional rules for AI agents working in this repository.
- [`schema.sql`](schema.sql) — the authoritative database definition.
