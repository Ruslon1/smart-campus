# Verification record

Date: 6 November 2026. Execution host: macOS arm64. Node.js v25.2.1; Playwright 1.62.1; headless Chromium. App supports Node.js >=22 as declared in package.json; only the recorded environment was executed here.

| Step | Actual command | Outcome | Raw output |
| --- | --- | --- | --- |
| Baseline | node --test tests/baseline.test.js | 8/8 pass | baseline-tests.txt |
| Before-edit analysis | node --test tests/baseline.test.js | 8/8 pass | analysis-step-tests.txt |
| Feature and modules | node --test tests/*.test.js | 41/41 pass | final-unit-tests.txt |
| Browser first run | npm run test:ui | 10/14 pass | browser-first-run.txt |
| Corrected complete suite | npm run test:all | 41/41 + 14/14 pass | final-all-tests.txt |
| Browser confirmation after fix | npm run test:ui | 14/14 pass | browser-tests.txt |

The first UI run exposed an actual form.reset name collision and error-log contamination across cases. The product control ID was renamed and the test error collector made local to each case. Original failed evidence is preserved. Subsequent runs pass with no page errors. Tests assert requirements and interactions, not screenshots alone.

Desktop captures use 1440px viewport width; mobile uses 390px. The mobile test asserts document scroll width does not exceed viewport width. Screenshots were inspected by Codex. No claim of human visual or screen-reader review is made.

The eight-case parity loop in tests/domain.test.js compares old and final boolean availability for the same room/time inputs. Exact error wording intentionally improves in the final UI. Duplicate validation count was obtained by checking two baseline duration predicates against the single final validator. Module count comes from the five JavaScript files under src/.
