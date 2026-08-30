import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = `squat sumo-squat reverse-lunge forward-lunge split-squat glute-bridge single-leg-glute-bridge calf-raise wall-sit push-up incline-push-up knee-push-up pike-push-up pull-up assisted-pull-up chin-up resistance-band-row resistance-band-pull-apart dead-bug bird-dog plank side-plank mountain-climber hollow-hold jumping-jack step-jack high-knees marching-in-place burpee squat-to-reach superman triceps-dip`.split(' ');
const directory = resolve('public/assets/exercises');
mkdirSync(directory, { recursive: true });

for (const [index, id] of source.entries()) {
  const hue = [72, 151, 206, 28, 184, 340][index % 6];
  const armY = 74 + (index % 4) * 6;
  const legOffset = 22 + (index % 3) * 7;
  const title = id.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img" aria-labelledby="title"><title id="title">${title}</title><rect width="320" height="240" rx="28" fill="hsl(${hue} 28% 92%)"/><circle cx="160" cy="54" r="18" fill="none" stroke="#17231d" stroke-width="9"/><path d="M160 76v72M160 ${armY}l-${48 + index % 9} ${32 - index % 5}M160 ${armY}l${48 + index % 9} ${32 - index % 5}M160 146l-${legOffset} 58M160 146l${legOffset} 58" fill="none" stroke="#17231d" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M68 210h184" stroke="hsl(${hue} 55% 45%)" stroke-width="7" stroke-linecap="round"/></svg>`;
  writeFileSync(resolve(directory, `${id}.svg`), svg);
}

console.log(`Generated ${source.length} original local SVG exercise illustrations.`);
