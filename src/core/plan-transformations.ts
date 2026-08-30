import { validateWorkoutPlan, type ExerciseTarget, type PlanExercise, type WorkoutPlan } from './plan-schema';

const checked = (plan: WorkoutPlan): WorkoutPlan => validateWorkoutPlan(plan);

export function addPlanExercise(plan: WorkoutPlan, exercise: PlanExercise, index: number): WorkoutPlan {
  if (!Number.isInteger(index) || index < 0 || index > plan.exercises.length) throw new RangeError('Invalid exercise position.');
  const exercises = [...plan.exercises];
  exercises.splice(index, 0, structuredClone(exercise));
  return checked({ ...plan, exercises });
}

export function removePlanExercise(plan: WorkoutPlan, slotId: string): WorkoutPlan {
  const index = plan.exercises.findIndex(({ id }) => id === slotId);
  if (index < 0 || plan.exercises.length === 1) throw new Error('Exercise cannot be removed.');
  return checked({ ...plan, exercises: plan.exercises.filter(({ id }) => id !== slotId) });
}

export function movePlanExercise(plan: WorkoutPlan, slotId: string, destination: number): WorkoutPlan {
  const source = plan.exercises.findIndex(({ id }) => id === slotId);
  if (source < 0 || !Number.isInteger(destination) || destination < 0 || destination >= plan.exercises.length) throw new RangeError('Invalid exercise position.');
  const exercises = [...plan.exercises];
  const [exercise] = exercises.splice(source, 1);
  exercises.splice(destination, 0, exercise!);
  return checked({ ...plan, exercises });
}

export function updatePlanExerciseTarget(plan: WorkoutPlan, slotId: string, target: ExerciseTarget): WorkoutPlan {
  if (!plan.exercises.some(({ id }) => id === slotId)) throw new Error('Exercise not found.');
  return checked({ ...plan, exercises: plan.exercises.map((exercise) => exercise.id === slotId ? { ...exercise, target } : exercise) });
}

export function setDisplayLanguages(plan: WorkoutPlan, displayLanguages: string[]): WorkoutPlan {
  return checked({ ...plan, displayLanguages: [...displayLanguages] });
}
