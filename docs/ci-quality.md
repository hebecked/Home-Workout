# CI quality diagnostics

The latest failed historical quality run located on 2026-09-07 was [33551809454](https://github.com/hebecked/Home-Workout/actions/runs/33551809454), commit `31d3d80`. Its public job metadata identifies `npm run coverage` as the failed step; mutation succeeded. Raw log download requires authentication and was not available in the local unauthenticated GitHub CLI.

The subsequent commit `98ea0d5` adds translation validation boundary tests; its run and the five most recent runs were successful. This is consistent with a coverage failure already repaired in the repository, rather than a currently broken build. The exact historical threshold message is not established by job metadata alone. Do not lower the 95% coverage thresholds or treat mutation success as a replacement for the quality job.

The workflow now uploads coverage and browser reports even after failure (`quality-diagnostics`, seven-day retention). `production-dist` remains available only after preceding quality steps succeed.

Reproduce with Node 22 and a clean `npm ci`, then `npm run check:licenses`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run coverage`, `npx playwright install --with-deps`, `npm run build`, and `npm run e2e`. Use a free `E2E_PORT` locally; never reuse another preview server accidentally.

On this Windows workstation, native Firefox fails before loading the app with `browserType.launch: spawn UNKNOWN`. Default Windows fallback projects use Chromium even when their names say Firefox or WebKit. Set `PLAYWRIGHT_NATIVE_ENGINES=1` to test the named engines; do not report fallback runs as native browser coverage. CI on Ubuntu uses the native engines.

Native Windows WebKit also fails offline document reload with an internal browser error, even after service-worker control and cached JavaScript have been verified. The offline reload test is explicitly skipped only for that Windows/engine combination; online legal notice and keyboard navigation remain tested. Chromium offline reload passes. Safari/device and Linux WebKit offline verification remains outstanding.
