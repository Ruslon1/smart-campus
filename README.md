# Smart Campus Room Availability Checker

Software Engineering Assignment 04 · 6 November 2026

A reconstructed minimal single-room baseline and a final four-room browser application. All rooms and bookings are fictional. No account, database, live API, build tool or frontend framework is required. The application itself has no third-party runtime dependencies.

## Requirements and setup

Install Node.js 22 or later. From this folder:

```sh
npm ci
npx playwright install chromium
npm start
```

Open http://127.0.0.1:4173 for the final application and http://127.0.0.1:4173/baseline/ for the original reconstructed prototype. Stop the server with Ctrl+C. Do not open index.html with file:// because browser ES modules require an HTTP origin.

For application use and unit tests, dependency installation is unnecessary: `npm start` and `npm test` use only Node built-ins. The dev dependency Playwright is needed only for browser tests.

## Test commands

```sh
npm run test:baseline  # 8 baseline checks
npm test              # 41 checks: 8 baseline + 33 final domain/state checks
npm run test:ui       # 14 Chromium browser checks; starts its own server on 4174
npm run test:all      # all 55 checks
```

Ports 4173 (manual demo) and 4174 (automated browser tests) must be free. `PORT=5000 npm start` selects a different manual demo port on macOS/Linux. Browser tests overwrite the six demonstration PNGs in evidence/; this is intentional.

Recorded outcome: 8/8 baseline tests; 41/41 combined unit/regression checks; 14/14 browser tests. Evidence logs are from actual runs, not sample output. See evidence/verification.md for commands, environment, initial failure and correction.

## User workflow

1. Choose a positive whole number of people.
2. Select equipment. Every selected item is required.
3. Choose a same-day start/end time. The demo date is 6 November 2026 and fixed now is 09:00. Start must be at or after 09:00, end must be later, and duration must be at most 120 minutes.
4. Select a matching room. Results refresh immediately on input or selection; the Check availability button also refreshes the result.
5. Read that room's bookings and result. No booking is created.

Intervals are half-open: [start, end). A request ending at an existing booking's start, or starting at its end, does not overlap. A blocked room can satisfy the filters but always shows maintenance rather than availability. Capacity and equipment filters do not silently hide blocked rooms.

If filters remove the selected room, the first matching room is selected. With no matches, selection and the previous availability result are cleared. Reset requirements restores the initial controls and A101 selection.

## Demonstration scenarios

| Scenario | Steps | Expected |
| --- | --- | --- |
| Available room | Default 6 people, A101, 11:00–12:00 | Available; prior booking ends at 11:00 |
| Successful filter | Require Projector and Whiteboard | B204 and D105 only |
| Empty result | Require Computers and Microphone | No rooms match |
| Own bookings | Switch A101 to C310 at 11:00–12:00 | Available changes to already booked |
| Blocked room | Select D105 | Closed for maintenance |
| Capacity boundary | 8 people, then 9 | A101 included, then excluded |
| Duration boundary | A101 11:00–13:00, then 13:01 | Available, then invalid duration |

## Project map

- baseline/app.js and baseline/index.html: preserved one-room prototype.
- src/data.js: deeply frozen catalog, equipment options, fixed clock.
- src/availability.js: time parsing, shared interval validator, availability rules.
- src/filtering.js: pure capacity and equipment filtering.
- src/state.js: derives matching rooms, selection and refreshed result.
- src/app.js: browser events, accessible feedback and rendering.
- index.html and styles.css: semantic page and responsive presentation.
- server.js: local static HTTP server, not a production deployment server.
- tests/: executable baseline, domain/state and real-browser checks.
- docs/: before-edit plan, report, AI evidence, reflection and submission guidance.
- evidence/: raw test results, quality measurements and screenshots.

## Versions and source history

All work was committed on local main. The initial version is preserved as actual files under baseline/ and in commit 164529c. The analysis plan is commit 3cce6da; the modular feature implementation is 21e8f70; browser verification and reset fix are 7295cf0. Later commits package the report and evidence. `git log --oneline` shows the complete local history when using the repository or Git bundle. The ZIP includes baseline and final sources without requiring Git.

## Limitations

One fixed fictional day; no recurring or overnight bookings; no writes or persistence; no booking concurrency; Chromium browser automation only; desktop and 390px mobile screenshots do not establish support for every device. Keyboard focus and live-region attributes are tested, but no human screen-reader audit has been performed. This is a course prototype.
