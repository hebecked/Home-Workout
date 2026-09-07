export const REVISED_ILLUSTRATIONS = new Set(`squat sumo-squat split-squat glute-bridge single-leg-glute-bridge calf-raise wall-sit push-up scapular-push-up incline-push-up knee-push-up resistance-band-row dead-bug plank mountain-climber hollow-hold high-knees marching-in-place burpee squat-to-reach superman superman-dynamic heel-dig shoulder-roll arm-circle leg-swing calf-stretch hamstring-stretch hip-flexor-stretch shoulder-upper-back-stretch chest-stretch child-pose cobra-stretch yoga-bridge`.split(' '));
const ROUND_THREE_ILLUSTRATIONS = new Set('resistance-band-row dead-bug mountain-climber burpee hamstring-stretch child-pose'.split(' '));
export const CURRENT_REVIEW_ILLUSTRATIONS = new Set(['burpee']);
export const REVIEW_ROUND = 4;
export const illustrationRevision = (id: string): number => CURRENT_REVIEW_ILLUSTRATIONS.has(id) ? REVIEW_ROUND : ROUND_THREE_ILLUSTRATIONS.has(id) ? 3 : REVISED_ILLUSTRATIONS.has(id) ? 2 : 1;
