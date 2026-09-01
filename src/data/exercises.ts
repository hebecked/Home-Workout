import type { ExerciseTarget, Translation } from '../core/plan-schema';

export interface ExerciseDefinition {
  id: string;
  category: 'legs' | 'push' | 'pull' | 'core' | 'cardio' | 'full-body';
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'repetitions' | 'duration';
  defaultTarget: ExerciseTarget;
  translations: Record<'de' | 'en', Translation>;
  illustration: string;
  variants: { easier: string[]; harder: string[] };
}

type Seed = [string, ExerciseDefinition['category'], string, string, ExerciseDefinition['difficulty'], ExerciseDefinition['type'], string[], string[]];

const seeds: Seed[] = [
  ['squat', 'legs', 'Kniebeuge', 'Squat', 'beginner', 'repetitions', ['wall-sit'], ['sumo-squat']],
  ['sumo-squat', 'legs', 'Sumo-Kniebeuge', 'Sumo Squat', 'beginner', 'repetitions', ['squat'], ['split-squat']],
  ['reverse-lunge', 'legs', 'Rückwärts-Ausfallschritt', 'Reverse Lunge', 'intermediate', 'repetitions', ['split-squat'], ['forward-lunge']],
  ['forward-lunge', 'legs', 'Vorwärts-Ausfallschritt', 'Forward Lunge', 'intermediate', 'repetitions', ['reverse-lunge'], ['split-squat']],
  ['split-squat', 'legs', 'Geteilte Kniebeuge', 'Split Squat', 'intermediate', 'repetitions', ['reverse-lunge'], ['forward-lunge']],
  ['glute-bridge', 'legs', 'Beckenheben', 'Glute Bridge', 'beginner', 'repetitions', [], ['single-leg-glute-bridge']],
  ['single-leg-glute-bridge', 'legs', 'Einbeiniges Beckenheben', 'Single Leg Glute Bridge', 'intermediate', 'repetitions', ['glute-bridge'], []],
  ['calf-raise', 'legs', 'Wadenheben', 'Calf Raise', 'beginner', 'repetitions', [], []],
  ['wall-sit', 'legs', 'Wandsitz', 'Wall Sit', 'beginner', 'duration', ['squat'], ['split-squat']],
  ['push-up', 'push', 'Liegestütz', 'Push-up', 'intermediate', 'repetitions', ['incline-push-up', 'knee-push-up'], ['pike-push-up']],
  ['incline-push-up', 'push', 'Erhöhter Liegestütz', 'Incline Push-up', 'beginner', 'repetitions', ['knee-push-up'], ['push-up']],
  ['knee-push-up', 'push', 'Knie-Liegestütz', 'Knee Push-up', 'beginner', 'repetitions', ['incline-push-up'], ['push-up']],
  ['pike-push-up', 'push', 'Pike-Liegestütz', 'Pike Push-up', 'advanced', 'repetitions', ['push-up'], []],
  ['pull-up', 'pull', 'Klimmzug', 'Pull-up', 'advanced', 'repetitions', ['assisted-pull-up', 'resistance-band-row'], ['chin-up']],
  ['assisted-pull-up', 'pull', 'Unterstützter Klimmzug', 'Assisted Pull-up', 'intermediate', 'repetitions', ['resistance-band-row'], ['pull-up']],
  ['chin-up', 'pull', 'Untergriff-Klimmzug', 'Chin-up', 'advanced', 'repetitions', ['assisted-pull-up'], ['pull-up']],
  ['resistance-band-row', 'pull', 'Bandrudern', 'Resistance Band Row', 'beginner', 'repetitions', ['resistance-band-pull-apart'], ['assisted-pull-up']],
  ['resistance-band-pull-apart', 'pull', 'Band auseinanderziehen', 'Resistance Band Pull-Apart', 'beginner', 'repetitions', [], ['resistance-band-row']],
  ['dead-bug', 'core', 'Käfer', 'Dead Bug', 'beginner', 'repetitions', [], ['hollow-hold']],
  ['lying-leg-raise', 'core', 'Beinheben im Liegen', 'Lying Leg Raises', 'beginner', 'repetitions', ['dead-bug'], ['hollow-hold']],
  ['bird-dog', 'core', 'Vierfüßler diagonal', 'Bird Dog', 'beginner', 'repetitions', ['dead-bug'], ['plank']],
  ['plank', 'core', 'Unterarmstütz', 'Plank', 'intermediate', 'duration', ['dead-bug'], ['side-plank', 'hollow-hold']],
  ['side-plank', 'core', 'Seitstütz', 'Side Plank', 'intermediate', 'duration', ['plank'], ['hollow-hold']],
  ['mountain-climber', 'core', 'Bergsteiger', 'Mountain Climber', 'intermediate', 'duration', ['marching-in-place'], ['burpee']],
  ['hollow-hold', 'core', 'Hollow Hold', 'Hollow Hold', 'advanced', 'duration', ['dead-bug'], []],
  ['jumping-jack', 'cardio', 'Hampelmann', 'Jumping Jack', 'beginner', 'duration', ['step-jack'], ['high-knees']],
  ['step-jack', 'cardio', 'Seitlicher Step Jack', 'Step Jack', 'beginner', 'duration', ['marching-in-place'], ['jumping-jack']],
  ['high-knees', 'cardio', 'Kniehebelauf', 'High Knees', 'intermediate', 'duration', ['marching-in-place'], ['burpee']],
  ['marching-in-place', 'cardio', 'Marschieren am Platz', 'Marching in Place', 'beginner', 'duration', [], ['high-knees']],
  ['burpee', 'full-body', 'Burpee', 'Burpee', 'advanced', 'repetitions', ['squat-to-reach'], []],
  ['squat-to-reach', 'full-body', 'Kniebeuge mit Strecken', 'Squat to Reach', 'beginner', 'repetitions', ['squat'], ['burpee']],
  ['superman', 'core', 'Superman', 'Superman', 'beginner', 'duration', ['bird-dog'], ['hollow-hold']],
  ['triceps-dip', 'push', 'Trizeps-Dip', 'Triceps Dip', 'intermediate', 'repetitions', ['incline-push-up'], ['pike-push-up']]
];

const bandExercises = new Set(['resistance-band-row', 'resistance-band-pull-apart', 'assisted-pull-up']);
const barExercises = new Set(['pull-up', 'chin-up']);
const detailedInstructions: Record<string, Record<'de' | 'en', string>> = {
  squat: {
    de: 'Stelle die Füße etwa schulterbreit auf. Schiebe die Hüfte nach hinten, beuge Hüfte und Knie und senke dich mit gehobener Brust ab. Drücke die Füße in den Boden und richte dich wieder auf; die Knie folgen der Richtung der Zehen.',
    en: 'Stand with feet about shoulder-width apart. Send your hips back, bend hips and knees, and lower with your chest lifted. Press through your feet to stand; keep your knees tracking in the direction of your toes.'
  },
  'sumo-squat': {
    de: 'Stelle die Füße deutlich breiter als schulterbreit auf und drehe die Zehen leicht nach außen. Senke die Hüfte zwischen den Beinen ab, während die Knie den Zehen folgen, und drücke dich über beide Füße zurück nach oben.',
    en: 'Take a stance wider than shoulder width and turn your toes slightly out. Lower your hips between your legs while your knees track over your toes, then press through both feet to stand.'
  },
  'reverse-lunge': {
    de: 'Stehe aufrecht und setze einen Fuß weit nach hinten. Beuge beide Knie, bis das hintere Knie Richtung Boden sinkt und das vordere Knie über dem Fuß bleibt. Drücke dich über den vorderen Fuß zurück und wechsle die Seite.',
    en: 'Stand tall and step one foot well behind you. Bend both knees, lowering the back knee toward the floor while the front knee stays over the foot. Push through the front foot to return, then change sides.'
  },
  'forward-lunge': {
    de: 'Stehe aufrecht und mache einen kontrollierten Schritt nach vorn. Senke die Hüfte, bis beide Knie gebeugt sind, halte den Oberkörper aufrecht und drücke dich über den vorderen Fuß zurück. Wechsle die Seite.',
    en: 'Stand tall and take a controlled step forward. Lower your hips until both knees bend, keep your torso upright, and push through the front foot to return. Change sides.'
  },
  'split-squat': {
    de: 'Nimm einen versetzten Stand ein und lasse beide Füße stehen. Senke den Körper gerade nach unten, indem du beide Knie beugst, und drücke dich über den vorderen Fuß wieder hoch. Beende die Wiederholungen, dann wechsle die Seite.',
    en: 'Take a staggered stance and keep both feet planted. Lower straight down by bending both knees, then press through the front foot to rise. Finish the repetitions before changing sides.'
  },
  'glute-bridge': {
    de: 'Lege dich auf den Rücken, stelle die Füße hüftbreit auf und drücke über die Fersen das Becken nach oben, bis Knie, Hüfte und Schultern eine Linie bilden. Senke kontrolliert ab und vermeide ein Hohlkreuz.',
    en: 'Lie on your back with your feet hip-width apart. Press through your heels and lift your hips until knees, hips and shoulders form a line. Lower with control and avoid arching your lower back.'
  },
  'single-leg-glute-bridge': {
    de: 'Lege dich auf den Rücken, stelle einen Fuß auf und strecke das andere Bein. Spanne Bauch und Gesäß an und hebe das Becken, bis Schulter, Hüfte und Knie des Stützbeins eine Linie bilden. Senke kontrolliert ab und wechsle die Seite.',
    en: 'Lie on your back with one foot planted and the other leg extended. Brace your abdomen and glutes, then lift until shoulder, hip, and the supporting knee form a line. Lower with control and change sides.'
  },
  'calf-raise': {
    de: 'Stehe aufrecht mit parallelen Füßen und halte dich bei Bedarf leicht fest. Hebe beide Fersen kontrolliert an, bis du auf den Fußballen stehst, halte kurz und senke die Fersen langsam wieder ab.',
    en: 'Stand tall with feet parallel and use light support if needed. Raise both heels with control until you are on the balls of your feet, pause briefly, then lower slowly.'
  },
  'wall-sit': {
    de: 'Lehne Rücken und Becken an eine Wand und stelle die Füße etwas vor. Rutsche abwärts, bis Hüfte und Knie bequem gebeugt sind, halte die Knie über den Füßen und drücke den Rücken gegen die Wand.',
    en: 'Place your back and hips against a wall with your feet slightly forward. Slide down until hips and knees are comfortably bent, keep knees over feet, and press your back into the wall.'
  },
  'push-up': {
    de: 'Stütze dich auf Hände und Zehen, die Hände etwas weiter als schulterbreit, und bilde eine Linie von Kopf bis Fersen. Beuge die Ellenbogen und senke Brust und Becken gemeinsam; drücke dich ohne durchhängende Hüfte wieder hoch.',
    en: 'Support yourself on hands and toes with hands slightly wider than shoulders, forming a straight line from head to heels. Bend your elbows and lower chest and hips together, then press up without letting your hips sag.'
  },
  'incline-push-up': {
    de: 'Lege die Hände auf eine stabile erhöhte Fläche und gehe mit den Füßen zurück, bis der Körper eine gerade Linie bildet. Senke die Brust zur Kante und drücke dich wieder weg; halte Hüfte und Rumpf stabil.',
    en: 'Place your hands on a stable raised surface and walk your feet back until your body forms a straight line. Lower your chest toward the edge and press away, keeping hips and trunk stable.'
  },
  'knee-push-up': {
    de: 'Stütze dich auf Hände und Knie und bilde eine gerade Linie von Kopf bis Knie. Beuge die Ellenbogen, senke Brust und Hüfte gemeinsam Richtung Boden und drücke dich wieder hoch.',
    en: 'Support yourself on hands and knees, forming a straight line from head to knees. Bend your elbows, lower chest and hips together toward the floor, then press back up.'
  },
  'pike-push-up': {
    de: 'Beginne im umgekehrten V mit Händen und Füßen am Boden und der Hüfte als höchstem Punkt. Beuge die Ellenbogen und senke den Kopf kontrolliert zwischen und leicht vor die Hände; drücke den Boden weg und strecke die Arme wieder.',
    en: 'Start in an inverted V with hands and feet grounded and hips at the highest point. Bend your elbows and lower your head between and slightly in front of your hands, then press the floor away to straighten your arms.'
  },
  'pull-up': {
    de: 'Greife eine stabile Stange im Obergriff etwa schulterbreit und hänge mit gestreckten Armen. Ziehe den Körper ohne Schwingen nach oben, bis das Kinn über der Stange ist, und senke dich kontrolliert zurück in den Hang.',
    en: 'Grip a secure bar overhand about shoulder-width apart and hang with arms straight. Pull your body up without swinging until your chin clears the bar, then lower with control to a full hang.'
  },
  'assisted-pull-up': {
    de: 'Befestige ein geeignetes Widerstandsband sicher an der Stange und setze Knie oder Fuß hinein. Starte im gestreckten Hang, ziehe das Kinn über die Stange und senke dich kontrolliert; halte das Band währenddessen unter Spannung.',
    en: 'Secure a suitable resistance band to the bar and place a knee or foot in it. Start from a straight-arm hang, pull until your chin clears the bar, and lower with control while keeping tension on the band.'
  },
  'chin-up': {
    de: 'Greife eine stabile Stange im Untergriff etwa schulterbreit und hänge mit gestreckten Armen. Ziehe die Ellenbogen nach unten, bis das Kinn über der Stange ist, und senke dich ohne Schwingen kontrolliert ab.',
    en: 'Grip a secure bar underhand about shoulder-width apart and hang with arms straight. Drive your elbows down until your chin clears the bar, then lower with control without swinging.'
  },
  'resistance-band-row': {
    de: 'Verankere das Band sicher auf Brusthöhe, halte beide Enden und gehe zurück, bis es gespannt ist. Ziehe die Ellenbogen dicht am Körper nach hinten und führe die Schulterblätter zusammen; strecke die Arme kontrolliert wieder.',
    en: 'Anchor the band securely at chest height, hold both ends, and step back until it is taut. Pull your elbows back close to your body and draw your shoulder blades together, then extend your arms with control.'
  },
  'resistance-band-pull-apart': {
    de: 'Halte das Band mit gestreckten Armen auf Brusthöhe. Ziehe die Hände seitlich auseinander, bis das Band die Brust erreicht und die Schulterblätter zusammenkommen; kehre langsam zur Ausgangsposition zurück.',
    en: 'Hold the band at chest height with arms straight. Pull your hands apart until the band approaches your chest and your shoulder blades draw together, then return slowly.'
  },
  'dead-bug': {
    de: 'Lege dich auf den Rücken, halte Hüfte und Knie bei etwa 90 Grad und strecke die Arme nach oben. Senke den gegenüberliegenden Arm und das gegenüberliegende Bein zum Boden, halte den unteren Rücken stabil und wechsle die Seite.',
    en: 'Lie on your back with hips and knees at about 90 degrees and arms reaching up. Lower the opposite arm and leg toward the floor while keeping your lower back stable, then alternate sides.'
  },
  'lying-leg-raise': {
    de: 'Lege dich mit gestreckten Beinen auf den Rücken. Spanne den Rumpf an, hebe beide Beine gemeinsam an und senke sie langsam bis knapp über den Boden, ohne ins Hohlkreuz zu fallen.',
    en: 'Lie on your back with both legs straight. Brace your core, raise both legs together, then lower them slowly to just above the floor without arching your lower back.'
  },
  'bird-dog': {
    de: 'Beginne im Vierfüßlerstand mit Händen unter den Schultern und Knien unter der Hüfte. Strecke einen Arm nach vorn und das gegenüberliegende Bein nach hinten, ohne den Rumpf zu verdrehen; kehre zurück und wechsle die Seite.',
    en: 'Start on hands and knees with hands under shoulders and knees under hips. Reach one arm forward and the opposite leg back without rotating your trunk, then return and change sides.'
  },
  plank: {
    de: 'Stütze dich auf Unterarme und Zehen, die Ellenbogen unter den Schultern. Halte Kopf, Rumpf, Hüfte und Fersen in einer geraden Linie, spanne Bauch und Gesäß an und atme gleichmäßig.',
    en: 'Support yourself on forearms and toes with elbows under shoulders. Keep head, trunk, hips, and heels in one straight line, brace abdomen and glutes, and breathe steadily.'
  },
  'side-plank': {
    de: 'Lege dich auf die Seite, stütze den Ellenbogen direkt unter der Schulter auf und strecke die Beine mit gestapelten Füßen. Hebe die Hüfte, bis Kopf, Schultern, Hüfte und Füße eine Linie bilden, und halte den Rumpf fest.',
    en: 'Lie on your side with your elbow directly under your shoulder and legs extended with feet stacked. Lift your hips until head, shoulders, hips, and feet form a straight line, then hold your trunk firm.'
  },
  'mountain-climber': {
    de: 'Beginne im hohen Stütz mit Händen unter den Schultern und geradem Körper. Führe abwechselnd ein Knie kontrolliert Richtung Brust und setze den Fuß wieder zurück, ohne die Hüfte stark anzuheben oder abzusenken.',
    en: 'Start in a high plank with hands under shoulders and body straight. Alternate driving one knee toward your chest and returning the foot, without letting your hips rise or sag.'
  },
  'hollow-hold': {
    de: 'Lege dich auf den Rücken, drücke den unteren Rücken sanft in den Boden und hebe Kopf, Schultern und gestreckte Beine an. Strecke die Arme über Kopf und halte nur so tief, wie der Rücken Bodenkontakt behält.',
    en: 'Lie on your back, gently press your lower back into the floor, and lift head, shoulders, and straight legs. Reach arms overhead and hold only as low as you can maintain back contact.'
  },
  'jumping-jack': {
    de: 'Starte aufrecht mit geschlossenen Füßen und Armen an den Seiten. Springe die Füße auseinander und führe die Arme über den Kopf; springe anschließend weich in die Ausgangsposition zurück.',
    en: 'Start tall with feet together and arms by your sides. Jump your feet apart while raising your arms overhead, then land softly back in the starting position.'
  },
  'step-jack': {
    de: 'Starte aufrecht mit geschlossenen Füßen. Setze einen Fuß seitlich und hebe gleichzeitig beide Arme; führe Fuß und Arme zurück und wiederhole zur anderen Seite, ohne zu springen.',
    en: 'Start tall with feet together. Step one foot sideways while raising both arms, return foot and arms, then repeat to the other side without jumping.'
  },
  'high-knees': {
    de: 'Laufe aufrecht am Platz und hebe die Knie abwechselnd zügig Richtung Hüfthöhe. Lande leicht auf den Fußballen, schwinge die Arme gegengleich und halte den Oberkörper stabil.',
    en: 'Run tall in place, lifting alternate knees briskly toward hip height. Land lightly on the balls of your feet, swing opposite arms, and keep your torso stable.'
  },
  'marching-in-place': {
    de: 'Stehe aufrecht und marschiere am Platz. Hebe abwechselnd ein Knie in eine angenehme Höhe, setze den Fuß kontrolliert ab und schwinge den gegenüberliegenden Arm mit.',
    en: 'Stand tall and march in place. Lift alternate knees to a comfortable height, place each foot down with control, and swing the opposite arm.'
  },
  burpee: {
    de: 'Beuge Hüfte und Knie, setze die Hände auf den Boden und bringe beide Füße zurück in den hohen Stütz. Führe die Füße wieder nach vorn und richte dich auf oder springe hoch; halte im Stütz den Rumpf stabil.',
    en: 'Bend hips and knees, place your hands on the floor, and move both feet back into a high plank. Bring the feet forward, then stand or jump up; keep your trunk stable in the plank.'
  },
  'squat-to-reach': {
    de: 'Senke dich in eine Kniebeuge, indem du Hüfte und Knie beugst. Drücke dich zum Stand hoch und strecke beide Arme über den Kopf; senke die Arme und beginne die nächste Kniebeuge.',
    en: 'Lower into a squat by bending hips and knees. Press up to standing and reach both arms overhead, then lower your arms and begin the next squat.'
  },
  superman: {
    de: 'Lege dich auf den Bauch und spanne den Bauch an. Hebe Arme, Brust und Beine nur so weit wie bequem vom Boden, halte Nacken und Wirbelsäule neutral und senke kontrolliert ab.',
    en: 'Lie face down and brace your abdomen. Lift arms, chest, and legs only as far as comfortable, keep neck and spine neutral, then lower with control.'
  },
  'triceps-dip': {
    de: 'Setze die Hände an die Kante eines stabilen Stuhls, rutsche mit der Hüfte davor und stelle die Füße sicher auf. Beuge die Ellenbogen nach hinten, senke den Körper nah am Stuhl und drücke dich wieder hoch; halte die Schultern tief.',
    en: 'Place your hands on the edge of a stable chair, move your hips just in front, and plant your feet securely. Bend your elbows back, lower close to the chair, and press up while keeping shoulders down.'
  }
};

export const EXERCISE_LIBRARY: ExerciseDefinition[] = seeds.map(([id, category, de, en, difficulty, type, easier, harder]) => ({
  id, category,
  equipment: bandExercises.has(id) ? ['resistance band'] : barExercises.has(id) ? ['pull-up bar'] : id === 'triceps-dip' || id === 'incline-push-up' ? ['chair'] : ['none'],
  difficulty, type,
  defaultTarget: type === 'duration' ? { seconds: 30 } : { min: 8, max: 12, unit: id.includes('lunge') || id === 'bird-dog' || id === 'dead-bug' ? 'per-side' : 'repetitions' },
  translations: {
    de: { name: de, instructions: detailedInstructions[id]!.de },
    en: { name: en, instructions: detailedInstructions[id]!.en }
  },
  illustration: `/assets/exercises/${id}.svg`,
  variants: { easier, harder }
}));

export const EXERCISES_BY_ID = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));
