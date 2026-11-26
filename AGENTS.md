# Sanad — AI Agent Development Rules

> **If you are an AI agent, coding agent, autonomous agent, or AI-assisted development tool working
> on Sanad, you MUST read and follow this file before modifying the repository.**
>
> These rules are **mandatory, not suggestions.** Sanad is a live application used by workers in
> Saudi Arabia to find housing, understand their legal rights, and ask questions that matter to
> their lives. It has no build step and no automated test suite — what you commit is what runs in
> their browser. Your job is correctness, not code volume.

[`WORKFLOW.md`](WORKFLOW.md) is the authoritative repository workflow. This file adds obligations
that apply specifically to AI agents working inside it.

**The operating loop:** UNDERSTAND → VERIFY → CHANGE MINIMALLY → TEST → REPORT → STOP WHEN
UNCERTAIN. Never GUESS → REWRITE → HOPE.

---

## 1. Repository and Git Safety

`main` is **production**. `develop` is the **integration branch**. AI agents do not bypass this
workflow.

- AI agents **MUST NOT** commit directly to `main`.
- AI agents **MUST NOT** push directly to `main`.
- AI agents **MUST NOT** create pull requests targeting `main`. `main` is not a merge target — it
  is a published snapshot produced by the release process in [`WORKFLOW.md`](WORKFLOW.md).
- AI agents **MUST NOT** commit directly to `develop`.
- Changes are normally made on a dedicated `feature/*` or `fix/*` branch created from `develop`.
- Pull requests target `develop`.
- **Do not push unfinished work** to use GitHub as remote storage or backup. A branch is pushed
  when the work is complete, tested and ready for someone else to read.
- **Do not push, open a PR, merge, tag, release, or modify protected branches** unless the workflow
  explicitly allows it *and* the required human approval has been given.

Read access is not permission to push. Treat every remote operation as a controlled action.

Additionally, never force-push, never rewrite shared history, never move a published tag, never
delete branches, and never run destructive Git commands (`reset --hard`, `clean -fd`,
`checkout --` over uncommitted work) without explicit human authorisation. Inspect `git status`
before you begin: if the working tree contains unrelated changes, **preserve them and report**
rather than working over them.

Stage files by name. Never `git add -A` — `app.js`, `index.html` and `styles.css` are large single
files that accumulate unrelated edits easily, and `git add -A` is how private notes and scratch
files reach the remote.

---

## 2. One Task = One Responsibility

**Every PR must have ONE clear purpose.**

- A feature PR implements that feature.
- A bug-fix PR fixes that bug.
- A refactoring PR performs that refactoring.
- A documentation PR changes documentation.

An AI agent **MUST NOT** silently combine unrelated work into the same PR. If asked to fix the
duplicated Explore filter bar, do not also restyle unrelated cards, rewrite the i18n layer, change
the Supabase query for a different view, "tidy" the schema, or reorganise `app.js` — unless those
changes are strictly required for the requested fix.

This matters more here than in most repositories: three of the four source files are enormous and a
single sprawling diff is effectively unreviewable.

If you discover another unrelated problem: **document it, report it separately, and leave it out of
the current PR.**

A human should be able to read the PR title and know exactly what it changes.

---

## 3. Understand Before Modifying

Do not modify code blindly. Before implementing:

1. Read the relevant documentation, including [`WORKFLOW.md`](WORKFLOW.md) and `schema.sql`.
2. Understand the repository structure.
3. Inspect the existing implementation — find the actual function or handler, not a similarly named one.
4. Identify the relevant architecture and dependencies.
5. Understand the current behaviour.
6. Reproduce the problem in a browser when possible.
7. Form a hypothesis before changing code.
8. Make the smallest appropriate change.
9. Validate the result.

**Do not treat a user's description of a bug as proof of its root cause.** Do not call something a
root cause merely because it is consistent with the symptoms.

**Do not change architecture because a different architecture appears cleaner.** Prefer repair over
rewrite.

Sanad contains deliberate workarounds — CDN load failures, RTL layout corrections, in-memory
fallbacks when Supabase is unconfigured, guards around signed-out users. A seemingly redundant
timer, guard, retry, state variable or branch may exist because it fixed a real defect. **Read the
comment. Never remove such logic without proving it obsolete.**

Search for every call site before changing a function, a `data-i18n` key, a `data-tab` value, a CSS
class or a Supabase table name. In a single-file app, a rename you did not fully propagate fails
silently at runtime.

---

## 4. Respect The Existing Stack

Sanad is **vanilla HTML, CSS and JavaScript, served directly.** There is no React, no build step,
no bundler, no package manager, no TypeScript, no framework.

An AI agent **MUST NOT**:

- introduce React, Vue, Svelte, or any framework;
- introduce a build step, bundler, transpiler, or `package.json`;
- add an npm dependency;
- convert files to modules, TypeScript, or JSX;
- split the existing files apart as an unrequested "improvement";
- add a new CDN `<script>` tag without explicit human approval.

If a request is phrased in framework terms — "fix the `useState` in the Create Post component" —
**that is a description of the symptom in borrowed vocabulary, not an instruction to introduce
React.** Find the equivalent vanilla state and event handlers in `app.js` and fix those.

If you genuinely believe the stack is insufficient, follow §14: document and stop. Do not migrate.

---

## 5. Internationalisation Is Not Optional

Sanad ships in **English, Arabic, Urdu, Hindi and Bengali**. Arabic and Urdu are **right-to-left**;
Hindi (Devanagari script) and Bengali (Bengali script) are left-to-right.

Every user-facing string you add:

- **MUST** be added to all five dictionaries in `app.js` (`en`, `ar`, `ur`, `hi`, `bn`) under the
  same key;
- **MUST** be rendered through the existing `data-i18n` mechanism, never hardcoded into
  `index.html` or into a JavaScript template literal;
- **MUST NOT** be left as an English placeholder in the `ar`, `ur`, `hi` or `bn` dictionary. If you cannot
  produce a correct translation, say so explicitly in the PR and flag it for a human — do not
  silently ship English text under an Arabic key.

Every layout change you make:

- **MUST** be checked in RTL. Use logical CSS properties (`margin-inline-start`,
  `padding-inline-end`, `inset-inline-start`) rather than `left`/`right` wherever the existing code
  does.
- **MUST NOT** break the mirrored layout to make the LTR layout look better.

A PR that adds an English-only string, or that only looks right in English, is not finished.

---

## 6. Testing Is Mandatory

**An AI agent MUST NOT open a PR merely because the code looks correct, the syntax is valid, or the
diff reads sensibly.** There is no compiler and no test suite here. Nothing is checking your work
except a browser and a human.

Where practical, a PR should be tested by a real human.

You must clearly distinguish:

- tests performed by the AI agent;
- tests performed by a human;
- tests that could not be performed, and why.

Testing must cover **the actual behaviour being changed**. Exercise the application as a user would:

- serve the folder over HTTP and hard-refresh;
- open the affected screen and use the changed feature;
- test normal behaviour;
- test important edge cases — empty lists, long text, missing fields, no results;
- test failure and recovery — signed out, Supabase unreachable, CDN blocked;
- switch to Arabic, Urdu, Hindi and Bengali and repeat;
- check a mobile viewport (~390 px);
- confirm the browser console is clean;
- verify the other tabs still work.

**Run the full verification baseline in [`WORKFLOW.md`](WORKFLOW.md) and report it item by item.**

If you cannot run a browser in your environment, **say so plainly and state that the change is
unverified.** Do not describe reasoning as if it were testing.

---

## 7. Human Verification

Whenever practical, the PR should require a real human verification step. Include a section such as:

```markdown
### Human verification
- [ ] Tested by a human
- [ ] Works in English, Arabic, Urdu, Hindi and Bengali
- [ ] Checked on a phone-sized viewport
- [ ] No obvious regression observed
```

**Explain exactly what the human should test. Never ask a human to "test everything."** Give
concrete, ordered steps with the expected result at each one — which tab to open, what to click,
what should happen.

---

## 8. PR Evidence

Every PR must explain what changed and provide evidence of the **result**, not merely the code.

Sanad is almost entirely UI, so **screenshots are the default expected evidence**:

```
Before: [screenshot]
After:  [screenshot]
```

Include an Arabic (RTL) screenshot for any layout change.

For bugs: show the previous behaviour when practical, show the corrected behaviour, and explain
what changed.

For non-visual changes, provide console output, query results, schema verification, or a concise
technical explanation.

Do not present an inference as a measurement. Label claims **FACT** (directly verified),
**INFERENCE** (supported but not observed), or **UNKNOWN**.

---

## 9. Database and Security Boundaries

`schema.sql` is part of the application, not documentation of it.

- Any change to a table, column, policy or function goes into `schema.sql` **in the same PR** as
  the code that depends on it, and the PR must say that the reviewer has to run it.
- `schema.sql` must remain **idempotent and non-destructive** — it is re-run against live projects.
  Never add a bare `drop table`, `drop column`, `truncate`, or an unguarded `alter` that loses data.
- Every new table needs an explicit RLS policy. **Never disable RLS. Never widen a policy to make a
  feature work.** If a feature cannot reach the data it needs, stop and ask a human.
- `app_users` holds `password_hash` and is reachable only through the `signup_user` / `login_user`
  SECURITY DEFINER functions. **Never add direct anon access to `app_users`.** Never log, return,
  or render a password hash.
- **Never commit a `service_role` key, admin token, database password, or connection string.** The
  anon key is publishable by design; the service key is a full database compromise. If you
  encounter one in the working tree, stop and report it — do not commit it, and do not paste it
  into a PR description.
- Never commit real user data: names, phone numbers, WhatsApp numbers, or exported rows.

---

## 10. Content Accuracy

Sanad carries legal, labour-law, immigration and emergency-contact information that people act on.

- **Never invent, guess, or "improve" a fact.** Not a labour-law rule, not an Iqama or Qiwa
  procedure, not a fee, not a deadline, not an emergency number.
- Changes to guide content or emergency contacts require a citable official source (Qiwa, Absher,
  Muqeem, Ministry of Human Resources). Put the source in the PR.
- If you are not certain a factual claim is correct, **leave it alone and flag it.** A wrong number
  in this app is worse than a missing one.

---

## 11. Keep Diagnostics Out of Production

Temporary diagnostic instrumentation is permitted during investigation when necessary. But
`console.log` debugging, test harnesses, investigation scripts, internal reports, commented-out
experiments and scratch files **must not become part of a production release.**

Remove temporary diagnostics before the PR is considered ready, unless they are intentionally part
of the product and that intent is stated. The existing deliberate `console.warn` calls about
Supabase configuration are product behaviour — leave them.

This must remain consistent with the production-boundary rules in [`WORKFLOW.md`](WORKFLOW.md):
`main` contains only what is required to run Sanad, and `private/` never leaves the machine and is
never referenced from public code or documentation.

**Never weaken or bypass a production rule for convenience.** Never assume a file is safe to commit
merely because nothing explicitly excluded it.

---

## 12. Minimal and Focused Changes

Prefer the smallest change that correctly solves the problem. Do not rewrite working systems ·
refactor unrelated code · rename unrelated identifiers · reorder functions · reformat unrelated
lines · change indentation or quote style · add dependencies · modify unrelated configuration.

**Reformatting is a change.** Never let an editor or formatter reflow `app.js`, `index.html` or
`styles.css`. A whitespace-only diff across a 130 KB file hides the three lines that matter and
makes review impossible.

A larger change is acceptable only when you can explain why the smaller change is insufficient.

---

## 13. Local Files and Examples

If a change requires local files, configuration, sample data, a Supabase project, or other local
resources, the PR must say so clearly. **Do not assume the reviewer has them.**

State: what is required · where it goes · what format it must be · how to reproduce the test ·
whether it is in the repository or must be obtained separately.

Provide a small, safe example or fixture whenever possible.

**Never commit private, sensitive, personal, proprietary or machine-specific files merely to make a
PR easier to test.** See §9 and the `private/` rule in [`WORKFLOW.md`](WORKFLOW.md).

---

## 14. Stop and Ask When Necessary

Stop and ask a human instead of guessing when:

- requirements are ambiguous;
- two repository rules conflict;
- a destructive operation is required;
- credentials or secrets are required;
- a protected branch would be affected;
- a schema migration would drop or rewrite existing data;
- an RLS policy would need to be widened;
- a factual claim in guide content cannot be verified;
- an unrelated issue would need to be changed;
- the correct behaviour cannot be established safely;
- you would need to weaken an existing safety rule;
- you cannot adequately validate the result.

**Do not silently make important product or repository policy decisions.** Do not resolve
uncertainty by making a large change. If evidence is insufficient, stop at diagnosis and report
what is needed.

If you conclude the architecture is insufficient, document **CURRENT ARCHITECTURE · OBSERVED
LIMITATION · EVIDENCE · ALTERNATIVES · RISKS · RECOMMENDED CHANGE** and stop. Do not introduce a
new abstraction, framework or build step unannounced.

---

## 15. PR Body

PR descriptions must be clear, concise and easy for a human to review. Answer:

1. What changed?
2. Why was it needed?
3. How was it tested?
4. What should the reviewer verify?
5. Are there known limitations or remaining risks?

Avoid unnecessary jargon, long narratives, repeated information, giant pasted logs, and unnecessary
implementation detail. If detailed technical evidence is needed, **summarise it and reference the
investigation** rather than making the PR body unreadable.

---

## 16. PR Readiness Checklist

- [ ] Correct branch created from `develop`
- [ ] PR has one clear responsibility
- [ ] Relevant documentation was read
- [ ] Existing implementation was understood
- [ ] Root cause was investigated where applicable
- [ ] No framework, build step or dependency was introduced
- [ ] Implementation is complete
- [ ] Tested in a real browser with a hard refresh
- [ ] Console is clean
- [ ] Verified in English, Arabic, Urdu, Hindi and Bengali
- [ ] RTL layout verified
- [ ] Mobile viewport verified
- [ ] Signed-out and signed-in paths verified
- [ ] `schema.sql` updated and idempotent, if the database changed
- [ ] No RLS policy was weakened
- [ ] No secrets, keys or real user data included
- [ ] Factual/legal content is sourced, or untouched
- [ ] Human verification instructions are provided
- [ ] Screenshots included for UI changes (including RTL)
- [ ] Temporary diagnostics were removed
- [ ] No unrelated changes, no reformatting
- [ ] No private or machine-specific material is included
- [ ] PR body is concise and understandable
- [ ] Known limitations are documented

---

## 17. Relationship With `WORKFLOW.md`

[`WORKFLOW.md`](WORKFLOW.md) remains the authoritative repository workflow for branches, releases,
production snapshots, and release safety.

`AGENTS.md` adds mandatory instructions specifically for AI agents working within that workflow.

**If an AI agent encounters a conflict between the two, it must stop and ask for clarification
rather than choosing whichever rule is more convenient.**
