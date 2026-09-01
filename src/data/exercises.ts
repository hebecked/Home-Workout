import type { ExerciseTarget, Translation } from '../core/plan-schema';

export interface ExerciseDefinition {
  id: string;
  category: 'legs' | 'push' | 'pull' | 'core' | 'cardio' | 'full-body' | 'warm-up' | 'stretch';
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
  ['sumo-squat-hold', 'legs', 'Sumo-Kniebeugen-Halten', 'Sumo Squat Hold', 'beginner', 'duration', ['wall-sit'], ['sumo-squat']],
  ['push-up', 'push', 'Liegestütz', 'Push-up', 'intermediate', 'repetitions', ['incline-push-up', 'knee-push-up'], ['pike-push-up']],
  ['scapular-push-up', 'push', 'Schulterblatt-Liegestütz', 'Scapular Push-up', 'intermediate', 'repetitions', ['knee-push-up'], ['push-up']],
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
  ['shadow-boxing', 'cardio', 'Schattenboxen', 'Shadowboxing', 'beginner', 'duration', ['marching-in-place'], ['high-knees']],
  ['burpee', 'full-body', 'Burpee', 'Burpee', 'advanced', 'repetitions', ['squat-to-reach'], []],
  ['squat-to-reach', 'full-body', 'Kniebeuge mit Strecken', 'Squat to Reach', 'beginner', 'repetitions', ['squat'], ['burpee']],
  ['superman', 'core', 'Superman', 'Superman', 'beginner', 'duration', ['bird-dog'], ['hollow-hold']],
  ['triceps-dip', 'push', 'Trizeps-Dip', 'Triceps Dip', 'intermediate', 'repetitions', ['incline-push-up'], ['pike-push-up']],
  ['heel-dig', 'warm-up', 'Fersen-Tippen', 'Heel Digs', 'beginner', 'duration', ['marching-in-place'], ['high-knees']],
  ['shoulder-roll', 'warm-up', 'Schulterkreisen', 'Shoulder Rolls', 'beginner', 'duration', [], []],
  ['arm-circle', 'warm-up', 'Armkreisen', 'Arm Circles', 'beginner', 'duration', ['shoulder-roll'], []],
  ['active-recovery', 'warm-up', 'Aktive Erholung', 'Active Recovery', 'beginner', 'duration', [], ['marching-in-place']],
  ['leg-swing', 'warm-up', 'Beinschwingen', 'Leg Swings', 'beginner', 'duration', ['marching-in-place'], []],
  ['calf-stretch', 'stretch', 'Waden-Dehnung', 'Calf Stretch', 'beginner', 'duration', [], []],
  ['hamstring-stretch', 'stretch', 'Oberschenkelrückseiten-Dehnung', 'Hamstring Stretch', 'beginner', 'duration', [], []],
  ['quadriceps-stretch', 'stretch', 'Oberschenkelvorderseiten-Dehnung', 'Quadriceps Stretch', 'beginner', 'duration', [], []],
  ['hip-flexor-stretch', 'stretch', 'Hüftbeuger-Dehnung', 'Hip Flexor Stretch', 'beginner', 'duration', [], []],
  ['shoulder-upper-back-stretch', 'stretch', 'Schulter- und oberer Rücken-Stretch', 'Shoulder and Upper Back Stretch', 'beginner', 'duration', [], []],
  ['chest-stretch', 'stretch', 'Brust-Dehnung', 'Chest Stretch', 'beginner', 'duration', [], []],
  ['child-pose', 'stretch', 'Kindhaltung', "Child's Pose", 'beginner', 'duration', [], []],
  ['cat-cow', 'stretch', 'Katze-Kuh', 'Cat-Cow', 'beginner', 'duration', [], []],
  ['cobra-stretch', 'stretch', 'Kobra-Dehnung', 'Cobra Stretch', 'beginner', 'duration', [], []],
  ['yoga-bridge', 'stretch', 'Yoga-Brücke', 'Yoga Bridge Hold', 'beginner', 'duration', ['glute-bridge'], []]
];

const bandExercises = new Set(['resistance-band-row', 'resistance-band-pull-apart']);
const barExercises = new Set(['pull-up', 'chin-up']);
const supportExercises = new Set(['wall-sit', 'leg-swing', 'calf-stretch', 'hamstring-stretch', 'quadriceps-stretch']);
const perSideExercises = new Set(['reverse-lunge', 'forward-lunge', 'split-squat', 'single-leg-glute-bridge', 'bird-dog', 'dead-bug']);
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
  'sumo-squat-hold': {
    de: 'Stelle die Füße deutlich breiter als schulterbreit auf und drehe die Zehen leicht nach außen. Schiebe die Hüfte nach hinten und unten, bis die Oberschenkel bequem Richtung waagerecht kommen, und halte. Die Knie folgen den Zehen; Brust und Rücken bleiben aufrecht.',
    en: 'Stand wider than shoulder width with toes turned slightly out. Send your hips back and down until your thighs move comfortably toward parallel, then hold. Keep knees tracking over toes and your chest and back upright.'
  },
  'push-up': {
    de: 'Stütze dich auf Hände und Zehen, die Hände etwas weiter als schulterbreit, und bilde eine Linie von Kopf bis Fersen. Beuge die Ellenbogen und senke Brust und Becken gemeinsam; drücke dich ohne durchhängende Hüfte wieder hoch.',
    en: 'Support yourself on hands and toes with hands slightly wider than shoulders, forming a straight line from head to heels. Bend your elbows and lower chest and hips together, then press up without letting your hips sag.'
  },
  'scapular-push-up': {
    de: 'Beginne im hohen Stütz mit gestreckten Ellenbogen und einer geraden Linie von Kopf bis Fersen. Lasse den Brustkorb nur durch das Zusammenführen der Schulterblätter leicht zwischen die Arme sinken. Drücke anschließend den Boden weg, bis sich die Schulterblätter wieder auseinanderbewegen; die Ellenbogen bleiben gestreckt.',
    en: 'Start in a high plank with straight elbows and a line from head to heels. Let your chest sink slightly between your arms only by drawing the shoulder blades together. Then push the floor away until the shoulder blades separate again; keep your elbows straight.'
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
    de: 'Lege dich auf die Seite, stütze den Unterarm mit dem Ellenbogen direkt unter der Schulter auf und strecke die Beine mit gestapelten Füßen. Hebe die Hüfte, bis Kopf, Schultern, Hüfte und Füße eine Linie bilden, und halte den Rumpf fest. Wechsle nach der Hälfte der Zeit die Seite.',
    en: 'Lie on your side and support yourself on your forearm with the elbow directly under your shoulder; extend your legs with feet stacked. Lift your hips until head, shoulders, hips, and feet form a straight line, then hold your trunk firm. Change sides halfway through.'
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
  'shadow-boxing': {
    de: 'Stehe versetzt mit weichen Knien und den Fäusten locker vor dem Gesicht. Boxe abwechselnd gerade nach vorn, drehe dabei Schulter und Hüfte leicht mit und ziehe jede Hand sofort zur Deckung zurück. Strecke die Ellenbogen nicht hart durch.',
    en: 'Stand in a staggered stance with soft knees and relaxed fists guarding your face. Alternate straight punches, allowing a small shoulder and hip turn, and return each hand immediately to guard. Do not lock your elbows.'
  },
  burpee: {
    de: 'Beuge Hüfte und Knie, setze die Hände auf den Boden und springe oder steige mit beiden Füßen in den hohen Stütz. Senke Brust und Hüfte gemeinsam wie bei einem Liegestütz und drücke dich zurück hoch. Bringe die Füße wieder nach vorn, richte dich auf und springe mit gestreckten Armen; lande weich und kontrolliert.',
    en: 'Bend your hips and knees, place your hands on the floor, and jump or step both feet back into a high plank. Lower your chest and hips together as in a push-up, then press back up. Bring your feet forward, stand, and jump with arms extended; land softly and with control.'
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
    de: 'Setze die Hände an die Kante eines stabilen niedrigen Stuhls, rutsche mit der Hüfte davor und stelle die Füße sicher auf. Beuge die Ellenbogen nach hinten, senke den Körper nah am Stuhl und drücke dich wieder hoch; halte die Schultern tief. Arbeite nur im schmerzfreien Schulterbereich und wähle bei Beschwerden die leichtere Alternative.',
    en: 'Place your hands on the edge of a stable low chair, move your hips just in front, and plant your feet securely. Bend your elbows back, lower close to the chair, and press up while keeping shoulders down. Work only through a pain-free shoulder range and choose the easier alternative if you feel discomfort.'
  },
  'heel-dig': {
    de: 'Stehe aufrecht und setze abwechselnd eine Ferse vor dir auf, die Zehen zeigen nach oben. Beuge das Standbein leicht und schwinge die Arme locker mit. Bleibe am Platz und erhöhe das Tempo nur so weit, wie die Bewegung kontrolliert bleibt.',
    en: 'Stand tall and alternate placing one heel on the floor in front of you with toes pointing up. Slightly bend the supporting leg and swing your arms naturally. Stay in place and increase pace only while the movement remains controlled.'
  },
  'shoulder-roll': {
    de: 'Stehe aufrecht und lasse die Arme locker hängen. Rolle beide Schultern langsam nach vorn, oben, hinten und unten. Wechsle nach der Hälfte der Zeit die Richtung und halte den Nacken entspannt.',
    en: 'Stand tall with your arms relaxed. Slowly roll both shoulders forward, up, back, and down. Reverse the direction halfway through and keep your neck relaxed.'
  },
  'arm-circle': {
    de: 'Stehe stabil und strecke beide Arme seitlich auf Schulterhöhe. Zeichne kleine kontrollierte Kreise, die allmählich etwas größer werden. Wechsle nach der Hälfte der Zeit die Richtung und halte die Schultern tief.',
    en: 'Stand steadily and extend both arms sideways at shoulder height. Make small controlled circles that gradually become slightly larger. Reverse direction halfway through and keep your shoulders down.'
  },
  'active-recovery': {
    de: 'Reduziere das Tempo deutlich und marschiere oder steige locker am Platz. Lasse die Arme entspannt mitschwingen und atme ruhig, bis sich deine Belastung wieder leicht anfühlt. Wenn selbst die langsame Bewegung zu anstrengend ist, pausiere vollständig.',
    en: 'Reduce the pace substantially and march or step gently in place. Let your arms swing loosely and breathe steadily until the effort feels easy again. If even the slow movement feels too demanding, take complete rest.'
  },
  'leg-swing': {
    de: 'Halte dich leicht an einer Wand oder einem stabilen Gegenstand fest. Schwinge ein Bein kontrolliert vor und zurück, ohne den Oberkörper zu verdrehen oder Schwung zu erzwingen. Wechsle nach der Hälfte der Zeit die Seite.',
    en: 'Use light support from a wall or sturdy object. Swing one leg forward and backward with control without twisting your torso or forcing the range. Change sides halfway through.'
  },
  'calf-stretch': {
    de: 'Stütze die Hände an einer Wand ab und stelle einen Fuß hinter den anderen. Beuge das vordere Knie, halte das hintere Bein gestreckt und die hintere Ferse am Boden. Schiebe die Hüfte sanft vor, halte ohne Wippen und wechsle nach der Hälfte die Seite.',
    en: 'Place your hands on a wall and step one foot behind the other. Bend the front knee while keeping the back leg straight and its heel on the floor. Gently move your hips forward, hold without bouncing, and change sides halfway through.'
  },
  'hamstring-stretch': {
    de: 'Lege dich nahe einer Wand auf den Rücken und stütze eine Ferse mit leicht gebeugtem Knie an der Wand ab. Strecke das Knie nur so weit, bis du einen sanften Zug an der Oberschenkelrückseite spürst. Halte und wechsle nach der Hälfte die Seite.',
    en: 'Lie on your back near a wall and rest one heel against it with the knee slightly bent. Straighten the knee only until you feel a gentle pull along the back of the thigh. Hold and change sides halfway through.'
  },
  'quadriceps-stretch': {
    de: 'Stehe neben einer Wand und halte dich leicht fest. Greife einen Knöchel und führe die Ferse sanft Richtung Gesäß; die Knie bleiben nah beieinander und der Bauch ist leicht angespannt. Halte ohne ins Hohlkreuz zu fallen und wechsle nach der Hälfte die Seite.',
    en: 'Stand beside a wall and use light support. Hold one ankle and gently draw the heel toward your buttocks, keeping knees close and abdomen lightly braced. Hold without arching your back and change sides halfway through.'
  },
  'hip-flexor-stretch': {
    de: 'Knie auf einem gepolsterten Knie und stelle den anderen Fuß vorn auf. Halte Rücken und Becken aufrecht und verlagere das Gewicht sanft nach vorn, bis du einen Zug an der Vorderseite der knienden Hüfte spürst. Halte und wechsle nach der Hälfte die Seite.',
    en: 'Kneel on one padded knee with the other foot in front. Keep your back and pelvis upright and gently shift weight forward until you feel a stretch at the front of the kneeling hip. Hold and change sides halfway through.'
  },
  'shoulder-upper-back-stretch': {
    de: 'Stehe oder sitze aufrecht und führe einen Arm auf Schulterhöhe quer vor die Brust. Stütze ihn mit der anderen Hand unterhalb des Ellenbogens und ziehe ihn sanft näher zum Körper, ohne den Oberkörper zu verdrehen. Halte die Schulter tief und wechsle nach der Hälfte die Seite.',
    en: 'Stand or sit tall and bring one arm across your chest at shoulder height. Support it below the elbow with the other hand and gently draw it closer without rotating your torso. Keep the shoulder down and change sides halfway through.'
  },
  'chest-stretch': {
    de: 'Stehe oder sitze aufrecht und lege die Hände locker hinter den Kopf. Führe die gebeugten Ellenbogen sanft nach hinten und ziehe die Schulterblätter leicht zusammen, bis du einen angenehmen Zug in der Brust spürst. Halte den unteren Rücken neutral und atme frei.',
    en: 'Stand or sit tall and place your hands lightly behind your head. Gently draw the bent elbows backward and bring the shoulder blades slightly together until you feel a comfortable chest stretch. Keep your lower back neutral and breathe freely.'
  },
  'child-pose': {
    de: 'Knie dich hin, setze das Gesäß Richtung Fersen und lege den Oberkörper zwischen oder auf die Oberschenkel. Strecke die Arme nach vorn oder lege sie entspannt neben den Körper und stütze die Stirn bei Bedarf erhöht ab. Atme langsam und bleibe nur in einem angenehmen Bereich.',
    en: 'Kneel, sit your hips toward your heels, and lower your torso between or onto your thighs. Reach your arms forward or rest them beside your body, supporting your forehead if needed. Breathe slowly and stay only within a comfortable range.'
  },
  'cat-cow': {
    de: 'Beginne im Vierfüßlerstand mit Händen unter den Schultern und Knien unter der Hüfte. Beim Einatmen lässt du den Bauch sanft sinken und hebst Brust und Becken; beim Ausatmen rundest du den Rücken und lässt Kopf und Becken sinken. Wechsle langsam ohne in die Endposition zu drücken.',
    en: 'Start on hands and knees with hands under shoulders and knees under hips. As you inhale, gently release your belly and lift chest and pelvis; as you exhale, round your back and let head and pelvis lower. Alternate slowly without forcing either end position.'
  },
  'cobra-stretch': {
    de: 'Lege dich auf den Bauch und setze die Hände unter oder leicht vor die Schultern. Drücke sanft in die Hände und hebe den Brustkorb nur so weit an, wie Becken und Beine entspannt am Boden bleiben. Halte Schultern und Nacken lang und beende die Position bei Schmerzen im Rücken.',
    en: 'Lie face down with hands under or slightly in front of your shoulders. Press gently through your hands and lift your chest only as far as your pelvis and legs can remain relaxed on the floor. Keep shoulders and neck long, and stop if the position causes back pain.'
  },
  'yoga-bridge': {
    de: 'Lege dich auf den Rücken, beuge die Knie und stelle die Füße hüftbreit nahe am Gesäß auf. Drücke beide Füße in den Boden und hebe das Becken, bis Knie, Hüfte und Schultern eine ansteigende Linie bilden. Halte ruhig, ohne die Knie auseinanderfallen zu lassen oder den Nacken zu belasten.',
    en: 'Lie on your back with knees bent and feet hip-width apart near your hips. Press both feet into the floor and lift your pelvis until knees, hips, and shoulders form a rising line. Hold steadily without letting knees fall apart or placing pressure on your neck.'
  }
};

export const EXERCISE_LIBRARY: ExerciseDefinition[] = seeds.map(([id, category, de, en, difficulty, type, easier, harder]) => ({
  id, category,
  equipment: id === 'assisted-pull-up'
    ? ['pull-up bar', 'resistance band']
    : bandExercises.has(id)
      ? ['resistance band']
      : barExercises.has(id)
        ? ['pull-up bar']
        : supportExercises.has(id)
          ? ['wall or stable support']
          : id === 'triceps-dip' || id === 'incline-push-up'
            ? ['chair or stable raised support']
            : ['none'],
  difficulty, type,
  defaultTarget: type === 'duration' ? { seconds: 30 } : { min: 8, max: 12, unit: perSideExercises.has(id) ? 'per-side' : 'repetitions' },
  translations: {
    de: { name: de, instructions: detailedInstructions[id]!.de },
    en: { name: en, instructions: detailedInstructions[id]!.en }
  },
  illustration: `/assets/exercises/${id}.svg`,
  variants: { easier, harder }
}));

export const EXERCISES_BY_ID = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));
