# AI use record and evidence appendix

## Tool and date
OpenAI Codex desktop, GPT-6 family coding assistant, 6 November 2026. A more specific deployment identifier is not exposed in this session, so none is claimed. Tools used: local filesystem and shell, Node.js test runner, Playwright Chromium, Python document tooling, Documents and PDF skills. No private credentials, external APIs, student databases or other people's repository changes were used. No separate external model conversation or human review is claimed.

## Selected actual user prompts
The user first asked in Russian what the assignment required. After the PDF summary, the user asked: “можешь сделать все и оформить” and “сделай аналогичную минимальную версию, подготовь репорт или что там просится”. These are the actual authorization to reconstruct the minimal prototype and prepare the deliverables.

The user also supplied local instructions: think in English; write code/comments in English; communicate in Russian; prefer simple direct solutions; test and commit after each step; work on local main without new branches or worktrees.

## Structured context used for implementation
The assignment PDF, pages 5–21 and 25–31, supplied the six tasks, AC summaries, F1–F5, deliverables and submission instructions. The repository context and prioritized plan were recorded before feature edits in docs/plan-before-changes.md. The original Assignment 03 source was not supplied: baseline/ is explicitly a reconstruction, as permitted by the assignment. AC1–AC6 labels in this package operationalize the brief summaries in Assignment 04; they are not quotations of an unseen full Assignment 03 specification.

## Output used and decisions
1. Reconstructed working baseline plus eight regression checks, preserved in commit 164529c.
2. Pre-edit analysis and plan, commit 3cce6da. Four concrete maintainability risks refer to actual functions/files.
3. Four-room fixtures, pure filtering and interval functions, derived state and responsive UI, commit 21e8f70.
4. Real-browser tests and reset fix, commit 7295cf0.
5. Report, diagrams, README, reflection and submission package generated from these actual files/results.

A framework scaffold and global state store were considered by the assistant and rejected in favor of native ES modules. This is an implementation decision in this session, not an invented verbatim prompt/response exchange. No developer-to-model API prompts were separately issued or captured.

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

## Human verification status
Codex executed the automated checks and visually inspected the artifacts. The student has not yet reported performing personal verification. Before submission, the student should run npm run test:all, inspect the demonstrated cases, read the report, and revise the reflection to describe only actions actually performed. The current reflection explicitly identifies this limitation rather than inventing human work.
