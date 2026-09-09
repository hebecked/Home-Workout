import {
  BUILT_IN_WORKOUTS,
  BUILT_IN_WORKOUTS_BY_ID,
  DEFAULT_WORKOUT,
  isBuiltInWorkout
} from '../data/default-workout';
import { EXERCISE_LIBRARY, EXERCISES_BY_ID } from '../data/exercises';
import { illustrationRevision } from '../data/illustration-revisions';
import { exportPlanJson, importPlanJson, importPlanUrlPayload } from '../core/plan-io';
import { clearWorkoutSession, deletePlan, loadPlans, loadWorkoutSession, savePlan, saveWorkoutSession } from '../core/persistence';
import { planExercises, validateWorkoutPlan, type PlanExercise, type WorkoutPlan, type WorkoutPhaseKind } from '../core/plan-schema';
import { translatePlanDraft } from '../core/translation';
import { createWorkoutSession, dispatchWorkout, getWorkoutSnapshot, type WorkoutSession } from '../core/workout-engine';
import {
  applyDocumentLocale,
  exerciseTranslation,
  isSupportedLocale,
  LOCALE_DEFINITIONS,
  persistLocale,
  readStoredLocale,
  routineNames,
  translator,
  type SupportedLocale,
  type Translator
} from '../i18n';

const APP_CONFIG: { githubUrl: string } = { githubUrl: 'https://github.com/hebecked/Home-Workout' };
const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const formatClock = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
const cloneDefault = (): WorkoutPlan => structuredClone(DEFAULT_WORKOUT);
const createPlanId = (): string => `plan-${Date.now()}-${crypto.randomUUID()}`;
const createEmptyDraft = (): WorkoutPlan => {
  const template = cloneDefault();
  return {
    ...template,
    id: createPlanId(),
    name: { de: 'Mein Trainingsplan', en: '' },
    phases: template.phases.map((phase) => ({
      ...phase,
      rounds: 1,
      exercises: phase.kind === 'training' ? [] : [structuredClone(phase.exercises[0]!)]
    }))
  };
};
const planTitle = (plan: WorkoutPlan, locale: SupportedLocale = 'en'): string => routineNames[plan.id as keyof typeof routineNames]?.[locale] ?? plan.name[locale] ?? plan.name.en ?? Object.values(plan.name)[0] ?? 'Workout';
const estimatedMinutes = (plan: WorkoutPlan): number => {
  const seconds = plan.phases.reduce((planTotal, phase) => {
    const exerciseSeconds = phase.exercises.reduce((total, exercise) => {
      if ('seconds' in exercise.target) return total + exercise.target.seconds;
      if ('max' in exercise.target) return total + exercise.target.max * (exercise.target.unit === 'per-side' ? 5 : 3);
      return total + 30;
    }, 0);
    const roundSeconds = exerciseSeconds + Math.max(0, phase.exercises.length - 1) * phase.restBetweenExercises;
    return planTotal + roundSeconds * phase.rounds + Math.max(0, phase.rounds - 1) * phase.restBetweenRounds + phase.restAfterPhase;
  }, 0);
  return Math.max(5, Math.round(seconds / 60));
};
const phaseLabel = (kind: WorkoutPhaseKind, t: Translator): string => ({
  'warm-up': t('category.warmUp'), training: t('phase.training'),
  'active-recovery': t('phase.activeRecovery'), 'cool-down': t('phase.coolDown')
})[kind];
const aiSafetyNotice = (t: Translator): string => `<div class="ai-safety-note"><p>${escapeHtml(t('ai.safety'))}</p></div>`;
const localeName = (code: string): string => LOCALE_DEFINITIONS.find((locale) => locale.code === code)?.nativeName ?? code;
const totalRounds = (plan: WorkoutPlan): number => plan.phases.reduce((total, phase) => total + phase.rounds, 0);
const previewCategory = (category: string | undefined, t: Translator): { className: string; label: string } | null => {
  if (category === 'legs') return { className: 'legs', label: t('category.legs') };
  if (category === 'push' || category === 'pull') return { className: 'arms', label: t(category === 'push' ? 'category.push' : 'category.pull') };
  if (category === 'core') return { className: 'core', label: t('category.core') };
  if (category === 'cardio' || category === 'full-body') return { className: 'cardio', label: t(category === 'cardio' ? 'category.cardio' : 'category.fullBody') };
  if (category === 'warm-up') return { className: 'warm-up', label: t('category.warmUp') };
  if (category === 'stretch') return { className: 'stretch', label: t('category.stretch') };
  return null;
};
const exerciseCategoryGroups = [
  { category: 'warm-up', key: 'category.warmUp' },
  { category: 'cardio', key: 'category.cardio' },
  { category: 'full-body', key: 'category.fullBody' },
  { category: 'legs', key: 'category.legs' },
  { category: 'push', key: 'category.push' },
  { category: 'pull', key: 'category.pull' },
  { category: 'core', key: 'category.core' },
  { category: 'stretch', key: 'category.stretch' }
] as const;

export class HomeWorkoutApp {
  private activePlan: WorkoutPlan = cloneDefault();
  private session: WorkoutSession | null = null;
  private draft: WorkoutPlan = createEmptyDraft();
  private editorMode: 'create' | 'edit' | 'copy' = 'create';
  private tickHandle: number | null = null;
  private exercisePickerPhaseId: string | null = null;
  private translationBusy = false;
  private readonly exerciseOverrides = new Map<string, string>();
  private importPreview: WorkoutPlan | null = null;
  private notice = '';
  private uiLocale: SupportedLocale;
  private t: Translator;

  constructor(private readonly root: HTMLElement) {
    this.uiLocale = readStoredLocale(localStorage, navigator.languages);
    this.t = translator(this.uiLocale);
    applyDocumentLocale(document.documentElement, this.uiLocale);
    const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
    if (skipLink) skipLink.textContent = this.t('skip.main');
  }

  start(): void {
    document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector<HTMLElement>('#main')?.focus();
    });
    window.addEventListener('hashchange', () => { this.render(); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); });
    this.session = loadWorkoutSession(localStorage);
    if (this.session) this.activePlan = this.findPlan(this.session.planId) ?? cloneDefault();
    const linkedPlanLoaded = this.loadLinkedPlan();
    this.render();
    if (this.session && !linkedPlanLoaded) this.showResumeDialog();
  }

  private loadLinkedPlan(): boolean {
    const payload = new URLSearchParams(location.search).get('plan');
    if (payload === null) return false;
    try {
      this.importPreview = importPlanUrlPayload(payload);
      this.notice = this.t('import.loaded');
    } catch (error) {
      this.importPreview = null;
      this.notice = error instanceof Error ? error.message : this.t('error.invalidLink');
    }
    history.replaceState(null, '', `${location.pathname}#import`);
    return true;
  }

  private route(): string { return location.hash.replace(/^#\/?/, '') || 'home'; }
  private findPlan(id: string): WorkoutPlan | undefined {
    const bundled = BUILT_IN_WORKOUTS_BY_ID.get(id);
    return bundled ? structuredClone(bundled) : loadPlans(localStorage).find((plan) => plan.id === id);
  }

  private openNewPlan(): void {
    this.draft = createEmptyDraft();
    this.editorMode = 'create';
    this.notice = '';
    this.exercisePickerPhaseId = null;
  }

  private openPlanEditor(plan: WorkoutPlan, asCopy: boolean): void {
    this.draft = structuredClone(plan);
    this.editorMode = asCopy ? 'copy' : 'edit';
    if (asCopy) {
      this.draft.id = createPlanId();
      this.draft.name = {
        ...this.draft.name,
        de: `${this.draft.name.de ?? planTitle(plan, 'de')} · Kopie`,
        en: `${this.draft.name.en ?? planTitle(plan, 'en')} · Custom`
      };
    }
    this.notice = asCopy ? this.t('editor.copyCreated') : '';
    this.exercisePickerPhaseId = null;
    if (this.route() === 'editor') this.render();
    else location.hash = 'editor';
  }

  private shell(content: string): void {
    this.root.classList.toggle('workout-active', this.route() === 'workout' && this.session !== null && this.session.phase !== 'completed');
    const savedPlansLabel = this.route() === 'home' ? this.t('nav.savedRoutines') : this.t('nav.plans');
    const localeOptions = LOCALE_DEFINITIONS.map(({ code, nativeName }) => `<option value="${code}" ${code === this.uiLocale ? 'selected' : ''}>${escapeHtml(nativeName)}</option>`).join('');
    const localePicker = `<label class="language-picker"><span aria-hidden="true">文/A</span><select data-ui-locale aria-label="${escapeHtml(this.t('language.label'))}">${localeOptions}</select></label>`;
    this.root.innerHTML = `
      <header class="site-header">
        <a href="#home" class="brand" aria-label="${escapeHtml(this.t('app.name'))}"><span class="brand-mark">HW</span><span>${escapeHtml(this.t('app.name'))}</span></a>
        <div class="header-actions">${this.route() === 'workout' && this.session?.phase !== 'completed' ? `<button class="workout-exit" data-action="abort" aria-label="${escapeHtml(this.t('button.endWorkout'))}"><span aria-hidden="true">×</span> ${escapeHtml(this.t('button.endWorkout'))}</button>` : `<nav aria-label="${escapeHtml(this.t('nav.primary'))}"><a href="#instructions">${escapeHtml(this.t('nav.instructions'))}</a><a href="#plans" aria-label="${escapeHtml(savedPlansLabel)}">${escapeHtml(this.t('nav.plans'))}</a></nav>`}${localePicker}</div>
      </header>
      <main id="main" tabindex="-1">${content}</main>
      <footer><span>${escapeHtml(this.t('footer.privacy'))}</span><a href="#impressum">${escapeHtml(this.t('nav.legal'))}</a><span>PolyForm Perimeter 1.0.0</span></footer>`;
    this.root.querySelector<HTMLAnchorElement>('.brand')?.addEventListener('click', (event) => {
      if (this.route() !== 'workout' || !this.session) return;
      event.preventDefault();
      this.requestAbortWorkout();
    });
    for (const link of this.root.querySelectorAll<HTMLAnchorElement>('[data-create-plan]')) {
      link.addEventListener('click', () => this.openNewPlan());
    }
    this.root.querySelector<HTMLSelectElement>('[data-ui-locale]')?.addEventListener('change', (event) => {
      const locale = (event.currentTarget as HTMLSelectElement).value;
      if (!isSupportedLocale(locale)) return;
      this.uiLocale = locale;
      this.t = translator(locale);
      persistLocale(localStorage, locale);
      applyDocumentLocale(document.documentElement, locale);
      const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link');
      if (skipLink) skipLink.textContent = this.t('skip.main');
      this.notice = this.t('language.changed');
      this.render();
    });
  }

  private render(): void {
    this.clearScheduledTick();
    const route = this.route();
    if (route === 'workout') this.renderWorkout();
    else if (route === 'editor') this.renderEditor();
    else if (route === 'import') this.renderImport();
    else if (route === 'plans') this.renderPlans();
    else if (route === 'instructions') this.renderInstructions();
    else if (route === 'impressum') this.renderLegalNotice();
    else this.renderHome();
  }

  private clearScheduledTick(): void {
    if (this.tickHandle === null) return;
    window.clearTimeout(this.tickHandle);
    this.tickHandle = null;
  }

  private scheduleWorkoutTick(): void {
    this.clearScheduledTick();
    this.tickHandle = window.setTimeout(() => {
      this.tickHandle = null;
      if (!this.session) return;

      const now = Date.now();
      const previousPosition = `${this.session.phase}:${this.session.phaseIndex}:${this.session.roundIndex}:${this.session.exerciseIndex}:${this.session.workoutPausedAtMs !== null}`;
      this.session = dispatchWorkout(this.session, this.activePlan, { type: 'TICK' }, now);
      saveWorkoutSession(localStorage, this.session);
      const snapshot = getWorkoutSnapshot(this.session, this.activePlan, now);
      const nextPosition = `${snapshot.phase}:${snapshot.phaseIndex}:${snapshot.roundIndex}:${snapshot.exerciseIndex}:${snapshot.paused}`;

      if (previousPosition !== nextPosition) {
        this.renderWorkout();
        return;
      }

      const total = this.root.querySelector<HTMLElement>('[data-workout-total]');
      const countdown = this.root.querySelector<HTMLElement>('[data-workout-countdown]');
      if (total) total.textContent = this.t('status.total', { time: formatClock(snapshot.elapsedWorkoutMs) });
      if (countdown && typeof snapshot.remainingMs === 'number') countdown.textContent = formatClock(snapshot.remainingMs);
      if (snapshot.phase !== 'completed' && !snapshot.paused) this.scheduleWorkoutTick();
    }, 500);
  }

  private renderHome(): void {
    const title = planTitle(this.activePlan, this.uiLocale);
    const savedPlans = loadPlans(localStorage);
    const routineOptions = [
      `<optgroup label="${escapeHtml(this.t('home.bundledRoutines'))}">${BUILT_IN_WORKOUTS.map((plan) => `<option value="${escapeHtml(plan.id)}" ${plan.id === this.activePlan.id ? 'selected' : ''}>${escapeHtml(planTitle(plan, this.uiLocale))}</option>`).join('')}</optgroup>`,
      savedPlans.length ? `<optgroup label="${escapeHtml(this.t('home.myPlans'))}">${savedPlans.map((plan) => `<option value="${escapeHtml(plan.id)}" ${plan.id === this.activePlan.id ? 'selected' : ''}>${escapeHtml(planTitle(plan, this.uiLocale))}</option>`).join('')}</optgroup>` : ''
    ].join('');
    const activeExercises = planExercises(this.activePlan);
    const previews = activeExercises.map((exercise, index) => {
      const definition = EXERCISES_BY_ID.get(exercise.exerciseId);
      const localized = isBuiltInWorkout(this.activePlan.id) ? exerciseTranslation(exercise.exerciseId, this.uiLocale) : undefined;
      const exerciseName = localized?.name ?? exercise.translations[this.uiLocale]?.name ?? exercise.translations.en?.name ?? Object.values(exercise.translations)[0]?.name ?? exercise.exerciseId;
      const category = previewCategory(definition?.category, this.t);
      return `<article class="exercise-preview-card">
        <span class="preview-number">${String(index + 1).padStart(2, '0')}</span>
        <img src="${definition?.illustration ?? '/icon.svg'}" alt="${escapeHtml(exerciseName)}" loading="eager">
        <div>${category ? `<span class="preview-category ${category.className}">${escapeHtml(category.label)}</span>` : ''}<strong>${escapeHtml(exerciseName)}</strong></div>
      </article>`;
    }).join('');
    this.shell(`
      <section class="home-grid">
        <div class="intro-block">
          <p class="eyebrow">${escapeHtml(this.t('home.eyebrow'))}</p>
          <h1>${escapeHtml(this.t('app.name'))}</h1>
          <p class="lede">${escapeHtml(this.t('home.lede'))}</p>
        </div>
        <article class="workout-card">
          <div class="card-topline"><span>${escapeHtml(this.t('home.ready'))}</span><span>${escapeHtml(this.t('home.minutes', { count: estimatedMinutes(this.activePlan) }))}</span></div>
          <label class="routine-picker">${escapeHtml(this.t('home.chooseRoutine'))}<select data-routine-picker>${routineOptions}</select></label>
          <h2>${escapeHtml(title)}</h2>
          <div class="plan-stats" aria-label="${escapeHtml(this.t('home.summary'))}">
            <span>${escapeHtml(this.t('home.phases', { count: this.activePlan.phases.length }))}</span>
            <span>${escapeHtml(this.t('home.rounds', { count: totalRounds(this.activePlan) }))}</span>
            <span>${escapeHtml(this.t('home.exercises', { count: activeExercises.length }))}</span>
          </div>
          <button class="primary start-button" data-action="start">${escapeHtml(this.t('button.startWorkout'))}</button>
          <a class="button-link create-plan-button" href="#editor" data-create-plan>${escapeHtml(this.t('home.createPlan'))}</a>
          <p class="home-safety">${escapeHtml(this.t('home.safety'))} <a href="#impressum">${escapeHtml(this.t('home.moreSafety'))}</a></p>
        </article>
      </section>
      <section class="exercise-preview" aria-labelledby="exercise-preview-title">
        <div class="preview-heading"><div><p class="eyebrow">${escapeHtml(this.t('home.localIllustrations'))}</p><h2 id="exercise-preview-title">${escapeHtml(this.t('home.insideWorkout'))}</h2></div><span>${escapeHtml(this.t('home.illustratedMovements', { count: activeExercises.length }))}</span></div>
        <div class="exercise-preview-grid">${previews}</div>
      </section>
      <section class="plan-options"><div class="plan-options-heading"><p class="eyebrow">${escapeHtml(this.t('home.makeItYours'))}</p><h2>${escapeHtml(this.t('home.planOptionsTitle'))}</h2><p>${escapeHtml(this.t('home.planOptionsCopy'))}</p></div><nav class="action-grid" aria-label="${escapeHtml(this.t('home.summary'))}">
        <a class="action-card" href="#instructions"><span class="action-number">01</span><strong>${escapeHtml(this.t('nav.instructions'))}</strong><span>${escapeHtml(this.t('home.optionInstructions'))}</span></a>
        <a class="action-card" href="#editor" data-create-plan><span class="action-number">02</span><strong>${escapeHtml(this.t('editor.createTitle'))}</strong><span>${escapeHtml(this.t('home.optionCreate'))}</span></a>
        <a class="action-card" href="#import"><span class="action-number">03</span><strong>${escapeHtml(this.t('import.title'))}</strong><span>${escapeHtml(this.t('home.optionImport'))}</span></a>
        <a class="action-card" href="#plans"><span class="action-number">04</span><strong>${escapeHtml(this.t('nav.plans'))}</strong><span>${escapeHtml(this.t('home.optionSaved'))}</span></a>
      </nav></section>
      <div class="github-placeholder">${APP_CONFIG.githubUrl ? `<a href="${escapeHtml(APP_CONFIG.githubUrl)}">GitHub</a>` : '<span>GitHub</span>'}</div>`);
    this.root.querySelector('[data-action="start"]')?.addEventListener('click', () => this.startWorkout(this.activePlan));
    this.root.querySelector<HTMLSelectElement>('[data-routine-picker]')?.addEventListener('change', (event) => {
      const plan = this.findPlan((event.currentTarget as HTMLSelectElement).value);
      if (!plan) return;
      this.activePlan = structuredClone(plan);
      this.renderHome();
    });
  }

  private startWorkout(plan: WorkoutPlan): void {
    this.activePlan = structuredClone(plan);
    this.exerciseOverrides.clear();
    if (!isBuiltInWorkout(plan.id)) savePlan(localStorage, plan);
    this.session = createWorkoutSession(this.activePlan, Date.now());
    saveWorkoutSession(localStorage, this.session);
    location.hash = 'workout';
    this.render();
  }

  private requestAbortWorkout(): void {
    const existingDialog = document.querySelector<HTMLDialogElement>('[data-abort-dialog]');
    if (existingDialog) return;
    const dialog = document.createElement('dialog');
    dialog.dataset.abortDialog = '';
    dialog.setAttribute('aria-labelledby', 'abort-workout-title');
    dialog.innerHTML = `<form method="dialog">
      <p class="eyebrow">${escapeHtml(this.t('button.endWorkout'))}</p>
      <h2 id="abort-workout-title">${escapeHtml(this.t('dialog.endTitle'))}</h2>
      <p>${escapeHtml(this.t('dialog.endCopy'))}</p>
      <div class="dialog-actions"><button value="cancel" autofocus>${escapeHtml(this.t('dialog.continueWorkout'))}</button><button class="danger" value="abort" aria-label="${escapeHtml(this.t('button.endWorkout'))}">${escapeHtml(this.t('button.endWorkout'))}</button></div>
    </form>`;
    document.body.append(dialog);
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'abort') {
        clearWorkoutSession(localStorage);
        this.session = null;
        location.hash = 'home';
        this.render();
      }
      dialog.remove();
    }, { once: true });
    dialog.showModal();
  }

  private requestDeletePlan(plan: WorkoutPlan): void {
    if (isBuiltInWorkout(plan.id) || document.querySelector('[data-delete-plan-dialog]')) return;
    const dialog = document.createElement('dialog');
    dialog.dataset.deletePlanDialog = '';
    dialog.setAttribute('aria-labelledby', 'delete-plan-title');
    dialog.innerHTML = `<form method="dialog">
      <p class="eyebrow">${escapeHtml(this.t('plans.onDevice'))}</p>
      <h2 id="delete-plan-title">${escapeHtml(this.t('plans.deleteTitle', { name: planTitle(plan, this.uiLocale) }))}</h2>
      <p>${escapeHtml(this.t('plans.deleteCopy'))}</p>
      <div class="dialog-actions"><button value="cancel" autofocus>${escapeHtml(this.t('button.cancel'))}</button><button class="danger" value="delete">${escapeHtml(this.t('button.delete'))}</button></div>
    </form>`;
    document.body.append(dialog);
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'delete') {
        deletePlan(localStorage, plan.id);
        if (this.activePlan.id === plan.id) this.activePlan = cloneDefault();
        if (this.session?.planId === plan.id) {
          clearWorkoutSession(localStorage);
          this.session = null;
        }
        this.notice = this.t('plans.deleted');
        this.renderPlans();
      }
      dialog.remove();
    }, { once: true });
    dialog.showModal();
  }

  private renderWorkout(): void {
    this.clearScheduledTick();
    if (!this.session) { location.hash = 'home'; return; }
    const now = Date.now();
    this.session = dispatchWorkout(this.session, this.activePlan, { type: 'TICK' }, now);
    saveWorkoutSession(localStorage, this.session);
    const snapshot = getWorkoutSnapshot(this.session, this.activePlan, now);
    const workoutPhase = this.activePlan.phases[snapshot.phaseIndex]!;
    const exercise = workoutPhase.exercises[snapshot.exerciseIndex]!;
    const selectedExerciseId = this.exerciseOverrides.get(exercise.id) ?? exercise.exerciseId;
    const definition = EXERCISES_BY_ID.get(selectedExerciseId) ?? EXERCISES_BY_ID.get(exercise.exerciseId);
    const languages = this.activePlan.displayLanguages;
    const isTransition = snapshot.phase === 'phase-transition';
    const isRest = snapshot.phase === 'exercise-rest' || snapshot.phase === 'round-rest' || isTransition;
    const statusLabel = snapshot.phase === 'round-rest' ? this.t('phase.roundRest') : snapshot.phase === 'exercise-rest' || isTransition ? this.t('phase.exerciseRest') : snapshot.phase === 'completed' ? this.t('phase.complete') : this.t('phase.currentExercise');
    const target = exercise.type === 'duration' ? formatClock(snapshot.remainingMs ?? 0) : 'min' in exercise.target ? `${exercise.target.min}–${exercise.target.max}${exercise.target.unit === 'per-side' ? ` ${this.t('workout.perSide')}` : ''}` : this.t('button.next');
    const translations = languages.map((code) => {
      const catalogueCopy = isSupportedLocale(code) ? exerciseTranslation(selectedExerciseId, code) : undefined;
      const copy = isBuiltInWorkout(this.activePlan.id) || selectedExerciseId !== exercise.exerciseId
        ? catalogueCopy ?? exercise.translations[code]
        : exercise.translations[code] ?? catalogueCopy;
      return copy ? `<div class="translation"><span>${escapeHtml(localeName(code))}</span><p>${escapeHtml(copy.instructions)}</p></div>` : '';
    }).join('');
    const displayNames = languages.map((code) => {
      const catalogueCopy = isSupportedLocale(code) ? exerciseTranslation(selectedExerciseId, code) : undefined;
      return isBuiltInWorkout(this.activePlan.id) || selectedExerciseId !== exercise.exerciseId
        ? catalogueCopy?.name ?? exercise.translations[code]?.name
        : exercise.translations[code]?.name ?? catalogueCopy?.name;
    }).filter((name): name is string => Boolean(name));
    const imageName = displayNames.join(' / ');
    const alternativeIds = [exercise.exerciseId, ...exercise.alternativeExerciseIds]
      .filter((id, index, ids) => ids.indexOf(id) === index && EXERCISES_BY_ID.has(id));
    const alternatives = !isRest && alternativeIds.length > 1 ? `<div class="alternative-chooser" aria-label="${escapeHtml(this.t('help.alternativesTitle'))}">
      <span>${escapeHtml(this.t('help.alternativesTitle'))}</span>
      <p>${escapeHtml(this.t('help.alternativesCopy'))}</p>
      <div>${alternativeIds.map((id) => {
        const optionName = exerciseTranslation(id, this.uiLocale)?.name ?? EXERCISES_BY_ID.get(id)!.translations.en.name;
        return `<button type="button" data-alternative="${escapeHtml(id)}" aria-pressed="${id === selectedExerciseId}">${escapeHtml(optionName)}</button>`;
      }).join('')}</div>
    </div>` : '';

    this.shell(`
      <section class="workout-screen ${isRest ? 'is-rest' : ''}">
        <div class="workout-content">
          <div class="workout-status"><span>${escapeHtml(this.t('phase.label', { current: snapshot.phaseIndex + 1, total: this.activePlan.phases.length }))} · ${escapeHtml(phaseLabel(workoutPhase.kind, this.t))}</span><span>${escapeHtml(this.t('status.round', { current: snapshot.roundIndex + 1, total: workoutPhase.rounds }))}</span><span data-round-exercise-progress>${escapeHtml(this.t('status.exercise', { current: snapshot.exerciseIndex + 1, total: workoutPhase.exercises.length }))}</span><span data-workout-total>${escapeHtml(this.t('status.total', { time: formatClock(snapshot.elapsedWorkoutMs) }))}</span></div>
          <div class="phase-pill">${escapeHtml(statusLabel)}${snapshot.paused ? ` · ${escapeHtml(this.t('status.paused'))}` : ''}</div>
          ${snapshot.phase === 'completed' ? `<div class="completion"><p class="eyebrow">${escapeHtml(this.t('phase.complete'))}</p><h1>${escapeHtml(this.t('phase.complete'))}</h1><p>${escapeHtml(this.t('workout.completeCopy'))}</p><button class="primary" data-action="finish">${escapeHtml(this.t('button.backHome'))}</button></div>` : `
            ${isTransition ? `<div class="completion phase-transition-card"><p class="eyebrow">${escapeHtml(this.t('button.next'))}</p><h1>${escapeHtml(phaseLabel(this.activePlan.phases[snapshot.phaseIndex + 1]!.kind, this.t))}</h1><p>${escapeHtml(this.t('workout.restCopy'))}</p><strong data-workout-countdown>${formatClock(snapshot.remainingMs ?? 0)}</strong></div>` : `<div class="exercise-layout">
              <div class="exercise-visual-column"><div class="workout-exercise-heading">${displayNames.map(name => `<h2>${escapeHtml(name)}</h2>`).join('')}</div><div class="exercise-visual"><img src="${definition?.illustration ?? '/icon.svg'}?v=${illustrationRevision(selectedExerciseId)}" alt="${escapeHtml(imageName)}"></div>
              <div class="target-block"><span>${escapeHtml(isRest ? this.t('workout.readyIn') : exercise.type === 'duration' ? this.t('workout.timeLeft') : this.t('workout.target'))}</span><strong ${isRest || exercise.type === 'duration' ? 'data-workout-countdown' : ''}>${isRest ? formatClock(snapshot.remainingMs ?? 0) : escapeHtml(target)}</strong></div></div>
              <div class="exercise-copy">${isRest ? `<p class="rest-label">${escapeHtml(this.t('workout.restCopy'))}</p>` : translations}</div>
            </div>`}
            ${alternatives}`}
        </div>
        ${snapshot.phase === 'completed' ? '' : `
          <div class="workout-actions">
            <div class="workout-controls">
              <button data-action="previous" aria-label="${escapeHtml(this.t('button.previous'))}">← <span>${escapeHtml(this.t('button.previous'))}</span></button>
              <button class="pause" data-action="pause" aria-label="${escapeHtml(snapshot.paused ? this.t('button.resume') : this.t('button.pause'))}">${snapshot.paused ? '▶' : 'Ⅱ'}</button>
              <button data-action="next" aria-label="${escapeHtml(this.t('button.next'))}"><span>${escapeHtml(this.t('button.next'))}</span> →</button>
            </div>
          </div>`}
      </section>`);

    const act = (name: string, action: Parameters<typeof dispatchWorkout>[2]): void => {
      this.root.querySelector(`[data-action="${name}"]`)?.addEventListener('click', () => {
        if (!this.session) return;
        this.session = dispatchWorkout(this.session, this.activePlan, action, Date.now());
        saveWorkoutSession(localStorage, this.session);
        this.renderWorkout();
      });
    };
    act('previous', { type: 'PREVIOUS' }); act('next', { type: 'NEXT' });
    act('pause', { type: snapshot.paused ? 'RESUME' : 'PAUSE' });
    this.root.querySelector('[data-action="finish"]')?.addEventListener('click', () => { clearWorkoutSession(localStorage); this.session = null; location.hash = 'home'; });
    this.root.querySelector('[data-action="abort"]')?.addEventListener('click', () => this.requestAbortWorkout());
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-alternative]')) {
      button.addEventListener('click', () => {
        const alternativeId = button.dataset.alternative;
        if (!alternativeId || !alternativeIds.includes(alternativeId)) return;
        if (alternativeId === exercise.exerciseId) this.exerciseOverrides.delete(exercise.id);
        else this.exerciseOverrides.set(exercise.id, alternativeId);
        this.renderWorkout();
      });
    }
    if (snapshot.phase !== 'completed' && !snapshot.paused) this.scheduleWorkoutTick();
  }

  private renderEditor(): void {
    const editorTitle = this.editorMode === 'edit' ? this.t('editor.editTitle') : this.editorMode === 'copy' ? this.t('editor.copyTitle') : this.t('editor.createTitle');
    const editorIntro = this.editorMode === 'edit'
      ? this.t('editor.editIntro')
      : this.editorMode === 'copy'
        ? this.t('editor.copyIntro')
        : this.t('editor.createIntro');
    const exerciseOptions = exerciseCategoryGroups.map(({ category, key }) => {
      const options = EXERCISE_LIBRARY
        .filter((exercise) => exercise.category === category)
        .slice()
        .sort((left, right) => (exerciseTranslation(left.id, this.uiLocale)?.name ?? left.translations.en.name).localeCompare(exerciseTranslation(right.id, this.uiLocale)?.name ?? right.translations.en.name, this.uiLocale, { sensitivity: 'base' }))
        .map((exercise) => `<option value="${exercise.id}">${escapeHtml(exerciseTranslation(exercise.id, this.uiLocale)?.name ?? exercise.translations.en.name)}</option>`)
        .join('');
      return `<optgroup label="${escapeHtml(this.t(key))}">${options}</optgroup>`;
    }).join('');
    let flatIndex = 0;
    const renderExerciseRow = (exercise: PlanExercise, phaseId: string, index: number): string => {
      const formIndex = flatIndex++;
      const name = exercise.translations.en?.name ?? Object.values(exercise.translations)[0]?.name ?? exercise.exerciseId;
      const translationFields = this.draft.languages.map((language) => {
        const copy = exercise.translations[language.code] ?? { name, instructions: '' };
        return `<fieldset><legend>${escapeHtml(language.label)} (${escapeHtml(language.code)})</legend><label>${escapeHtml(this.t('editor.exerciseName'))}<input name="translation-${formIndex}-${escapeHtml(language.code)}-name" value="${escapeHtml(copy.name)}" required></label><label>${escapeHtml(this.t('editor.instructions'))}<textarea name="translation-${formIndex}-${escapeHtml(language.code)}-instructions" rows="3" required>${escapeHtml(copy.instructions)}</textarea></label></fieldset>`;
      }).join('');
      const targetFields = exercise.type === 'duration' && 'seconds' in exercise.target
        ? `<label>${escapeHtml(this.t('editor.seconds'))}<input name="target-${formIndex}-seconds" type="number" min="1" max="7200" value="${exercise.target.seconds}"></label>`
        : 'min' in exercise.target
          ? `<label>${escapeHtml(this.t('editor.minimum'))}<input name="target-${formIndex}-min" type="number" min="1" max="1000" value="${exercise.target.min}"></label><label>${escapeHtml(this.t('editor.maximum'))}<input name="target-${formIndex}-max" type="number" min="1" max="1000" value="${exercise.target.max}"></label><label>${escapeHtml(this.t('editor.countMode'))}<select name="target-${formIndex}-unit"><option value="repetitions" ${exercise.target.unit === 'repetitions' ? 'selected' : ''}>${escapeHtml(this.t('editor.totalRepetitions'))}</option><option value="per-side" ${exercise.target.unit === 'per-side' ? 'selected' : ''}>${escapeHtml(this.t('editor.perSide'))}</option></select></label>`
          : `<span>${escapeHtml(this.t('button.next'))}</span>`;
      return `<li data-exercise-row="${formIndex}"><span class="order">${String(index + 1).padStart(2, '0')}</span><div class="exercise-row-main"><strong>${escapeHtml(name)}</strong><div class="target-fields">${targetFields}</div><details class="translation-editor"><summary>${escapeHtml(this.t('editor.editTranslations'))}</summary>${translationFields}</details></div><span class="row-actions"><button type="button" data-move="up" data-phase-id="${escapeHtml(phaseId)}" data-id="${escapeHtml(exercise.id)}" aria-label="${escapeHtml(this.t('editor.moveUp', { name }))}">↑</button><button type="button" data-move="down" data-phase-id="${escapeHtml(phaseId)}" data-id="${escapeHtml(exercise.id)}" aria-label="${escapeHtml(this.t('editor.moveDown', { name }))}">↓</button><button type="button" data-remove="${escapeHtml(exercise.id)}" data-phase-id="${escapeHtml(phaseId)}" aria-label="${escapeHtml(this.t('editor.removeExercise', { name }))}">${escapeHtml(this.t('button.remove'))}</button></span></li>`;
    };
    const phaseSections = this.draft.phases.map((phase, phaseIndex) => {
      const rows = phase.exercises.map((exercise, index) => renderExerciseRow(exercise, phase.id, index)).join('');
      const picker = this.exercisePickerPhaseId === phase.id ? `<div class="inline-form"><label>${escapeHtml(this.t('editor.selectExercise'))}<select name="exercise-library" size="5">${exerciseOptions}</select></label><button type="button" data-action="add-selected" data-phase-id="${escapeHtml(phase.id)}">${escapeHtml(this.t('editor.addSelected'))}</button></div>` : '';
      const label = phaseLabel(phase.kind, this.t);
      return `<article class="phase-editor" data-phase="${escapeHtml(phase.id)}">
        <div class="section-heading"><div><p class="eyebrow">${escapeHtml(this.t('phase.label', { current: phaseIndex + 1, total: this.draft.phases.length }))}</p><h3>${escapeHtml(label)}</h3></div>
          <span class="row-actions"><button type="button" data-move-phase="up" data-phase-id="${escapeHtml(phase.id)}" aria-label="${escapeHtml(this.t('editor.moveUp', { name: label }))}">↑</button><button type="button" data-move-phase="down" data-phase-id="${escapeHtml(phase.id)}" aria-label="${escapeHtml(this.t('editor.moveDown', { name: label }))}">↓</button>${phase.kind === 'training' && this.draft.phases.filter(({ kind }) => kind === 'training').length === 1 ? '' : `<button type="button" data-remove-phase="${escapeHtml(phase.id)}">${escapeHtml(this.t('editor.removePhase'))}</button>`}</span>
        </div>
        <div class="field-grid phase-settings">
          <label>${escapeHtml(this.t('editor.type'))}<select name="phase-${phaseIndex}-kind"><option value="warm-up" ${phase.kind === 'warm-up' ? 'selected' : ''}>${escapeHtml(this.t('category.warmUp'))}</option><option value="training" ${phase.kind === 'training' ? 'selected' : ''}>${escapeHtml(this.t('phase.training'))}</option><option value="active-recovery" ${phase.kind === 'active-recovery' ? 'selected' : ''}>${escapeHtml(this.t('phase.activeRecovery'))}</option><option value="cool-down" ${phase.kind === 'cool-down' ? 'selected' : ''}>${escapeHtml(this.t('phase.coolDown'))}</option></select></label>
          <label>${escapeHtml(this.t('editor.rounds'))}<input name="phase-${phaseIndex}-rounds" type="number" min="1" max="20" value="${phase.rounds}"></label>
          <label>${escapeHtml(this.t('editor.restExercises'))}<input name="phase-${phaseIndex}-rest-exercises" type="number" min="0" value="${phase.restBetweenExercises}"></label>
          <label>${escapeHtml(this.t('editor.restRounds'))}<input name="phase-${phaseIndex}-rest-rounds" type="number" min="0" value="${phase.restBetweenRounds}"></label>
          <label>${escapeHtml(this.t('editor.restAfterPhase'))}<input name="phase-${phaseIndex}-rest-after" type="number" min="0" value="${phase.restAfterPhase}"></label>
        </div>
        <button type="button" class="secondary" data-action="show-exercises" data-phase-id="${escapeHtml(phase.id)}">${escapeHtml(this.t('editor.addExercise'))}</button>${picker}
        <ol class="exercise-list">${rows || `<li class="empty">${escapeHtml(this.t('editor.noneExercises'))}</li>`}</ol>
        <details class="custom-exercise"><summary>${escapeHtml(this.t('editor.createCustom'))}</summary><div class="inline-form"><label>${escapeHtml(this.t('editor.exerciseName'))}<input name="custom-name-${escapeHtml(phase.id)}"></label><label>${escapeHtml(this.t('editor.type'))}<select name="custom-type-${escapeHtml(phase.id)}"><option value="repetitions">${escapeHtml(this.t('editor.repetitions'))}</option><option value="duration">${escapeHtml(this.t('editor.duration'))}</option><option value="untimed">${escapeHtml(this.t('editor.untimed'))}</option></select></label><button type="button" data-action="add-custom" data-phase-id="${escapeHtml(phase.id)}">${escapeHtml(this.t('editor.addCustom'))}</button></div></details>
      </article>`;
    }).join('');
    const languageChecks = LOCALE_DEFINITIONS.map((language) => `<label class="check"><input type="checkbox" data-display-language="${escapeHtml(language.code)}" ${this.draft.displayLanguages.includes(language.code) ? 'checked' : ''}> ${escapeHtml(language.nativeName)}</label>`).join('');
    const planNameFields = this.draft.languages.map((language) => `<label>${escapeHtml(this.t('editor.planName', { language: localeName(language.code) }))}<input name="name-${escapeHtml(language.code)}" value="${escapeHtml(this.draft.name[language.code] ?? '')}" required></label>`).join('');
    const defaultSourceLanguage = this.draft.languages.find(({ code }) => code === 'en')?.code ?? this.draft.languages[0]?.code ?? '';
    const defaultTargetLanguage = [...this.draft.languages].reverse().find(({ code }) => code !== defaultSourceLanguage)?.code ?? '';
    const languageOptions = (selected: string): string => this.draft.languages.map((language) => `<option value="${escapeHtml(language.code)}" ${language.code === selected ? 'selected' : ''}>${escapeHtml(language.label)} (${escapeHtml(language.code)})</option>`).join('');
    const translationReviews = Object.entries(this.draft.translationMetadata ?? {}).map(([code, metadata]) => {
      const label = this.draft.languages.find((language) => language.code === code)?.label ?? code;
      const status = metadata.reviewStatus === 'reviewed' ? this.t('translation.reviewed') : this.t('translation.reviewRequired');
      return `<label class="translation-review"><input type="checkbox" data-review-translation="${escapeHtml(code)}" ${metadata.reviewStatus === 'reviewed' ? 'checked' : ''}><span><strong>${escapeHtml(this.t('translation.machineTranslated', { language: label }))}</strong><small>${escapeHtml(this.t('translation.sourceProvider', { source: metadata.sourceLanguage, provider: metadata.provider, status }))}</small></span></label>`;
    }).join('');
    const translationAssistant = this.draft.languages.length > 1 ? `<div class="translation-assistant"><div><p class="eyebrow">${escapeHtml(this.t('translation.eyebrow'))}</p><h3>${escapeHtml(this.t('translation.title'))}</h3><p>${escapeHtml(this.t('translation.privacy'))}</p></div><div class="translation-controls"><label>${escapeHtml(this.t('translation.source'))}<select name="translation-source">${languageOptions(defaultSourceLanguage)}</select></label><label>${escapeHtml(this.t('translation.target'))}<select name="translation-target">${languageOptions(defaultTargetLanguage)}</select></label><button type="button" class="secondary" data-action="translate-plan" ${this.translationBusy ? 'disabled' : ''}>${escapeHtml(this.translationBusy ? this.t('translation.translating') : this.t('translation.translateDraft'))}</button></div>${translationReviews ? `<div class="translation-reviews">${translationReviews}</div>` : ''}</div>` : '';
    this.shell(`
      <section class="page-heading"><p class="eyebrow">${escapeHtml(this.t('editor.eyebrow'))}</p><h1>${escapeHtml(editorTitle)}</h1><p>${escapeHtml(editorIntro)}</p></section>
      <aside class="editor-ai-callout"><div><p class="eyebrow">${escapeHtml(this.t('editor.aiEyebrow'))}</p><h2>${escapeHtml(this.t('editor.aiTitle'))}</h2><p>${escapeHtml(this.t('editor.aiCopy'))}</p>${aiSafetyNotice(this.t)}</div><a class="button-link primary" href="#instructions" data-open-ai-guide>${escapeHtml(this.t('editor.openAiGuide'))}</a></aside>
      <form class="editor" data-editor>
        <section class="form-section"><h2>${escapeHtml(this.t('editor.basics'))}</h2><div class="field-grid">
          ${planNameFields}
        </div></section>
        <section class="form-section"><div class="section-heading"><div><h2>${escapeHtml(this.t('editor.languages'))}</h2><p>${escapeHtml(this.t('editor.trainingLanguageHelp'))}</p></div></div>
          <div class="check-row"><span>${escapeHtml(this.t('editor.visibleLanguages'))}</span>${languageChecks}</div>
          ${translationAssistant}
        </section>
        <section class="form-section"><div class="section-heading"><div><h2>${escapeHtml(this.t('editor.phases'))}</h2><p>${escapeHtml(this.t('editor.phaseIntro'))}</p></div><button type="button" class="secondary" data-action="add-phase">${escapeHtml(this.t('editor.addTrainingBlock'))}</button></div>
          <div class="phase-list">${phaseSections}</div>
        </section>
        <div class="editor-actions"><button type="button" class="primary" data-action="save-plan">${escapeHtml(this.editorMode === 'edit' ? this.t('button.saveChanges') : this.t('button.saveLocally'))}</button><button type="button" data-action="start-plan">${escapeHtml(this.t('button.start'))}</button><button type="button" data-action="export-plan">${escapeHtml(this.t('editor.exportJson'))}</button></div>
        <p class="notice" role="status">${escapeHtml(this.notice)}</p>
      </form>`);
    this.bindEditor();
  }

  private syncDraftFromForm(): void {
    const form = this.root.querySelector<HTMLFormElement>('[data-editor]');
    if (!form) return;
    const data = new FormData(form);
    for (const language of this.draft.languages) {
      this.draft.name[language.code] = String(data.get(`name-${language.code}`) ?? '').trim();
    }
    let formIndex = 0;
    this.draft.phases = this.draft.phases.map((phase, phaseIndex) => ({
      ...phase,
      kind: String(data.get(`phase-${phaseIndex}-kind`) ?? phase.kind) as WorkoutPhaseKind,
      rounds: Number(data.get(`phase-${phaseIndex}-rounds`)),
      restBetweenExercises: Math.max(0, Number(data.get(`phase-${phaseIndex}-rest-exercises`)) || 0),
      restBetweenRounds: Math.max(0, Number(data.get(`phase-${phaseIndex}-rest-rounds`)) || 0),
      restAfterPhase: Math.max(0, Number(data.get(`phase-${phaseIndex}-rest-after`)) || 0),
      exercises: phase.exercises.map((exercise) => {
      const index = formIndex++;
      const translations = Object.fromEntries(this.draft.languages.map((language) => [language.code, {
        name: String(data.get(`translation-${index}-${language.code}-name`) ?? exercise.translations[language.code]?.name ?? '').trim(),
        instructions: String(data.get(`translation-${index}-${language.code}-instructions`) ?? exercise.translations[language.code]?.instructions ?? '').trim()
      }]));
      if (exercise.type === 'duration') {
        return { ...exercise, translations, target: { seconds: Number(data.get(`target-${index}-seconds`)) || 0 } };
      }
      if (exercise.type === 'untimed') return { ...exercise, translations, target: {} };
      return {
        ...exercise,
        translations,
        target: {
          min: Number(data.get(`target-${index}-min`)) || 0,
          max: Number(data.get(`target-${index}-max`)) || 0,
          unit: data.get(`target-${index}-unit`) === 'per-side' ? 'per-side' : 'repetitions'
        }
      };
    })
    }));
  }

  private normalizedDraft(): WorkoutPlan {
    this.syncDraftFromForm();
    const fallbackName = this.draft.name.en || this.draft.name.de || 'Workout';
    for (const language of this.draft.languages) this.draft.name[language.code] ||= fallbackName;
    for (const exercise of planExercises(this.draft)) {
      const fallback = exercise.translations.en ?? exercise.translations.de ?? Object.values(exercise.translations)[0]!;
      for (const language of this.draft.languages) {
        const copy = exercise.translations[language.code];
        if (!copy?.name.trim() || !copy.instructions.trim()) exercise.translations[language.code] = { name: fallback.name, instructions: fallback.instructions };
      }
    }
    const plan = validateWorkoutPlan(structuredClone(this.draft)) as WorkoutPlan;
    const pendingReview = Object.entries(plan.translationMetadata ?? {}).find(([, metadata]) => metadata.reviewStatus === 'needs-review');
    if (pendingReview) {
      const label = plan.languages.find(({ code }) => code === pendingReview[0])?.label ?? pendingReview[0];
      throw new Error(this.t('translation.confirmBeforeSave', { language: label }));
    }
    return plan;
  }

  private async preTranslateDraft(): Promise<void> {
    this.syncDraftFromForm();
    const sourceLanguage = this.root.querySelector<HTMLSelectElement>('[name="translation-source"]')?.value ?? '';
    const targetLanguage = this.root.querySelector<HTMLSelectElement>('[name="translation-target"]')?.value ?? '';
    if (!sourceLanguage || !targetLanguage || sourceLanguage === targetLanguage) { this.notice = this.t('translation.chooseDifferent'); this.renderEditor(); return; }
    this.translationBusy = true;
    this.notice = this.t('translation.replacesTarget');
    this.renderEditor();
    try {
      this.draft = await translatePlanDraft(this.draft, sourceLanguage, targetLanguage);
      const label = this.draft.languages.find(({ code }) => code === targetLanguage)?.label ?? targetLanguage;
      this.notice = this.t('translation.completed', { language: label });
    } catch (error) {
      this.notice = error instanceof Error ? error.message : this.t('error.translationUnavailable');
    } finally {
      this.translationBusy = false;
      this.renderEditor();
    }
  }

  private bindEditor(): void {
    this.root.querySelector('[data-open-ai-guide]')?.addEventListener('click', () => this.syncDraftFromForm());
    this.root.querySelector('[data-action="translate-plan"]')?.addEventListener('click', () => { void this.preTranslateDraft(); });
    for (const checkbox of this.root.querySelectorAll<HTMLInputElement>('[data-review-translation]')) checkbox.addEventListener('change', () => {
      this.syncDraftFromForm();
      const code = checkbox.dataset.reviewTranslation;
      const metadata = code ? this.draft.translationMetadata?.[code] : undefined;
      if (!metadata) return;
      metadata.reviewStatus = checkbox.checked ? 'reviewed' : 'needs-review';
      const label = this.draft.languages.find((language) => language.code === code)?.label ?? code;
      this.notice = `${label}: ${checkbox.checked ? this.t('translation.reviewed') : this.t('translation.reviewRequired')}`;
      const notice = this.root.querySelector<HTMLElement>('.notice');
      if (notice) notice.textContent = this.notice;
    });
    for (const checkbox of this.root.querySelectorAll<HTMLInputElement>('[data-display-language]')) checkbox.addEventListener('change', () => {
      this.syncDraftFromForm();
      const selected = [...this.root.querySelectorAll<HTMLInputElement>('[data-display-language]:checked')].map((item) => item.dataset.displayLanguage!).slice(0, 2);
      if (!selected.length) {
        checkbox.checked = true;
        return;
      }
      for (const code of selected) {
        if (!this.draft.languages.some((language) => language.code === code)) this.draft.languages.push({ code, label: localeName(code) });
        if (isSupportedLocale(code)) {
          this.draft.name[code] ||= routineNames[this.draft.id as keyof typeof routineNames]?.[code] ?? this.draft.name.en ?? Object.values(this.draft.name)[0] ?? 'Workout';
          for (const exercise of planExercises(this.draft)) {
            const copy = exerciseTranslation(exercise.exerciseId, code) ?? exercise.translations.en ?? Object.values(exercise.translations)[0];
            if (copy) exercise.translations[code] = { ...copy };
          }
        }
      }
      this.draft.displayLanguages = selected;
      this.renderEditor();
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="show-exercises"]')) button.addEventListener('click', () => { this.syncDraftFromForm(); this.exercisePickerPhaseId = button.dataset.phaseId ?? null; this.renderEditor(); });
    this.root.querySelector<HTMLButtonElement>('[data-action="add-selected"]')?.addEventListener('click', (event) => {
      this.syncDraftFromForm(); const button = event.currentTarget as HTMLButtonElement; const phase = this.draft.phases.find(({ id }) => id === button.dataset.phaseId); const id = this.root.querySelector<HTMLSelectElement>('[name="exercise-library"]')?.value; const definition = id ? EXERCISES_BY_ID.get(id) : undefined;
      if (!definition || !phase) return;
      const translations = Object.fromEntries(this.draft.languages.map(({ code }) => [code, isSupportedLocale(code) ? exerciseTranslation(definition.id, code) ?? definition.translations.en : definition.translations.en]));
      phase.exercises.push({ id: `${definition.id}-${crypto.randomUUID()}`, exerciseId: definition.id, type: definition.type, target: structuredClone(definition.defaultTarget), translations: structuredClone(translations), alternativeExerciseIds: [...definition.variants.easier] });
      this.exercisePickerPhaseId = null; this.renderEditor();
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="add-custom"]')) button.addEventListener('click', () => {
      this.syncDraftFromForm(); const phaseId = button.dataset.phaseId ?? ''; const phase = this.draft.phases.find(({ id }) => id === phaseId); const name = this.root.querySelector<HTMLInputElement>(`[name="custom-name-${CSS.escape(phaseId)}"]`)?.value.trim(); const type = this.root.querySelector<HTMLSelectElement>(`[name="custom-type-${CSS.escape(phaseId)}"]`)?.value as PlanExercise['type'];
      if (!name || !phase) return;
      const translations = Object.fromEntries(this.draft.languages.map(({ code }) => [code, { name, instructions: isSupportedLocale(code) ? translator(code)('custom.defaultInstructions') : this.t('custom.defaultInstructions') }]));
      const target = type === 'duration' ? { seconds: 30 } : type === 'untimed' ? {} : { min: 8, max: 12, unit: 'repetitions' as const };
      phase.exercises.push({ id: `custom-${crypto.randomUUID()}`, exerciseId: `custom-${Date.now()}`, type, target, translations, alternativeExerciseIds: [] });
      this.renderEditor();
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-remove]')) button.addEventListener('click', () => { this.syncDraftFromForm(); const phase = this.draft.phases.find(({ id }) => id === button.dataset.phaseId); if (phase) phase.exercises = phase.exercises.filter(({ id }) => id !== button.dataset.remove); this.renderEditor(); });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-move]')) button.addEventListener('click', () => {
      this.syncDraftFromForm(); const phase = this.draft.phases.find(({ id }) => id === button.dataset.phaseId); const index = phase?.exercises.findIndex(({ id }) => id === button.dataset.id) ?? -1; const destination = button.dataset.move === 'up' ? index - 1 : index + 1;
      if (!phase || index < 0 || destination < 0 || destination >= phase.exercises.length) return;
      const [item] = phase.exercises.splice(index, 1); phase.exercises.splice(destination, 0, item!); this.renderEditor();
    });
    this.root.querySelector('[data-action="add-phase"]')?.addEventListener('click', () => { this.syncDraftFromForm(); const coolDownIndex = this.draft.phases.findIndex(({ kind }) => kind === 'cool-down'); this.draft.phases.splice(coolDownIndex < 0 ? this.draft.phases.length : coolDownIndex, 0, { id: `training-${crypto.randomUUID()}`, kind: 'training', rounds: 1, restBetweenExercises: 20, restBetweenRounds: 60, restAfterPhase: 30, exercises: [] }); this.notice = this.t('editor.addTrainingBlock'); this.renderEditor(); });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-remove-phase]')) button.addEventListener('click', () => { this.syncDraftFromForm(); this.draft.phases = this.draft.phases.filter(({ id }) => id !== button.dataset.removePhase); this.renderEditor(); });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-move-phase]')) button.addEventListener('click', () => { this.syncDraftFromForm(); const index = this.draft.phases.findIndex(({ id }) => id === button.dataset.phaseId); const destination = button.dataset.movePhase === 'up' ? index - 1 : index + 1; if (index < 0 || destination < 0 || destination >= this.draft.phases.length) return; const [phase] = this.draft.phases.splice(index, 1); this.draft.phases.splice(destination, 0, phase!); this.renderEditor(); });
    const withPlan = (callback: (plan: WorkoutPlan) => void): void => { try { callback(this.normalizedDraft()); } catch (error) { this.notice = error instanceof Error && /rounds: must be a positive integer/.test(error.message) ? this.t('editor.roundsMinimum') : error instanceof Error ? error.message : this.t('error.invalidPlan'); this.renderEditor(); } };
    this.root.querySelector('[data-action="save-plan"]')?.addEventListener('click', () => withPlan((plan) => {
      savePlan(localStorage, plan);
      this.editorMode = 'edit';
      this.notice = this.t('editor.saved');
      this.renderEditor();
    }));
    this.root.querySelector('[data-action="start-plan"]')?.addEventListener('click', () => withPlan((plan) => this.startWorkout(plan)));
    this.root.querySelector('[data-action="export-plan"]')?.addEventListener('click', () => withPlan((plan) => {
      const blob = new Blob([exportPlanJson(plan)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${plan.id}.json`; link.click(); URL.revokeObjectURL(link.href);
    }));
  }

  private renderImport(): void {
    const preview = this.importPreview;
    this.shell(`<section class="page-heading"><p class="eyebrow">${escapeHtml(this.t('import.eyebrow'))}</p><h1>${escapeHtml(this.t('import.title'))}</h1><p>${escapeHtml(this.t('import.intro'))}</p></section>
      <section class="import-panel"><label class="drop-zone">${escapeHtml(this.t('import.fileLabel'))}<input type="file" accept="application/json,.json" data-import><span>${escapeHtml(this.t('import.dropCopy'))}</span></label>
      ${this.notice ? `<p role="alert" class="error">${escapeHtml(this.notice)}</p>` : ''}
      ${preview ? `<div class="preview"><p class="eyebrow">${escapeHtml(this.t('import.valid'))} · SCHEMA V${preview.schemaVersion}</p><h2>${escapeHtml(this.t('import.preview'))}</h2><h3>${escapeHtml(planTitle(preview, this.uiLocale))}</h3><p>${preview.phases.length}</p><ul>${planExercises(preview).map((exercise) => `<li>${escapeHtml(exercise.translations[this.uiLocale]?.name ?? Object.values(exercise.translations)[0]?.name ?? exercise.exerciseId)}</li>`).join('')}</ul><div class="editor-actions"><button class="primary" data-action="start-import">${escapeHtml(this.t('button.start'))}</button><button data-action="save-import">${escapeHtml(this.t('button.saveLocally'))}</button></div></div>` : ''}</section>`);
    this.root.querySelector<HTMLInputElement>('[data-import]')?.addEventListener('change', (event) => {
      void (async () => {
        const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
        try { this.importPreview = importPlanJson(await file.text()); this.notice = ''; }
        catch (error) { this.importPreview = null; this.notice = error instanceof Error ? error.message : this.t('error.invalidPlan'); }
        this.renderImport();
      })();
    });
    this.root.querySelector('[data-action="start-import"]')?.addEventListener('click', () => { if (this.importPreview) this.startWorkout(this.importPreview); });
    this.root.querySelector('[data-action="save-import"]')?.addEventListener('click', () => { if (this.importPreview) { savePlan(localStorage, this.importPreview); this.notice = this.t('editor.saved'); this.renderImport(); } });
  }

  private renderPlans(): void {
    const plans = loadPlans(localStorage);
    const card = (plan: WorkoutPlan, bundled: boolean): string => `<article class="plan-card">
      <div><span>${escapeHtml(this.t('plans.cardStats', { rounds: totalRounds(plan), exercises: planExercises(plan).length, minutes: estimatedMinutes(plan) }))}</span><h2>${escapeHtml(planTitle(plan, this.uiLocale))}</h2><p>${escapeHtml(bundled ? this.t('plans.bundledDescription') : this.t('plans.localDescription'))}</p></div>
      <div class="plan-card-actions"><button class="primary" data-start-plan="${escapeHtml(plan.id)}">${escapeHtml(this.t('button.start'))}</button><button data-${bundled ? 'copy' : 'edit'}-plan="${escapeHtml(plan.id)}">${escapeHtml(bundled ? this.t('button.customize') : this.t('button.edit'))}</button>${bundled ? '' : `<button data-duplicate-plan="${escapeHtml(plan.id)}">${escapeHtml(this.t('button.duplicate'))}</button><button class="danger" data-delete-plan="${escapeHtml(plan.id)}">${escapeHtml(this.t('button.delete'))}</button>`}</div>
    </article>`;
    this.shell(`<section class="page-heading"><p class="eyebrow">${escapeHtml(this.t('plans.eyebrow'))}</p><h1>${escapeHtml(this.t('plans.title'))}</h1><p>${escapeHtml(this.t('plans.intro'))}</p>${this.notice ? `<p class="notice" role="status">${escapeHtml(this.notice)}</p>` : ''}</section>
      <section class="saved-plans plan-section"><div class="section-heading"><div><p class="eyebrow">${escapeHtml(this.t('plans.alwaysAvailable'))}</p><h2>${escapeHtml(this.t('home.bundledRoutines'))}</h2></div><span>${escapeHtml(this.t('plans.routineCount', { count: BUILT_IN_WORKOUTS.length }))}</span></div>${BUILT_IN_WORKOUTS.map((plan) => card(plan, true)).join('')}</section>
      <section class="saved-plans plan-section"><div class="section-heading"><div><p class="eyebrow">${escapeHtml(this.t('plans.onDevice'))}</p><h2>${escapeHtml(this.t('nav.plans'))}</h2></div><a class="button-link" href="#editor" data-create-plan>${escapeHtml(this.t('editor.createTitle'))}</a></div>${plans.length ? plans.map((plan) => card(plan, false)).join('') : `<div class="empty-state"><h2>${escapeHtml(this.t('plans.noneTitle'))}</h2><p>${escapeHtml(this.t('plans.noneCopy'))}</p><a class="button-link" href="#editor" data-create-plan>${escapeHtml(this.t('editor.createTitle'))}</a></div>`}</section>`);
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-start-plan]')) button.addEventListener('click', () => { const plan = this.findPlan(button.dataset.startPlan ?? ''); if (plan) this.startWorkout(plan); });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-copy-plan]')) button.addEventListener('click', () => {
      const plan = this.findPlan(button.dataset.copyPlan ?? '');
      if (plan) this.openPlanEditor(plan, true);
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-edit-plan]')) button.addEventListener('click', () => {
      const plan = this.findPlan(button.dataset.editPlan ?? '');
      if (plan && !isBuiltInWorkout(plan.id)) this.openPlanEditor(plan, false);
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-duplicate-plan]')) button.addEventListener('click', () => {
      const source = this.findPlan(button.dataset.duplicatePlan ?? '');
      if (!source || isBuiltInWorkout(source.id)) return;
      const copy = structuredClone(source);
      copy.id = createPlanId();
      copy.name = Object.fromEntries(Object.entries(copy.name).map(([code, name]) => [
        code,
        `${name} · ${isSupportedLocale(code) ? translator(code)('plans.copySuffix') : translator('en')('plans.copySuffix')}`
      ]));
      copy.phases = copy.phases.map((phase) => ({ ...phase, id: `${phase.kind}-${crypto.randomUUID()}`, exercises: phase.exercises.map((exercise) => ({ ...exercise, id: `${exercise.exerciseId}-${crypto.randomUUID()}` })) }));
      savePlan(localStorage, validateWorkoutPlan(copy) as WorkoutPlan);
      this.notice = this.t('plans.duplicated');
      this.renderPlans();
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-delete-plan]')) button.addEventListener('click', () => {
      const plan = this.findPlan(button.dataset.deletePlan ?? '');
      if (plan && !isBuiltInWorkout(plan.id)) this.requestDeletePlan(plan);
    });
  }

  private renderInstructions(): void {
    const guideUrl = new URL('/ai-workout-guide.txt', location.origin).href;
    const items: Array<[string, string]> = [
      [this.t('help.startTitle'), this.t('help.startCopy')],
      [this.t('help.targetsTitle'), this.t('help.targetsCopy')],
      [this.t('help.roundsTitle'), this.t('help.roundsCopy')],
      [this.t('help.timersTitle'), this.t('help.timersCopy')],
      [this.t('help.pauseTitle'), this.t('help.pauseCopy')],
      [this.t('help.alternativesTitle'), this.t('help.alternativesCopy')],
      [this.t('help.ownPlansTitle'), this.t('help.ownPlansCopy')],
      [this.t('help.importTitle'), this.t('help.importCopy')],
      [this.t('help.languagesTitle'), this.t('help.languagesCopy')],
      [this.t('help.offlineTitle'), `${this.t('help.offlineCopy')} ${this.t('help.installTitle')}: ${this.t('help.installCopy')} <a href="https://support.apple.com/guide/iphone/bookmark-a-website-iphea86e5236/ios">${escapeHtml(this.t('help.appleInstructions'))}</a> · <a href="https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&amp;hl=en">${escapeHtml(this.t('help.chromeInstructions'))}</a>.`]
    ];
    this.shell(`<section class="page-heading"><p class="eyebrow">${escapeHtml(this.t('help.eyebrow'))}</p><h1>${escapeHtml(this.t('help.title'))}</h1><p>${escapeHtml(this.t('help.intro'))}</p></section>
      <section class="ai-plan-guide"><p class="eyebrow">${escapeHtml(this.t('ai.guideEyebrow'))}</p><h2>${escapeHtml(this.t('ai.guideTitle'))}</h2><p>${escapeHtml(this.t('ai.guideCopy'))}</p><div class="copy-field"><code>${escapeHtml(guideUrl)}</code><button class="primary" data-action="copy-ai-guide">${escapeHtml(this.t('button.copyLink'))}</button></div><p>${escapeHtml(this.t('ai.guideResult'))}</p>${aiSafetyNotice(this.t)}</section>
      <section class="instruction-list">${items.map(([title, copy], index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h2>${escapeHtml(title)}</h2><p>${index === 9 ? copy : escapeHtml(copy)}</p></div></article>`).join('')}</section><aside class="safety"><strong>${escapeHtml(this.t('legal.ownResponsibility'))}</strong><p>${escapeHtml(this.t('legal.healthCopy'))}</p></aside>`);
    this.root.querySelector<HTMLButtonElement>('[data-action="copy-ai-guide"]')?.addEventListener('click', (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      void navigator.clipboard.writeText(guideUrl).then(() => { button.textContent = this.t('button.copied'); }).catch(() => { window.prompt(this.t('button.copyLink'), guideUrl); });
    });
  }


  private renderLegalNotice(): void {
    this.shell(`<section class="page-heading"><p class="eyebrow">${escapeHtml(this.t('legal.eyebrow'))}</p><h1>${escapeHtml(this.t('legal.title'))}</h1><p>${escapeHtml(this.t('legal.intro'))}</p></section><section class="instruction-list legal-notice"><h2>${escapeHtml(this.t('legal.provider'))}</h2><address>Dr. Dustin Hebecker<br>${__LEGAL_ADDRESS__.length ? __LEGAL_ADDRESS__.map(escapeHtml).join('<br>') : escapeHtml(this.t('legal.addressMissing'))}</address><h2>${escapeHtml(this.t('legal.ownResponsibility'))}</h2><p>${escapeHtml(this.t('legal.responsibilityCopy'))}</p><p>${escapeHtml(this.t('legal.healthCopy'))}</p><p>${escapeHtml(this.t('legal.liability'))}</p><h2>${escapeHtml(this.t('legal.feedback'))}</h2><p>${escapeHtml(this.t('legal.feedbackCopy'))} <a href="${APP_CONFIG.githubUrl}/issues">${escapeHtml(this.t('legal.feedbackLink'))}</a></p></section>`);
  }

  private showResumeDialog(): void {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', this.t('dialog.resumeLabel'));
    dialog.innerHTML = `<form method="dialog"><p class="eyebrow">${escapeHtml(this.t('dialog.resumeLabel'))}</p><h2>${escapeHtml(this.t('dialog.resumeTitle'))}</h2><p>${escapeHtml(this.t('dialog.resumeCopy'))}</p><div class="dialog-actions"><button value="resume" class="primary">${escapeHtml(this.t('button.resume'))}</button><button value="restart">${escapeHtml(this.t('button.startOver'))}</button></div></form>`;
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'restart') { clearWorkoutSession(localStorage); this.startWorkout(this.activePlan); }
      else { location.hash = 'workout'; this.render(); }
      dialog.remove();
    });
    document.body.append(dialog); dialog.showModal();
  }
}
