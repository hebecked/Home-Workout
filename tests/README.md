# Test-owned production contract

These tests intentionally define the initial production API. Production code must
implement the imports below without weakening the assertions.

- `src/core/plan-schema`: `WorkoutPlan`, `PlanValidationError`, `validateWorkoutPlan`
- `src/core/plan-io`: `PlanImportError`, `importPlanJson`, `exportPlanJson`
- `src/core/timer`: immutable timestamp timer creation, pause/resume and queries
- `src/core/workout-engine`: immutable session creation, dispatch and snapshot
- `src/core/persistence`: storage-injected plan/session persistence functions
- `src/core/plan-transformations`: immutable add/remove/move/target/language edits
- `src/data/exercises`: `EXERCISE_LIBRARY`
- `src/data/default-workout`: `DEFAULT_WORKOUT`

The browser tests use roles, accessible names, labels, and visible content instead
of CSS implementation details. They are deliberately assigned to representative
projects rather than multiplied across every browser/device configuration.
