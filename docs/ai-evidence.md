# AI use record and evidence appendix

## Tool and date
OpenAI Codex desktop, GPT-6 family coding assistant, 6 November 2026. Tools used: local filesystem and shell, Node.js test runner, Playwright Chromium, Python document tooling, Documents and PDF skills.

## Task context and prompt summary
The assistant received a repository map, acceptance criteria and project constraints. The request was to reconstruct a minimal baseline, add a four-room catalog and filters, preserve availability behavior, refactor responsibilities, and prepare test and quality evidence. The pre-edit plan is recorded in docs/plan-before-changes.md.

## Structured context used for implementation
The assignment PDF, pages 5–21 and 25–31, supplied the six tasks, AC summaries, F1–F5, deliverables and submission instructions. The repository context and prioritized plan were recorded before feature edits in docs/plan-before-changes.md. The original Assignment 03 source was not supplied: baseline/ is explicitly a reconstruction, as permitted by the assignment. AC1–AC6 labels in this package operationalize the brief summaries in Assignment 04; they are not quotations of an unseen full Assignment 03 specification.

## Output used and decisions
1. Reconstructed working baseline plus eight regression checks, preserved in commit 164529c.
2. Pre-edit analysis and plan, commit 3cce6da. Four concrete maintainability risks refer to actual functions/files.
3. Four-room fixtures, pure filtering and interval functions, derived state and responsive UI, commit 21e8f70.
4. Real-browser tests and reset fix, commit 7295cf0.
5. Report, diagrams, README, reflection and submission package generated from these actual files/results.

A framework scaffold and global state store were considered by the assistant and rejected in favor of native ES modules.

## Problems found and changes made
The first browser run reported 10 passes and 4 failures. The root product defect was `id="reset"` shadowing HTMLFormElement.reset; renaming the control to reset-requirements restored reset behavior. Three later cases were also marked failed because the browser error array retained the prior exception. Clearing that array per test isolated the evidence. See evidence/browser-first-run.txt and the corrected evidence/browser-tests.txt (14/14). Combined final checks pass 55/55. The baseline duration predicate existed in preview and check; final validation has one shared source.

## Verification sources
- tests/baseline.test.js and evidence/baseline-tests.txt: eight original checks.
- tests/domain.test.js: 33 domain/state checks, including regression parity and AC/F boundaries.
- tests/ui.test.mjs and evidence/browser-tests.txt: 14 real-browser checks.
- evidence/final-all-tests.txt: combined commands and actual output.
- evidence/quality-metrics.json: measured module and duplicate-predicate counts.
- evidence/*.png: desktop/mobile and successful/unsuccessful scenario captures.
- docs/plan-before-changes.md and Git history: ordering of analysis and edits.
