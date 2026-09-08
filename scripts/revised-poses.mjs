// Named anatomical chains: head -> neck -> shoulder -> hip; each limb has
// exactly one elbow/knee. Profile limbs overlap intentionally, never branch.
export const skeletons = [];
export function figure(head, shoulder, hip, arms, legs, facing = 'right') {
  const radius = 12;
  const distance = Math.hypot(shoulder[0] - head[0], shoulder[1] - head[1]);
  const neck = head.map((v, i) => v + (shoulder[i] - v) * radius / distance);
  const chains = { neck: [neck, shoulder], torso: [shoulder, hip] };
  arms.forEach((limb, i) => { chains[`arm-${i}`] = [shoulder, ...limb]; });
  legs.forEach((limb, i) => { chains[`leg-${i}`] = [hip, ...limb]; });
  const model = { head, shoulder, hip, arms, legs, chains };
  skeletons.push(model);
  for (const [name, points] of Object.entries(chains)) {
    if (points.some(p => p.length !== 2 || p.some(v => !Number.isFinite(v)))) throw new Error(`Invalid ${name}`);
    if (/^(arm|leg)/.test(name) && points.length !== 3) throw new Error(`Extra joint: ${name}`);
  }
  const paths = Object.entries(chains).map(([name, points]) => `<path data-part="${name}" d="M${points.map(p => p.join(' ')).join('L')}"/>`).join('');
  const nose = facing === 'front' ? '' : `<path data-part="face" stroke-width="3" d="M${head[0] + (facing === 'right' ? 11 : -11)} ${head[1] - 2}l${facing === 'right' ? 4 : -4} 4"/>`;
  return `<g data-anatomy="joint-chains">${paths}<circle data-part="head" cx="${head[0]}" cy="${head[1]}" r="${radius}" fill="var(--pose-background)"/>${nose}</g>`;
}
const pose = (active, ghost = '', motion = '', equipment = '') => ({ active, ghost, motion, equipment });
const wall = x => `<path d="M${x} 30V210" stroke="#8b96aa" stroke-width="8"/>`;
const standing = (arms = [[[132, 106], [120, 133]], [[188, 106], [200, 133]]]) => figure([160, 43], [160, 67], [160, 125], arms, [[[143, 165], [130, 204]], [[177, 165], [190, 204]]], 'front');
const squat = wide => figure([160, 83], [160, 107], [160, 157], [[[135, 117], [143, 90]], [[185, 117], [177, 90]]], [[[wide ? 108 : 126, 163], [wide ? 82 : 115, 204]], [[wide ? 212 : 194, 163], [wide ? 238 : 205, 204]]], 'front');
const bridge = (raised, single = false) => {
  const hip = raised ? [143, 157] : [145, 196];
  const knee = [192, 135];
  return figure([55, 185], [80, 185], hip, [[[112, 198], [147, 201]]], [[knee, [223, 204]], ...(single ? [[[181, raised ? 102 : 150], [208, raised ? 60 : 113]]] : [])], 'right');
};
const push = down => {
  const shoulder = down ? [220, 166] : [209, 126];
  const hip = down ? [148, 182.1] : [141, 159.4];
  return figure(down ? [244, 161] : [232, 113], shoulder, hip,
    [[down ? [193, 184] : [220, 165], [230, 204]]], [[[99, down ? 193 : 180], [50, 204]]]);
};
const plank = figure([235, 137], [211, 147], [146, 172], [[[209, 203], [249, 203]]], [[[97, 190], [49, 204]]]);
const march = high => figure([159, 44], [155, 69], [149, 125], [[[183, 93], [207, 75]], [[124, 96], [146, 113]]], [[[148, 164], [146, 204]], [[190, high ? 126 : 151], [186, high ? 168 : 193]]]);
const marchStart = figure([159, 44], [155, 69], [149, 125], [[[133, 96], [155, 113]]], [[[148, 164], [146, 204]], [[168, 161], [183, 201]]]);
const prone = raised => figure(raised ? [217, 177] : [217, 194], raised ? [193, 182] : [193, 194], [138, 195], [[[228, raised ? 171 : 194], [263, raised ? 160 : 194]]], [[[98, raised ? 184 : 195], [56, raised ? 178 : 195]]]);
const crouch = figure([182, 121], [165, 141], [125, 165], [[[182, 174], [185, 204]]], [[[160, 180], [126, 204]]]);
const jump = figure([160, 52], [160, 76], [160, 131], [[[136, 49], [125, 20]], [[184, 49], [195, 20]]], [[[147, 164], [144, 199]], [[173, 164], [176, 199]]], 'front');
const burpeePhase = (svg, number, color, shift = 0) => `<g data-burpee-phase="${number}" stroke="${color}" stroke-width="7" transform="translate(35 42) scale(.8)"><g transform="translate(${shift} 0)">${svg}</g></g>`;
const shoulder = standing([[[129, 93], [130, 126]], [[191, 93], [190, 126]]]);
const hipStretch = shift => figure([147 + shift, 62], [147 + shift, 86], [147 + shift, 140], [[[173 + shift, 113], [191, 150]]], [[[195, 153], [197, 204]], [[114, 202], [66, 202]]]);
export const revisedPoses = {
  squat: pose(squat(false), standing(), 'M87 112V151 M233 112V151'),
  'sumo-squat': pose(squat(true), standing(), 'M67 110V155 M253 110V155'),
  'split-squat': pose(figure([145, 71], [145, 95], [140, 151], [[[164, 118], [181, 141]]], [[[190, 157], [190, 204]], [[109, 194], [68, 204]]]), figure([145, 44], [145, 68], [140, 124], [[[165, 90], [181, 116]]], [[[170, 162], [190, 204]], [[100, 159], [68, 204]]]), 'M249 94V160'),
  'glute-bridge': pose(bridge(true), bridge(false), 'M138 218V177'),
  'single-leg-glute-bridge': pose(bridge(true, true), bridge(false, true), 'M117 222V176'),
  'calf-raise': pose(figure([152, 33], [148, 58], [148, 116], [[[179, 75], [203, 98]]], [[[149, 155], [151, 191]]]) + '<path data-part="foot" d="M151 191L172 204"/>', figure([152, 46], [148, 71], [148, 129], [[[179, 88], [203, 111]]], [[[149, 167], [151, 204]]]) + '<path d="M151 204H174"/>', 'M117 200V180'),
  'wall-sit': pose(figure([106, 72], [92, 97], [92, 155], [[[122, 127], [155, 151]]], [[[147, 155], [148, 204]]]), '', '', wall(84)),
  'push-up': pose(push(true), push(false), 'M268 115V165'),
  'scapular-push-up': pose(figure([235, 115], [212, 129], [144, 160], [[[216, 167], [220, 204]]], [[[97, 183], [50, 204]]]), figure([238, 108], [215, 122], [146, 157], [[[217, 163], [220, 204]]], [[[98, 181], [50, 204]]]), 'M263 113V140'),
  'incline-push-up': pose(figure([91, 113], [111, 128], [166, 153], [[[130, 102], [100, 137]]], [[[211, 176], [256, 204]]], 'left'), figure([97, 74], [117, 90], [171, 136], [[[103, 113], [100, 137]]], [[[213, 170], [256, 204]]], 'left'), 'M67 76V112', '<path d="M48 143H115V210M52 143V210" fill="none" stroke="#8b96aa" stroke-width="8"/>'),
  'knee-push-up': pose(figure([235, 159], [212, 167], [155, 187], [[[188, 183], [223, 204]]], [[[108, 204], [65, 186]]]), figure([229, 106], [208, 122], [155, 164], [[[215, 162], [223, 204]]], [[[108, 204], [65, 186]]]), 'M263 107V158'),
  'resistance-band-row': pose(figure([172, 45], [166, 70], [165, 129], [[[191, 111], [155, 116]]], [[[146, 166], [129, 204]], [[186, 166], [201, 204]]]), figure([172, 45], [166, 70], [165, 129], [[[132, 88], [99, 108]]], [[[146, 166], [129, 204]], [[186, 166], [201, 204]]]), 'M91 129H149', wall(45) + '<circle data-anchor="band" cx="45" cy="109" r="7" fill="#a65312"/><path d="M45 109L154 115M45 109L99 108" fill="none" stroke="#a65312" stroke-width="3" stroke-dasharray="6 4"/>'),
  'dead-bug': pose(figure([64, 184], [88, 195], [151, 195], [[[64, 165], [39, 141]], [[82, 158], [76, 121]]], [[[189, 174], [232, 181]], [[143, 148], [184, 139]]]), figure([64, 184], [88, 195], [151, 195], [[[105, 157], [102, 122]]], [[[173, 152], [214, 140]]]), 'M221 146L240 170 M93 106L49 119'),
  plank: pose(plank),
  'mountain-climber': pose(figure([237, 111], [214, 127], [147, 151], [[[218, 166], [225, 204]]], [[[97, 180], [48, 204]], [[195, 177], [154, 201]]]), figure([237, 111], [214, 127], [147, 151], [[[218, 166], [225, 204]]], [[[97, 180], [48, 204]], [[151, 187], [104, 204]]]), 'M153 188L182 177'),
  'hollow-hold': pose(figure([99, 168], [116, 185], [168, 198], [[[79, 158], [45, 144]]], [[[213, 181], [256, 164]]], 'left'), figure([73, 193], [99, 197], [161, 197], [[[66, 197], [30, 197]]], [[[207, 197], [253, 197]]], 'left'), 'M55 185V156 M263 195V172'),
  'high-knees': pose(march(true), marchStart, 'M217 173V126'),
  'marching-in-place': pose(march(false), marchStart, 'M218 190V155'),
  burpee: pose(burpeePhase(push(true), 3, '#a72f32', -45) + burpeePhase(crouch, 1, '#18233a'), burpeePhase(jump, 4, '#a65312', 25) + burpeePhase(push(false), 2, '#667085', -45), 'M278 164V100', '<g data-phase-labels="overlaid" font-family="Comic Sans MS, Comic Sans, cursive" font-size="24" font-weight="700" text-anchor="middle"><text x="103" y="33" fill="#18233a">1</text><text x="141" y="33" fill="#667085">2</text><text x="179" y="33" fill="#a72f32">3</text><text x="217" y="33" fill="#a65312">4</text></g>'),
  'squat-to-reach': pose(standing([[[132, 47], [111, 21]], [[188, 47], [209, 21]]]), squat(false), 'M82 154V81 M238 154V81'),
  superman: pose(prone(true)),
  'superman-dynamic': pose(prone(true), prone(false), 'M61 210V187 M271 195V171'),
  'heel-dig': pose(figure([151, 49], [147, 74], [142, 129], [[[177, 91], [193, 66]]], [[[130, 164], [134, 204]], [[181, 164], [220, 204]]]) + '<path data-part="foot" d="M220 204L236 192"/>', figure([151, 49], [147, 74], [142, 129], [[[124, 97], [139, 118]]], [[[130, 164], [134, 204]], [[159, 166], [176, 204]]]), 'M181 216H219'),
  'shoulder-roll': pose(shoulder, standing([[[129, 85], [130, 119]], [[191, 85], [190, 119]]]), 'M110 75C89 59 86 101 112 94 M210 75C231 59 234 101 208 94'),
  'arm-circle': pose(standing([[[123, 69], [87, 69]], [[197, 69], [233, 69]]]), standing([[[127, 50], [96, 31]], [[193, 50], [224, 31]]]), 'M72 40C40 55 42 96 78 105 M248 40C280 55 278 96 242 105'),
  'leg-swing': pose(figure([158, 45], [153, 70], [147, 128], [[[190, 80], [241, 91]]], [[[146, 167], [143, 204]], [[188, 144], [230, 158]]]), figure([158, 45], [153, 70], [147, 128], [[[190, 80], [241, 91]]], [[[146, 167], [143, 204]], [[107, 147], [70, 169]]]), 'M72 184C124 221 191 213 227 178', wall(250)),
  'calf-stretch': pose(figure([112, 59], [126, 82], [156, 132], [[[92, 89], [62, 105]]], [[[115, 157], [103, 204]], [[194, 167], [234, 204]]], 'left') + '<path data-part="foot" d="M234 204H215M103 204H85"/>', '', '', wall(54)),
  'hamstring-stretch': pose(figure([164, 115], [147, 138], [108, 200], [[[177, 161], [207, 185]]], [[[164, 201], [221, 202]], [[82, 190], [142, 205]]]) + '<path data-part="foot" d="M221 202L225 183"/>'),
  'hip-flexor-stretch': pose(hipStretch(12), hipStretch(0), 'M152 163H178'),
  'shoulder-upper-back-stretch': pose(figure([160, 50], [160, 75], [160, 133], [[[191, 91], [222, 105]], [[186, 113], [192, 74]]], [[[144, 169], [133, 204]], [[176, 169], [187, 204]]], 'front')),
  'chest-stretch': pose(figure([157, 50], [157, 75], [155, 133], [[[196, 77], [198, 40]], [[131, 99], [129, 132]]], [[[137, 167], [124, 204]], [[175, 167], [196, 204]]], 'left'), '', '', wall(207)),
  'child-pose': pose(figure([120, 189], [146, 169], [204, 184], [[[108, 191], [69, 204]]], [[[164, 203], [224, 204]]], 'left')),
  'cobra-stretch': pose(figure([222, 116], [207, 139], [157, 194], [[[222, 167], [212, 204]]], [[[114, 197], [70, 200]]])),
  'yoga-bridge': pose(bridge(true))
};
