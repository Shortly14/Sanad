<!-- Read AGENTS.md and WORKFLOW.md before opening this PR. One PR = one responsibility. -->

## What changed


## Why it was needed


## How it was tested
<!-- Say who tested what: AI agent / human / not tested (and why). -->

- [ ] Hard refresh, console clean
- [ ] English (LTR)
- [ ] Arabic (RTL)
- [ ] Urdu (RTL)
- [ ] Hindi and Bengali (LTR)
- [ ] Mobile viewport (~390px)
- [ ] Signed out
- [ ] Signed in
- [ ] Other tabs still work

Not tested (and why):

## Evidence
<!-- Screenshots for any UI change, including one in Arabic (RTL). -->

Before:

After:

## Database
- [ ] No database change
- [ ] `schema.sql` updated in this PR, idempotent, no data loss, no RLS weakened
- [ ] Reviewer must run `schema.sql` before testing

## What the reviewer should verify
<!-- Concrete, ordered steps with the expected result at each one. Never "test everything". -->

1.
2.

### Human verification
- [ ] Tested by a human
- [ ] Works in English, Arabic, Urdu, Hindi and Bengali
- [ ] No obvious regression observed

## Known limitations / risks


## Checklist
- [ ] Branched from `develop`, targeting `develop`
- [ ] One clear responsibility, no unrelated changes, no reformatting
- [ ] No framework, build step or dependency introduced
- [ ] Every new string added to `en`, `ar`, `ur`, `hi` and `bn`
- [ ] No secrets, keys or real user data
- [ ] Temporary diagnostics removed
