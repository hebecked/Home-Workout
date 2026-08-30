import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = `squat sumo-squat reverse-lunge forward-lunge split-squat glute-bridge single-leg-glute-bridge calf-raise wall-sit push-up incline-push-up knee-push-up pike-push-up pull-up assisted-pull-up chin-up resistance-band-row resistance-band-pull-apart dead-bug lying-leg-raise bird-dog plank side-plank mountain-climber hollow-hold jumping-jack step-jack high-knees marching-in-place burpee squat-to-reach superman triceps-dip`.split(' ');
const directory = resolve('public/assets/exercises');
mkdirSync(directory, { recursive: true });

for (const [index, id] of source.entries()) {
  const hue = [16, 32, 208, 224, 266, 334][index % 6];
  const armY = 74 + (index % 4) * 6;
  const legOffset = 22 + (index % 3) * 7;
  const title = id.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
  const specialFigures = {
    squat: `<circle cx="160" cy="50" r="18" fill="none" stroke="#18233a" stroke-width="9"/><path d="M160 72v66M160 91l-48 29M160 91l48 29M160 138l-43 35-28 31M160 138l43 35 28 31" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'push-up': `<circle cx="235" cy="111" r="17" fill="none" stroke="#18233a" stroke-width="9"/><path d="M214 121 139 142 63 165M176 132l24 53M130 145l28 42" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'pull-up': `<path d="M66 38h188M92 38v28M228 38v28" fill="none" stroke="hsl(${hue} 65% 48%)" stroke-width="8" stroke-linecap="round"/><circle cx="160" cy="92" r="18" fill="none" stroke="#18233a" stroke-width="9"/><path d="M160 114v62M160 126 94 64M160 126l66-62M160 176l-31 34M160 176l31 34" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'reverse-lunge': `<circle cx="154" cy="49" r="18" fill="none" stroke="#18233a" stroke-width="9"/><path d="M154 71v66M154 88l-45 35M154 88l45 30M154 136l-48 38 54 27M154 136l64 28 42 38" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'glute-bridge': `<circle cx="69" cy="164" r="17" fill="none" stroke="#18233a" stroke-width="9"/><path d="M90 164h55l47-46 46 46M112 164l-25 35M192 118l46 46" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'dead-bug': `<circle cx="160" cy="157" r="17" fill="none" stroke="#18233a" stroke-width="9"/><path d="M160 136V91M160 111l-55-43M160 111l55-43M160 91l-52 13-30-28M160 91l52 13 30-28" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'lying-leg-raise': `<circle cx="69" cy="160" r="17" fill="none" stroke="#18233a" stroke-width="9"/><path d="M90 160h82M108 160l-24 34M172 160l46-68M172 160l68-42" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    'jumping-jack': `<circle cx="160" cy="66" r="18" fill="none" stroke="#18233a" stroke-width="9"/><path d="M160 88v68M160 103 90 51M160 103l70-52M160 156l-55 49M160 156l55 49" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
  };
  const figure = (specialFigures[id] ?? `<circle cx="160" cy="54" r="18" fill="none" stroke="#18233a" stroke-width="9"/><path d="M160 76v72M160 ${armY}l-${48 + index % 9} ${32 - index % 5}M160 ${armY}l${48 + index % 9} ${32 - index % 5}M160 146l-${legOffset} 58M160 146l${legOffset} 58" fill="none" stroke="#18233a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`) + `<path d="M44 210h232" stroke="hsl(${hue} 65% 48%)" stroke-width="7" stroke-linecap="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" role="img" aria-labelledby="title"><title id="title">${title}</title><rect width="320" height="240" rx="28" fill="hsl(${hue} 42% 93%)"/>${figure}</svg>`;
  writeFileSync(resolve(directory, `${id}.svg`), svg);
}

console.log(`Generated ${source.length} original local SVG exercise illustrations.`);
