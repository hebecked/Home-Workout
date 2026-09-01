import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const directory = resolve('public/assets/exercises');
mkdirSync(directory, { recursive: true });

const groups = {
  legs: `squat sumo-squat reverse-lunge forward-lunge split-squat glute-bridge single-leg-glute-bridge calf-raise wall-sit`.split(' '),
  arms: `push-up incline-push-up knee-push-up pike-push-up pull-up assisted-pull-up chin-up resistance-band-row resistance-band-pull-apart triceps-dip`.split(' '),
  core: `dead-bug lying-leg-raise bird-dog plank side-plank mountain-climber hollow-hold superman`.split(' '),
  cardio: `jumping-jack step-jack high-knees marching-in-place burpee squat-to-reach`.split(' ')
};
const hueByGroup = { legs: 208, arms: 28, core: 276, cardio: 4 };
const hueByExercise = new Map(Object.entries(groups).flatMap(([group, ids]) => ids.map((id) => [id, hueByGroup[group]])));

const poses = {
  squat: {
    ghost: '<circle cx="160" cy="45" r="16"/><path d="M160 64V137M160 86L122 116M160 86L198 116M160 137L140 204M160 137L180 204"/>',
    active: '<circle cx="147" cy="75" r="16"/><path d="M151 94L137 145M146 108L108 130M146 108L188 126M137 145L94 154L72 204M137 145L189 157L224 204"/>',
    motion: 'M231 90C238 115 228 139 208 153'
  },
  'sumo-squat': {
    ghost: '<circle cx="160" cy="45" r="16"/><path d="M160 64V137M160 86L118 116M160 86L202 116M160 137L113 204M160 137L207 204"/>',
    active: '<circle cx="160" cy="74" r="16"/><path d="M160 93V145M160 108L116 128M160 108L204 128M160 145L103 157L65 204M160 145L217 157L255 204"/>',
    motion: 'M260 91C268 116 254 142 231 155'
  },
  'reverse-lunge': {
    ghost: '<circle cx="150" cy="45" r="16"/><path d="M150 64V137M150 86L116 118M150 86L184 118M150 137L132 204M150 137L168 204"/>',
    active: '<circle cx="143" cy="54" r="16"/><path d="M143 73L137 137M140 92L106 121M140 92L178 118M137 137L95 164L72 204M137 137L201 164L252 204"/>',
    motion: 'M184 127C207 136 228 151 244 171'
  },
  'forward-lunge': {
    ghost: '<circle cx="170" cy="45" r="16"/><path d="M170 64V137M170 86L136 118M170 86L204 118M170 137L152 204M170 137L188 204"/>',
    active: '<circle cx="178" cy="54" r="16"/><path d="M178 73L184 137M181 92L147 118M181 92L215 121M184 137L119 164L68 204M184 137L226 164L249 204"/>',
    motion: 'M135 127C112 136 91 151 75 171'
  },
  'split-squat': {
    ghost: '<circle cx="160" cy="45" r="16"/><path d="M160 64V137M160 86L126 116M160 86L194 116M160 137L105 204M160 137L225 204"/>',
    active: '<circle cx="160" cy="65" r="16"/><path d="M160 84V143M160 102L126 125M160 102L194 125M160 143L112 160L77 204M160 143L211 161L245 204"/>',
    motion: 'M266 85C270 109 261 131 243 145'
  },
  'glute-bridge': {
    ghost: '<circle cx="55" cy="180" r="15"/><path d="M75 184L148 187L216 152L248 204M91 187L72 204"/>',
    active: '<circle cx="55" cy="180" r="15"/><path d="M75 183L122 181L171 133L216 152L248 204M91 184L72 204"/>',
    motion: 'M147 174C145 155 151 140 166 127'
  },
  'single-leg-glute-bridge': {
    ghost: '<circle cx="55" cy="180" r="15"/><path d="M75 184L148 187L216 152L248 204M91 187L72 204"/>',
    active: '<circle cx="55" cy="180" r="15"/><path d="M75 183L122 181L171 133L219 151L250 204M171 133L226 91M91 184L72 204"/>',
    motion: 'M148 173C146 153 153 138 167 126'
  },
  'calf-raise': {
    ghost: '<circle cx="160" cy="45" r="16"/><path d="M160 64V139M160 86L125 119M160 86L195 119M160 139L141 199L116 204M160 139L179 199L204 204"/>',
    active: '<circle cx="160" cy="32" r="16"/><path d="M160 51V126M160 73L125 106M160 73L195 106M160 126L141 188L120 199M160 126L179 188L200 199"/>',
    motion: 'M228 153C232 129 229 107 220 89'
  },
  'wall-sit': {
    equipment: '<path d="M78 24V210" stroke="#8b96aa" stroke-width="8"/>',
    ghost: '<circle cx="124" cy="48" r="16"/><path d="M124 67L124 139M124 88L164 119M124 139L139 204M124 139L109 204"/>',
    active: '<circle cx="103" cy="76" r="16"/><path d="M103 95V149M103 112L139 132M103 149L170 149L218 204M170 149L170 204"/>',
    motion: 'M236 83C242 107 233 130 216 145'
  },
  'push-up': {
    ghost: '<circle cx="238" cy="143" r="15"/><path d="M219 148L151 161L75 188L50 204M211 150L184 177L193 204"/>',
    active: '<circle cx="238" cy="103" r="15"/><path d="M219 109L151 124L75 171L50 204M211 111L183 150L198 204"/>',
    motion: 'M264 155C271 139 270 123 263 108'
  },
  'incline-push-up': {
    equipment: '<path d="M48 118H105V204M48 204H118" stroke="#8b96aa" stroke-width="8"/>',
    ghost: '<circle cx="229" cy="151" r="15"/><path d="M210 155L155 163L101 132M155 163L244 204M113 137L101 165"/>',
    active: '<circle cx="225" cy="117" r="15"/><path d="M206 123L153 139L101 132M153 139L244 204M117 132L101 165"/>',
    motion: 'M251 157C259 142 258 128 251 115'
  },
  'knee-push-up': {
    ghost: '<circle cx="234" cy="151" r="15"/><path d="M215 156L155 168L96 187L72 204M155 168L184 204M183 204L216 204"/>',
    active: '<circle cx="230" cy="111" r="15"/><path d="M211 117L151 136L96 187L72 204M151 136L184 204M183 204L216 204"/>',
    motion: 'M258 158C266 141 264 124 256 110'
  },
  'pike-push-up': {
    ghost: '<circle cx="49" cy="159" r="12"/><path d="M61 151L101 84L145 204M101 84L40 204"/>',
    active: '<circle cx="191" cy="184" r="12"/><path d="M204 174L254 84L298 204M254 84L220 153L197 170L181 204"/>',
    motion: 'M157 124C149 144 151 165 162 181'
  },
  'pull-up': {
    equipment: '<path d="M34 40H286" stroke="#8b96aa" stroke-width="9"/>',
    ghost: '<circle cx="90" cy="95" r="13"/><path d="M90 111V154M90 116L60 40M90 116L120 40M90 154L75 204M90 154L105 204"/>',
    active: '<circle cx="220" cy="55" r="13"/><path d="M220 71V118M220 78L195 83L184 40M220 78L245 83L256 40M220 118L204 169M220 118L236 169"/>',
    motion: 'M151 153C159 128 159 102 151 79'
  },
  'assisted-pull-up': {
    equipment: '<path d="M34 40H286" stroke="#8b96aa" stroke-width="9"/><path d="M258 43C267 94 261 145 236 176C228 186 217 180 222 168C242 137 248 91 244 43" fill="none" stroke="#8b96aa" stroke-width="5" stroke-dasharray="7 6"/>',
    ghost: '<circle cx="90" cy="95" r="13"/><path d="M90 111V154M90 116L60 40M90 116L120 40M90 154L75 204M90 154L105 204"/>',
    active: '<circle cx="220" cy="55" r="13"/><path d="M220 71V118M220 78L195 83L184 40M220 78L245 83L256 40M220 118L202 169M220 118L240 145L225 171"/>',
    motion: 'M151 153C159 128 159 102 151 79'
  },
  'chin-up': {
    equipment: '<path d="M62 35H258" stroke="#8b96aa" stroke-width="9"/>',
    ghost: '<circle cx="160" cy="137" r="15"/><path d="M160 155V204M160 160L108 40M160 160L212 40"/>',
    active: '<circle cx="160" cy="69" r="16"/><path d="M160 88V153M160 101L108 40M160 101L212 40M160 153L133 204M160 153L187 204"/>',
    motion: 'M270 148C277 124 273 101 261 84'
  },
  'resistance-band-row': {
    equipment: '<path d="M55 48V205" stroke="#8b96aa" stroke-width="8"/><path d="M55 105L132 123M55 105L132 133" stroke="#8b96aa" stroke-width="4"/>',
    ghost: '<circle cx="218" cy="56" r="16"/><path d="M211 75L188 143M201 93L132 123M211 143L177 204M211 143L241 204"/>',
    active: '<circle cx="218" cy="56" r="16"/><path d="M211 75L188 143M201 93L165 109L132 128M211 143L177 204M211 143L241 204"/>',
    motion: 'M119 82C140 77 159 81 174 94'
  },
  'resistance-band-pull-apart': {
    equipment: '<path d="M97 112H223" stroke="#8b96aa" stroke-width="4"/>',
    ghost: '<circle cx="160" cy="48" r="16"/><path d="M160 67V145M160 89L126 112M160 89L194 112M160 145L134 204M160 145L186 204"/>',
    active: '<circle cx="160" cy="48" r="16"/><path d="M160 67V145M160 89L84 112M160 89L236 112M160 145L134 204M160 145L186 204"/>',
    motion: 'M126 82C106 77 88 82 75 96'
  },
  'triceps-dip': {
    equipment: '<path d="M77 124H139V204M77 204H151" stroke="#8b96aa" stroke-width="8"/>',
    ghost: '<circle cx="189" cy="72" r="16"/><path d="M181 91L167 145M175 108L132 124M167 145L221 162L252 204M167 145L151 204"/>',
    active: '<circle cx="189" cy="101" r="16"/><path d="M181 120L167 165M178 135L143 145L132 124M167 165L221 172L252 204M167 165L151 204"/>',
    motion: 'M264 80C271 103 267 125 254 141'
  },
  'dead-bug': {
    ghost: '<circle cx="53" cy="184" r="15"/><path d="M73 185H148M99 182L74 126M145 182L210 178M99 182L100 102M145 182L148 113L206 111"/>',
    active: '<circle cx="53" cy="184" r="15"/><path d="M73 185H148M99 182L49 130M145 182L224 180M99 182L101 103M145 182L151 116L209 116"/>',
    motion: 'M64 111C51 124 45 140 48 155M220 145C231 156 236 169 233 181'
  },
  'lying-leg-raise': {
    ghost: '<circle cx="53" cy="184" r="15"/><path d="M73 185H151M96 184L73 204M151 181L238 180M151 190L242 193"/>',
    active: '<circle cx="53" cy="184" r="15"/><path d="M73 185H151M96 184L73 204M151 184L214 91M151 190L227 100"/>',
    motion: 'M251 166C259 142 255 119 242 102'
  },
  'bird-dog': {
    ghost: '<circle cx="223" cy="116" r="15"/><path d="M204 121L141 137M183 126L211 191M148 136L126 193M148 136L91 176"/>',
    active: '<circle cx="223" cy="116" r="15"/><path d="M204 121L141 137M183 126L244 84M148 136L126 193M148 136L80 104"/>',
    motion: 'M250 121C260 108 263 94 258 82'
  },
  plank: {
    ghost: '<circle cx="238" cy="119" r="15"/><path d="M219 124L151 143L66 188M151 143L72 204M190 133L202 204"/>',
    active: '<circle cx="238" cy="104" r="15"/><path d="M219 109L151 128L66 188M151 128L72 204M190 117L202 204"/>',
    motion: 'M269 151C274 137 273 123 267 112'
  },
  'side-plank': {
    ghost: '<circle cx="111" cy="178" r="12"/><path d="M97 182L64 192L27 204M89 185L79 204M64 192L48 204"/>',
    active: '<circle cx="257" cy="88" r="13"/><path d="M242 98L188 132L126 181L103 204M188 138L135 188L116 204M230 105L215 160L226 204M230 105L238 58"/>',
    motion: 'M156 171C166 150 168 127 160 106'
  },
  'mountain-climber': {
    ghost: '<circle cx="238" cy="103" r="15"/><path d="M219 109L151 127L65 185M151 127L71 204M184 118L202 204"/>',
    active: '<circle cx="238" cy="103" r="15"/><path d="M219 109L151 127L65 185M151 127L111 158L151 184M184 118L202 204"/>',
    motion: 'M126 198C140 191 150 181 154 168'
  },
  'hollow-hold': {
    ghost: '<circle cx="72" cy="172" r="15"/><path d="M92 176L155 183M107 176L75 132M155 183L235 177"/>',
    active: '<circle cx="72" cy="164" r="15"/><path d="M92 169L155 183M106 168L53 117M155 183L239 137"/>',
    motion: 'M247 179C253 161 250 146 240 134'
  },
  superman: {
    ghost: '<circle cx="239" cy="176" r="15"/><path d="M219 181L153 187M199 183L248 204M153 187L74 202M153 187L88 204"/>',
    active: '<circle cx="239" cy="151" r="15"/><path d="M219 157L153 181M199 164L263 125M153 181L70 153M153 181L83 170"/>',
    motion: 'M270 184C280 167 279 151 270 138'
  },
  'jumping-jack': {
    ghost: '<circle cx="160" cy="51" r="16"/><path d="M160 70V144M160 91L128 123M160 91L192 123M160 144L143 204M160 144L177 204"/>',
    active: '<circle cx="160" cy="51" r="16"/><path d="M160 70V144M160 91L91 43M160 91L229 43M160 144L105 204M160 144L215 204"/>',
    motion: 'M237 103C251 88 256 70 251 53'
  },
  'step-jack': {
    ghost: '<circle cx="145" cy="51" r="16"/><path d="M145 70V144M145 91L115 120M145 91L175 120M145 144L130 204M145 144L160 204"/>',
    active: '<circle cx="145" cy="51" r="16"/><path d="M145 70V144M145 91L102 64M145 91L188 64M145 144L130 204M145 144L225 204"/>',
    motion: 'M180 183C199 181 217 186 230 198'
  },
  'high-knees': {
    ghost: '<circle cx="160" cy="48" r="16"/><path d="M160 67V140M160 88L126 119M160 88L194 119M160 140L137 204M160 140L183 204"/>',
    active: '<circle cx="160" cy="48" r="16"/><path d="M160 67V140M160 88L124 111M160 88L198 106M160 140L111 142L83 181M160 140L185 204"/>',
    motion: 'M84 196C73 178 75 159 88 145'
  },
  'marching-in-place': {
    ghost: '<circle cx="160" cy="48" r="16"/><path d="M160 67V140M160 88L126 119M160 88L194 119M160 140L137 204M160 140L183 204"/>',
    active: '<circle cx="160" cy="48" r="16"/><path d="M160 67V140M160 88L127 108M160 88L193 108M160 140L126 158L104 190M160 140L185 204"/>',
    motion: 'M105 202C94 185 95 169 106 156'
  },
  burpee: {
    ghost: '<circle cx="160" cy="48" r="16"/><path d="M160 67V137M160 88L126 119M160 88L194 119M160 137L138 204M160 137L182 204"/>',
    active: '<circle cx="226" cy="151" r="15"/><path d="M207 156L151 168L91 183M151 168L69 204M151 168L222 204M207 156L235 204"/>',
    motion: 'M247 71C273 95 279 124 263 149'
  },
  'squat-to-reach': {
    ghost: '<circle cx="154" cy="78" r="16"/><path d="M154 97L145 146M151 111L113 131M151 111L191 130M145 146L99 160L72 204M145 146L195 160L226 204"/>',
    active: '<circle cx="160" cy="45" r="16"/><path d="M160 64V137M160 84L116 35M160 84L204 35M160 137L140 204M160 137L180 204"/>',
    motion: 'M238 143C253 119 250 93 235 73'
  }
};

const ids = Object.keys(poses);
for (const id of ids) {
  const hue = hueByExercise.get(id);
  if (hue === undefined) throw new Error(`Missing exercise color group: ${id}`);
  const pose = poses[id];
  const title = id.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img" aria-labelledby="title"><title id="title">${title}</title><defs><marker id="motion-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="hsl(${hue} 55% 52%)" opacity=".55"/></marker></defs><rect width="320" height="240" rx="28" fill="hsl(${hue} 42% 93%)"/>${pose.equipment ?? ''}<g data-pose="start" fill="none" stroke="hsl(${hue} 42% 76%)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${pose.ghost}</g><g data-pose="finish" fill="none" stroke="#18233a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">${pose.active}</g><path d="${pose.motion}" fill="none" stroke="hsl(${hue} 55% 52%)" stroke-width="4" stroke-linecap="round" opacity=".72" marker-end="url(#motion-arrow)"/><path d="M42 210H278" stroke="hsl(${hue} 65% 48%)" stroke-width="7" stroke-linecap="round"/></svg>`;
  writeFileSync(resolve(directory, `${id}.svg`), svg);
}

const expected = [...Object.values(groups)].flat();
if (ids.length !== expected.length || expected.some((id) => !Object.hasOwn(poses, id))) {
  throw new Error(`Pose coverage mismatch: ${ids.length}/${expected.length}`);
}

console.log(`Generated ${ids.length} movement-specific local SVG exercise illustrations.`);
