import {
  validateWorkoutPlan,
  type ExerciseTarget,
  type PlanExercise,
  type WorkoutPlan,
  type WorkoutPlanPhase
} from './plan-schema';

const checked = (plan: WorkoutPlan): WorkoutPlan => validateWorkoutPlan(plan) as WorkoutPlan;
const phaseIndex = (plan: WorkoutPlan, phaseId?: string): number => {
  const index = phaseId ? plan.phases.findIndex(({ id }) => id === phaseId) : 0;
  if (index < 0) throw new Error('Phase not found.');
  return index;
};
const withPhase = (plan: WorkoutPlan, index: number, phase: WorkoutPlanPhase): WorkoutPlan =>
  checked({ ...plan, phases: plan.phases.map((item, itemIndex) => itemIndex === index ? phase : item) });

export function addPlanExercise(plan: WorkoutPlan, exercise: PlanExercise, index: number, phaseId?: string): WorkoutPlan {
  const targetPhase = phaseIndex(plan, phaseId);
  const phase = plan.phases[targetPhase]!;
  if (!Number.isInteger(index) || index < 0 || index > phase.exercises.length) throw new RangeError('Invalid exercise position.');
  const exercises = [...phase.exercises];
  exercises.splice(index, 0, structuredClone(exercise));
  return withPhase(plan, targetPhase, { ...phase, exercises });
}

export function removePlanExercise(plan: WorkoutPlan, slotId: string, phaseId?: string): WorkoutPlan {
  const targetPhase = phaseIndex(plan, phaseId);
  const phase = plan.phases[targetPhase]!;
  if (!phase.exercises.some(({ id }) => id === slotId) || phase.exercises.length === 1) throw new Error('Exercise cannot be removed.');
  return withPhase(plan, targetPhase, { ...phase, exercises: phase.exercises.filter(({ id }) => id !== slotId) });
}

export function movePlanExercise(plan: WorkoutPlan, slotId: string, destination: number, phaseId?: string): WorkoutPlan {
  const targetPhase = phaseIndex(plan, phaseId);
  const phase = plan.phases[targetPhase]!;
  const source = phase.exercises.findIndex(({ id }) => id === slotId);
  if (source < 0 || !Number.isInteger(destination) || destination < 0 || destination >= phase.exercises.length) throw new RangeError('Invalid exercise position.');
  const exercises = [...phase.exercises];
  const [exercise] = exercises.splice(source, 1);
  exercises.splice(destination, 0, exercise!);
  return withPhase(plan, targetPhase, { ...phase, exercises });
}

export function updatePlanExerciseTarget(plan: WorkoutPlan, slotId: string, target: ExerciseTarget): WorkoutPlan {
  const index = plan.phases.findIndex((phase) => phase.exercises.some(({ id }) => id === slotId));
  if (index < 0) throw new Error('Exercise not found.');
  const phase = plan.phases[index]!;
  return withPhase(plan, index, {
    ...phase,
    exercises: phase.exercises.map((exercise) => exercise.id === slotId ? { ...exercise, target } : exercise)
  });
}

export function addPlanPhase(plan: WorkoutPlan, phase: WorkoutPlanPhase, index: number): WorkoutPlan {
  if (!Number.isInteger(index) || index < 0 || index > plan.phases.length) throw new RangeError('Invalid phase position.');
  const phases = [...plan.phases];
  phases.splice(index, 0, structuredClone(phase));
  return checked({ ...plan, phases });
}

export function removePlanPhase(plan: WorkoutPlan, phaseId: string): WorkoutPlan {
  const phase = plan.phases.find(({ id }) => id === phaseId);
  if (!phase || phase.kind === 'training' && plan.phases.filter(({ kind }) => kind === 'training').length === 1) throw new Error('Phase cannot be removed.');
  return checked({ ...plan, phases: plan.phases.filter(({ id }) => id !== phaseId) });
}

export function movePlanPhase(plan: WorkoutPlan, phaseId: string, destination: number): WorkoutPlan {
  const source = plan.phases.findIndex(({ id }) => id === phaseId);
  if (source < 0 || !Number.isInteger(destination) || destination < 0 || destination >= plan.phases.length) throw new RangeError('Invalid phase position.');
  const phases = [...plan.phases];
  const [phase] = phases.splice(source, 1);
  phases.splice(destination, 0, phase!);
  return checked({ ...plan, phases });
}

export function setDisplayLanguages(plan: WorkoutPlan, displayLanguages: string[]): WorkoutPlan {
  return checked({ ...plan, displayLanguages: [...displayLanguages] });
}
