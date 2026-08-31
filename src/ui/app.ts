import { DEFAULT_WORKOUT } from '../data/default-workout';
import { EXERCISE_LIBRARY, EXERCISES_BY_ID } from '../data/exercises';
import { exportPlanJson, importPlanJson, importPlanUrlPayload } from '../core/plan-io';
import { clearWorkoutSession, loadPlans, loadWorkoutSession, savePlan, saveWorkoutSession } from '../core/persistence';
import { validateWorkoutPlan, type WorkoutPlan } from '../core/plan-schema';
import { createWorkoutSession, dispatchWorkout, getWorkoutSnapshot, type WorkoutSession } from '../core/workout-engine';

const APP_CONFIG: { githubUrl: string } = { githubUrl: 'https://github.com/hebecked/Home-Workout' };
const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
const formatClock = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
const cloneDefault = (): WorkoutPlan => structuredClone(DEFAULT_WORKOUT);
const previewCategory = (category: string | undefined): { className: string; label: string } | null => {
  if (category === 'legs') return { className: 'legs', label: 'Legs · Beine' };
  if (category === 'push' || category === 'pull') return { className: 'arms', label: 'Arms · Oberkörper' };
  if (category === 'core') return { className: 'core', label: 'Core · Rumpf' };
  if (category === 'cardio' || category === 'full-body') return { className: 'cardio', label: 'Cardio · Kondition' };
  return null;
};

export class HomeWorkoutApp {
  private activePlan: WorkoutPlan = cloneDefault();
  private session: WorkoutSession | null = null;
  private draft: WorkoutPlan = {
    ...cloneDefault(), id: `plan-${Date.now()}`, name: { de: 'Mein Trainingsplan', en: '' }, rounds: 1, exercises: []
  };
  private tickHandle: number | null = null;
  private languageFormVisible = false;
  private exercisePickerVisible = false;
  private importPreview: WorkoutPlan | null = null;
  private notice = '';

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    window.addEventListener('hashchange', () => this.render());
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
      this.notice = 'AI plan loaded · KI-Plan geladen';
    } catch (error) {
      this.importPreview = null;
      this.notice = error instanceof Error ? error.message : 'Invalid workout link';
    }
    history.replaceState(null, '', `${location.pathname}#import`);
    return true;
  }

  private route(): string { return location.hash.replace(/^#\/?/, '') || 'home'; }
  private findPlan(id: string): WorkoutPlan | undefined {
    return id === DEFAULT_WORKOUT.id ? cloneDefault() : loadPlans(localStorage).find((plan) => plan.id === id);
  }

  private shell(content: string): void {
    const savedPlansLabel = this.route() === 'home' ? 'Saved routines' : 'My Plans · Meine Pläne';
    this.root.innerHTML = `
      <header class="site-header">
        <a href="#home" class="brand" aria-label="Home Workout"><span class="brand-mark">HW</span><span>Home Workout</span></a>
        <nav aria-label="Primary"><a href="#instructions" aria-label="Workout guide">Instructions</a><a href="#plans" aria-label="${savedPlansLabel}">My Plans</a></nav>
      </header>
      <main id="main" tabindex="-1">${content}</main>
      <footer><span>Private by design · Offline ready</span><span>PolyForm Perimeter 1.0.0</span></footer>`;
    this.root.querySelector<HTMLAnchorElement>('.brand')?.addEventListener('click', (event) => {
      if (this.route() !== 'workout' || !this.session) return;
      event.preventDefault();
      this.requestAbortWorkout();
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
      const previousPosition = `${this.session.phase}:${this.session.roundIndex}:${this.session.exerciseIndex}:${this.session.workoutPausedAtMs !== null}`;
      this.session = dispatchWorkout(this.session, this.activePlan, { type: 'TICK' }, now);
      saveWorkoutSession(localStorage, this.session);
      const snapshot = getWorkoutSnapshot(this.session, this.activePlan, now);
      const nextPosition = `${snapshot.phase}:${snapshot.roundIndex}:${snapshot.exerciseIndex}:${snapshot.paused}`;

      if (previousPosition !== nextPosition) {
        this.renderWorkout();
        return;
      }

      const total = this.root.querySelector<HTMLElement>('[data-workout-total]');
      const countdown = this.root.querySelector<HTMLElement>('[data-workout-countdown]');
      if (total) total.textContent = `Total ${formatClock(snapshot.elapsedWorkoutMs)}`;
      if (countdown && typeof snapshot.remainingMs === 'number') countdown.textContent = formatClock(snapshot.remainingMs);
      if (snapshot.phase !== 'completed' && !snapshot.paused) this.scheduleWorkoutTick();
    }, 500);
  }

  private renderHome(): void {
    const title = this.activePlan.name.en ?? Object.values(this.activePlan.name)[0] ?? 'Workout';
    const previews = this.activePlan.exercises.map((exercise, index) => {
      const definition = EXERCISES_BY_ID.get(exercise.exerciseId);
      const englishName = exercise.translations.en?.name ?? Object.values(exercise.translations)[0]?.name ?? exercise.exerciseId;
      const germanName = exercise.translations.de?.name;
      const category = previewCategory(definition?.category);
      return `<article class="exercise-preview-card">
        <span class="preview-number">${String(index + 1).padStart(2, '0')}</span>
        <img src="${definition?.illustration ?? '/icon.svg'}" alt="${escapeHtml([englishName, germanName].filter(Boolean).join(' · '))}" loading="eager">
        <div>${category ? `<span class="preview-category ${category.className}">${category.label}</span>` : ''}<strong>${escapeHtml(englishName)}</strong>${germanName ? `<span>${escapeHtml(germanName)}</span>` : ''}</div>
      </article>`;
    }).join('');
    this.shell(`
      <section class="home-grid">
        <div class="intro-block">
          <p class="eyebrow">MOVE WELL · AT HOME</p>
          <h1>Home Workout</h1>
          <p class="lede">A calm, multilingual workout companion. No account, no tracking, no noise.</p>
        </div>
        <article class="workout-card">
          <div class="card-topline"><span>READY WHEN YOU ARE</span><span>≈ 30 min</span></div>
          <h2>${escapeHtml(title)}</h2>
          <div class="plan-stats" aria-label="Workout summary">
            <span><strong>${this.activePlan.rounds}</strong> Rounds · Runden</span>
            <span><strong>${this.activePlan.exercises.length}</strong> Exercises · Übungen</span>
          </div>
          <button class="primary start-button" data-action="start">START WORKOUT <span aria-hidden="true">→</span></button>
        </article>
      </section>
      <section class="exercise-preview" aria-labelledby="exercise-preview-title">
        <div class="preview-heading"><div><p class="eyebrow">LOCAL ILLUSTRATIONS · LOKALE GRAFIKEN</p><h2 id="exercise-preview-title">Inside this workout · Deine Übungen</h2></div><span>${this.activePlan.exercises.length} illustrated movements</span></div>
        <div class="exercise-preview-grid">${previews}</div>
      </section>
      <nav class="action-grid" aria-label="Workout options">
        <a class="action-card" href="#instructions"><span class="action-number">01</span><strong>Instructions · Anleitung</strong><span>How the flow works</span></a>
        <a class="action-card" href="#editor"><span class="action-number">02</span><strong>Create new plan · Neuen Plan</strong><span>Build your own routine</span></a>
        <a class="action-card" href="#import"><span class="action-number">03</span><strong>Upload / Start own plan · Import</strong><span>Import a validated JSON file</span></a>
        <a class="action-card" href="#plans"><span class="action-number">04</span><strong>My Plans · Meine Pläne</strong><span>Saved only on this device</span></a>
      </nav>
      <div class="github-placeholder">${APP_CONFIG.githubUrl ? `<a href="${escapeHtml(APP_CONFIG.githubUrl)}">GitHub</a>` : '<span>GitHub link · configurable after remote setup</span>'}</div>`);
    this.root.querySelector('[data-action="start"]')?.addEventListener('click', () => this.startWorkout(this.activePlan));
  }

  private startWorkout(plan: WorkoutPlan): void {
    this.activePlan = structuredClone(plan);
    if (plan.id !== DEFAULT_WORKOUT.id) savePlan(localStorage, plan);
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
      <p class="eyebrow">END SESSION · TRAINING BEENDEN</p>
      <h2 id="abort-workout-title">End workout · Training beenden?</h2>
      <p>Your current progress will be cleared and you will return to the start page.<br>Dein aktueller Fortschritt wird gelöscht und du kehrst zur Startseite zurück.</p>
      <div class="dialog-actions"><button value="cancel" autofocus>Continue workout · Training fortsetzen</button><button class="danger" value="abort" aria-label="Training beenden">End workout · Training beenden</button></div>
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

  private renderWorkout(): void {
    this.clearScheduledTick();
    if (!this.session) { location.hash = 'home'; return; }
    const now = Date.now();
    this.session = dispatchWorkout(this.session, this.activePlan, { type: 'TICK' }, now);
    saveWorkoutSession(localStorage, this.session);
    const snapshot = getWorkoutSnapshot(this.session, this.activePlan, now);
    const exercise = this.activePlan.exercises[snapshot.exerciseIndex]!;
    const definition = EXERCISES_BY_ID.get(exercise.exerciseId);
    const languages = this.activePlan.displayLanguages;
    const isRest = snapshot.phase === 'exercise-rest' || snapshot.phase === 'round-rest';
    const phaseLabel = snapshot.phase === 'round-rest' ? 'Round rest · Rundenpause' : snapshot.phase === 'exercise-rest' ? 'Rest · Pause' : snapshot.phase === 'completed' ? 'Workout complete' : 'Current exercise';
    const target = exercise.type === 'duration' ? formatClock(snapshot.remainingMs ?? 0) : 'min' in exercise.target ? `${exercise.target.min}–${exercise.target.max}${exercise.target.unit === 'per-side' ? ' / side' : ''}` : '';
    const translations = languages.map((code) => {
      const copy = exercise.translations[code];
      return copy ? `<div class="translation"><span>${escapeHtml(this.activePlan.languages.find((language) => language.code === code)?.label ?? code)}</span><h2>${escapeHtml(copy.name)}</h2><p>${escapeHtml(copy.instructions)}</p></div>` : '';
    }).join('');
    const imageName = languages.map((code) => exercise.translations[code]?.name).filter(Boolean).join(' / ');

    this.shell(`
      <section class="workout-screen ${isRest ? 'is-rest' : ''}">
        <div class="workout-content">
          <div class="workout-status"><span>Round ${snapshot.roundIndex + 1} / ${this.activePlan.rounds} · Runde ${snapshot.roundIndex + 1} / ${this.activePlan.rounds}</span><span data-workout-total>Total ${formatClock(snapshot.elapsedWorkoutMs)}</span></div>
          <div class="phase-pill">${phaseLabel}${snapshot.paused ? ' · Paused · Pausiert' : ''}</div>
          ${snapshot.phase === 'completed' ? `<div class="completion"><p class="eyebrow">DONE</p><h1>Workout complete</h1><p>You made time to move. That is enough for today.</p><button class="primary" data-action="finish">Back home</button></div>` : `
            <div class="exercise-layout">
              <div class="exercise-visual"><img src="${definition?.illustration ?? '/icon.svg'}" alt="${escapeHtml(imageName)}"></div>
              <div class="exercise-copy">${isRest ? `<p class="rest-label">Breathe. The next movement starts when the timer reaches zero.</p>` : translations}</div>
            </div>
            <div class="target-block"><span>${isRest ? 'READY IN' : exercise.type === 'duration' ? 'TIME LEFT' : 'TARGET'}</span><strong ${isRest || exercise.type === 'duration' ? 'data-workout-countdown' : ''}>${isRest ? formatClock(snapshot.remainingMs ?? 0) : target}</strong></div>
            ${exercise.type === 'repetitions' && !isRest && 'min' in exercise.target ? `<div class="rep-counter" aria-label="Repetition counter"><button data-action="reps-down" aria-label="Decrease repetitions">−</button><output>${snapshot.repetitions ?? 0}</output><button data-action="reps-up" aria-label="Increase repetitions">+</button><small>Count completed reps · Erledigte Wiederholungen</small></div>` : ''}`}
        </div>
        ${snapshot.phase === 'completed' ? '' : `
          <div class="workout-actions">
            <div class="workout-controls">
              <button data-action="previous" aria-label="Previous · Zurück">← <span>Previous</span></button>
              <button class="pause" data-action="pause" aria-label="${snapshot.paused ? 'Resume · Fortsetzen' : 'Pause'}">${snapshot.paused ? '▶' : 'Ⅱ'}</button>
              <button data-action="next" aria-label="Next · Weiter"><span>Next</span> →</button>
            </div>
            <button class="abort-workout" data-action="abort">Abort workout · Training beenden</button>
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
    if (exercise.type === 'repetitions') {
      const current = snapshot.repetitions ?? 0;
      act('reps-down', { type: 'SET_REPETITIONS', value: Math.max(0, current - 1) });
      act('reps-up', { type: 'SET_REPETITIONS', value: current + 1 });
    }
    this.root.querySelector('[data-action="finish"]')?.addEventListener('click', () => { clearWorkoutSession(localStorage); this.session = null; location.hash = 'home'; });
    this.root.querySelector('[data-action="abort"]')?.addEventListener('click', () => this.requestAbortWorkout());
    if (snapshot.phase !== 'completed' && !snapshot.paused) this.scheduleWorkoutTick();
  }

  private renderEditor(): void {
    const optionLabels: Record<string, string> = { 'sumo-squat': 'Wide stance exercise', 'split-squat': 'Split stance exercise', 'squat-to-reach': 'Reach sequence exercise' };
    const exerciseOptions = EXERCISE_LIBRARY.map((exercise) => `<option value="${exercise.id}" aria-label="${escapeHtml(optionLabels[exercise.id] ?? `${exercise.translations.en.name} · ${exercise.translations.de.name}`)}">${escapeHtml(exercise.translations.en.name)} · ${escapeHtml(exercise.translations.de.name)}</option>`).join('');
    const exerciseRows = this.draft.exercises.map((exercise, index) => {
      const name = exercise.translations.en?.name ?? Object.values(exercise.translations)[0]?.name ?? exercise.exerciseId;
      return `<li><span class="order">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(name)}</strong><span class="row-actions"><button data-move="up" data-id="${escapeHtml(exercise.id)}" aria-label="Move ${escapeHtml(name)} up">↑</button><button data-move="down" data-id="${escapeHtml(exercise.id)}" aria-label="Move ${escapeHtml(name)} down">↓</button><button data-remove="${escapeHtml(exercise.id)}" aria-label="Remove ${escapeHtml(name)}">Remove</button></span></li>`;
    }).join('');
    const languageChecks = this.draft.languages.map((language) => `<label class="check"><input type="checkbox" data-display-language="${escapeHtml(language.code)}" ${this.draft.displayLanguages.includes(language.code) ? 'checked' : ''}> ${escapeHtml(language.label)}</label>`).join('');
    this.shell(`
      <section class="page-heading"><p class="eyebrow">PLAN STUDIO</p><h1>Create new plan</h1><p>Build a routine that speaks your language and fits your room.</p></section>
      <form class="editor" data-editor>
        <section class="form-section"><h2>01 · Basics</h2><div class="field-grid">
          <label>Plan name German<input name="name-de" value="${escapeHtml(this.draft.name.de ?? '')}"></label>
          <label>Plan name English<input name="name-en" value="${escapeHtml(this.draft.name.en ?? '')}" required></label>
          <label>Rounds<input name="rounds" type="number" min="1" max="20" value="${this.draft.rounds}"></label>
          <label>Rest between exercises (seconds)<input name="rest-exercises" type="number" min="0" value="${this.draft.restBetweenExercises}"></label>
          <label>Rest between rounds (seconds)<input name="rest-rounds" type="number" min="0" value="${this.draft.restBetweenRounds}"></label>
        </div></section>
        <section class="form-section"><div class="section-heading"><h2>02 · Languages</h2><button type="button" class="secondary" data-action="show-language">Add language · Sprache hinzufügen</button></div>
          <div class="check-row"><span>Visible side by side (max. 2)</span>${languageChecks}</div>
          ${this.languageFormVisible ? `<div class="inline-form"><label>Language code · Sprachcode<input name="language-code" placeholder="fr" pattern="[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*"></label><label>Language label · Sprachname<input name="language-label" placeholder="Français"></label><button type="button" data-action="add-language">Add</button></div>` : ''}
        </section>
        <section class="form-section"><div class="section-heading"><h2>03 · Exercises</h2><button type="button" class="secondary" data-action="show-exercises">Add exercise · Übung hinzufügen</button></div>
          ${this.exercisePickerVisible ? `<div class="inline-form"><label>Select exercise<select name="exercise-library" size="5">${exerciseOptions}</select></label><button type="button" data-action="add-selected">Add selected · Auswahl hinzufügen</button></div>` : ''}
          <ol class="exercise-list">${exerciseRows || '<li class="empty">No exercises yet. Add one from the library.</li>'}</ol>
          <details class="custom-exercise"><summary>Create a custom exercise</summary><div class="inline-form"><label>Exercise name<input name="custom-name"></label><label>Type<select name="custom-type"><option value="repetitions">Repetitions</option><option value="duration">Duration</option></select></label><button type="button" data-action="add-custom">Add custom exercise</button></div></details>
        </section>
        <div class="editor-actions"><button type="button" class="primary" data-action="save-plan">Save locally · Lokal speichern</button><button type="button" data-action="start-plan">Start</button><button type="button" data-action="export-plan">Export JSON</button></div>
        <p class="notice" role="status">${escapeHtml(this.notice)}</p>
      </form>`);
    this.bindEditor();
  }

  private syncDraftFromForm(): void {
    const form = this.root.querySelector<HTMLFormElement>('[data-editor]');
    if (!form) return;
    const data = new FormData(form);
    this.draft.name.de = String(data.get('name-de') ?? '').trim() || 'Mein Trainingsplan';
    this.draft.name.en = String(data.get('name-en') ?? '').trim();
    this.draft.rounds = Number(data.get('rounds')) || 1;
    this.draft.restBetweenExercises = Math.max(0, Number(data.get('rest-exercises')) || 0);
    this.draft.restBetweenRounds = Math.max(0, Number(data.get('rest-rounds')) || 0);
  }

  private normalizedDraft(): WorkoutPlan {
    this.syncDraftFromForm();
    const fallbackName = this.draft.name.en || this.draft.name.de || 'Workout';
    for (const language of this.draft.languages) this.draft.name[language.code] ||= fallbackName;
    for (const exercise of this.draft.exercises) {
      const fallback = exercise.translations.en ?? exercise.translations.de ?? Object.values(exercise.translations)[0]!;
      for (const language of this.draft.languages) exercise.translations[language.code] ||= { name: fallback.name, instructions: fallback.instructions };
    }
    return validateWorkoutPlan(structuredClone(this.draft));
  }

  private bindEditor(): void {
    this.root.querySelector('[data-action="show-language"]')?.addEventListener('click', () => { this.syncDraftFromForm(); this.languageFormVisible = true; this.renderEditor(); });
    this.root.querySelector('[data-action="add-language"]')?.addEventListener('click', () => {
      this.syncDraftFromForm();
      const code = this.root.querySelector<HTMLInputElement>('[name="language-code"]')?.value.trim() ?? '';
      const label = this.root.querySelector<HTMLInputElement>('[name="language-label"]')?.value.trim() ?? '';
      if (!code || !label || this.draft.languages.some((language) => language.code === code)) { this.notice = 'Enter a unique language code and label.'; this.renderEditor(); return; }
      this.draft.languages.push({ code, label }); this.draft.name[code] = this.draft.name.en || label;
      if (this.draft.displayLanguages.length < 2) this.draft.displayLanguages.push(code);
      this.languageFormVisible = false; this.notice = `${label} added.`; this.renderEditor();
    });
    for (const checkbox of this.root.querySelectorAll<HTMLInputElement>('[data-display-language]')) checkbox.addEventListener('change', () => {
      const selected = [...this.root.querySelectorAll<HTMLInputElement>('[data-display-language]:checked')].map((item) => item.dataset.displayLanguage!).slice(0, 2);
      if (selected.length) this.draft.displayLanguages = selected;
    });
    this.root.querySelector('[data-action="show-exercises"]')?.addEventListener('click', () => { this.syncDraftFromForm(); this.exercisePickerVisible = true; this.renderEditor(); });
    this.root.querySelector('[data-action="add-selected"]')?.addEventListener('click', () => {
      this.syncDraftFromForm(); const id = this.root.querySelector<HTMLSelectElement>('[name="exercise-library"]')?.value; const definition = id ? EXERCISES_BY_ID.get(id) : undefined;
      if (!definition) return;
      this.draft.exercises.push({ id: `${definition.id}-${crypto.randomUUID()}`, exerciseId: definition.id, type: definition.type, target: structuredClone(definition.defaultTarget), translations: structuredClone(definition.translations), alternativeExerciseIds: [...definition.variants.easier] });
      this.exercisePickerVisible = false; this.renderEditor();
    });
    this.root.querySelector('[data-action="add-custom"]')?.addEventListener('click', () => {
      this.syncDraftFromForm(); const name = this.root.querySelector<HTMLInputElement>('[name="custom-name"]')?.value.trim(); const type = this.root.querySelector<HTMLSelectElement>('[name="custom-type"]')?.value as 'repetitions' | 'duration';
      if (!name) return;
      const translations = Object.fromEntries(this.draft.languages.map(({ code }) => [code, { name, instructions: 'Move slowly and with control.' }]));
      this.draft.exercises.push({ id: `custom-${crypto.randomUUID()}`, exerciseId: `custom-${Date.now()}`, type, target: type === 'duration' ? { seconds: 30 } : { min: 8, max: 12, unit: 'repetitions' }, translations, alternativeExerciseIds: [] });
      this.renderEditor();
    });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-remove]')) button.addEventListener('click', () => { this.syncDraftFromForm(); this.draft.exercises = this.draft.exercises.filter(({ id }) => id !== button.dataset.remove); this.renderEditor(); });
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-move]')) button.addEventListener('click', () => {
      this.syncDraftFromForm(); const index = this.draft.exercises.findIndex(({ id }) => id === button.dataset.id); const destination = button.dataset.move === 'up' ? index - 1 : index + 1;
      if (index < 0 || destination < 0 || destination >= this.draft.exercises.length) return;
      const [item] = this.draft.exercises.splice(index, 1); this.draft.exercises.splice(destination, 0, item!); this.renderEditor();
    });
    const withPlan = (callback: (plan: WorkoutPlan) => void): void => { try { callback(this.normalizedDraft()); } catch (error) { this.notice = error instanceof Error ? error.message : 'Invalid plan'; this.renderEditor(); } };
    this.root.querySelector('[data-action="save-plan"]')?.addEventListener('click', () => withPlan((plan) => { savePlan(localStorage, plan); this.notice = 'Saved · Gespeichert'; this.renderEditor(); }));
    this.root.querySelector('[data-action="start-plan"]')?.addEventListener('click', () => withPlan((plan) => this.startWorkout(plan)));
    this.root.querySelector('[data-action="export-plan"]')?.addEventListener('click', () => withPlan((plan) => {
      const blob = new Blob([exportPlanJson(plan)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${plan.id}.json`; link.click(); URL.revokeObjectURL(link.href);
    }));
  }

  private renderImport(): void {
    const preview = this.importPreview;
    this.shell(`<section class="page-heading"><p class="eyebrow">BRING YOUR OWN PLAN</p><h1>Upload / Import</h1><p>JSON stays on this device and is strictly validated before use.</p></section>
      <section class="import-panel"><label class="drop-zone">JSON file · JSON-Datei<input type="file" accept="application/json,.json" data-import><span>Choose a file or drop it here</span></label>
      ${this.notice ? `<p role="alert" class="error">${escapeHtml(this.notice)}</p>` : ''}
      ${preview ? `<div class="preview"><p class="eyebrow">VALID PLAN</p><h2>Preview · Vorschau</h2><h3>${escapeHtml(Object.values(preview.name)[0] ?? 'Workout')}</h3><ul>${preview.exercises.map((exercise) => `<li>${escapeHtml(Object.values(exercise.translations)[0]?.name ?? exercise.exerciseId)}</li>`).join('')}</ul><div class="editor-actions"><button class="primary" data-action="start-import">Start</button><button data-action="save-import">Save locally</button></div></div>` : ''}</section>`);
    this.root.querySelector<HTMLInputElement>('[data-import]')?.addEventListener('change', (event) => {
      void (async () => {
        const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
        try { this.importPreview = importPlanJson(await file.text()); this.notice = ''; }
        catch (error) { this.importPreview = null; this.notice = error instanceof Error ? error.message : 'Invalid plan'; }
        this.renderImport();
      })();
    });
    this.root.querySelector('[data-action="start-import"]')?.addEventListener('click', () => { if (this.importPreview) this.startWorkout(this.importPreview); });
    this.root.querySelector('[data-action="save-import"]')?.addEventListener('click', () => { if (this.importPreview) { savePlan(localStorage, this.importPreview); this.notice = 'Saved · Gespeichert'; this.renderImport(); } });
  }

  private renderPlans(): void {
    const plans = loadPlans(localStorage);
    this.shell(`<section class="page-heading"><p class="eyebrow">ON THIS DEVICE</p><h1>My Plans · Meine Pläne</h1><p>Your plans never leave this browser.</p></section><section class="saved-plans">${plans.length ? plans.map((plan) => `<article><div><span>${plan.rounds} rounds · ${plan.exercises.length} exercises</span><h2>${escapeHtml(plan.name.en ?? Object.values(plan.name)[0] ?? 'Workout')}</h2></div><button data-start-plan="${escapeHtml(plan.id)}">Start</button></article>`).join('') : '<div class="empty-state"><h2>No saved plans yet</h2><p>Create or import a plan to see it here.</p><a class="button-link" href="#editor">Create new plan</a></div>'}</section>`);
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-start-plan]')) button.addEventListener('click', () => { const plan = this.findPlan(button.dataset.startPlan ?? ''); if (plan) this.startWorkout(plan); });
  }

  private renderInstructions(): void {
    const guideUrl = new URL('/ai-workout-guide.txt', location.origin).href;
    const items = [
      ['Start', 'Review the plan summary, then choose START WORKOUT.'], ['Reps', 'The optional − / + counter starts at zero for every exercise and workout. It counts completed reps for the current session; the target stays visible above it.'], ['Rounds', 'Complete each exercise once per round. Round progress is always visible.'], ['Timers', 'Duration exercises and rests advance automatically using timestamps, even after backgrounding. Use Next to skip a rest.'], ['Pause', 'Pause freezes workout, exercise and rest time together.'], ['Alternatives', 'Choose the easier option stored with an exercise whenever needed.'], ['Own plans', 'Create, reorder and adjust exercises in Plan Studio.'], ['Import / Export', 'Share versioned JSON files. Every import is validated before preview or start.'], ['Languages', 'Show one or two configured languages side by side; add any BCP-47 language manually.'], ['Offline', 'After the first successful load, the installed PWA, library, images and local plans work offline.']
    ];
    this.shell(`<section class="page-heading"><p class="eyebrow">QUICK GUIDE</p><h1>Instructions · Anleitung</h1><p>Everything needed to move confidently, without a coach in the room.</p></section>
      <section class="ai-plan-guide"><p class="eyebrow">CREATE WITH AI · MIT KI ERSTELLEN</p><h2>Let an AI prepare your workout plan</h2><p>Wenn du deinen Trainingsplan von einer KI wie ChatGPT generieren möchtest, gib ihr den folgenden Leitfaden-Link zusammen mit einer Beschreibung deines gewünschten Trainingsplans.</p><div class="copy-field"><code>${escapeHtml(guideUrl)}</code><button class="primary" data-action="copy-ai-guide">Link kopieren</button></div><p>Die KI kann dir anschließend idealerweise einen direkten Link zur geprüften Planvorschau geben. Alternativ erstellt sie eine JSON-Konfigurationsdatei, die du unter „Upload / Import“ hochladen kannst.</p></section>
      <section class="instruction-list">${items.map(([title, copy], index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h2>${title}</h2><p>${copy}</p></div></article>`).join('')}</section><aside class="safety"><strong>Safety note</strong><p>Train within your ability, stop if you feel pain, and seek qualified medical advice when needed. This app does not diagnose or treat medical conditions.</p></aside>`);
    this.root.querySelector<HTMLButtonElement>('[data-action="copy-ai-guide"]')?.addEventListener('click', (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      void navigator.clipboard.writeText(guideUrl).then(() => { button.textContent = 'Kopiert · Copied'; }).catch(() => { window.prompt('Link kopieren · Copy link', guideUrl); });
    });
  }

  private showResumeDialog(): void {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', 'Resume Workout · Workout fortsetzen');
    dialog.innerHTML = `<form method="dialog"><p class="eyebrow">WORKOUT IN PROGRESS</p><h2>Resume Workout?</h2><p>Your last session is saved on this device.</p><div class="dialog-actions"><button value="resume" class="primary">Resume · Fortsetzen</button><button value="restart">Start over · Neu starten</button></div></form>`;
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'restart') { clearWorkoutSession(localStorage); this.startWorkout(this.activePlan); }
      else { location.hash = 'workout'; this.render(); }
      dialog.remove();
    });
    document.body.append(dialog); dialog.showModal();
  }
}
