# Mutation testing report

Final local run on 2026-09-12: 1,460 mutants across the validator, import/export, persistence, plan transformations, timer, and workout engine. It used four workers to avoid load-induced timeouts on the local host and completed in 2 minutes 45 seconds.

- Mutation score: **74.79%**
- Covered mutation score: **76.69%**
- Killed: **1,092**
- Survived: **332**
- No coverage: **36**
- Timeouts/errors: **0**
- Configured break threshold: **70%** — passed

The independent mutation-review pass added behavior-focused tests for exact import error contracts and causes, input non-leakage, strict persisted-session shapes, stable storage keys, validator boundaries and issue paths, plus pause/resume elapsed-time arithmetic. It exposed a real gap in persisted-session validation; production now rejects missing runtime fields and unknown properties.

Remaining survivors were reviewed by category. Most are equivalent defensive loop-guard changes, message-only mutations that do not alter the public contract, or impossible-state branches protected by validated plans and versioned session construction. They are retained in the HTML report for future review. The test suite intentionally does not assert every internal error-string character or implementation-only guard when that would couple tests to incidental code structure.

The generated interactive report is written to `reports/mutation/mutation.html` and is excluded from version control.
