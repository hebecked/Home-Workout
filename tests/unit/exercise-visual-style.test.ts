import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { REVISED_ILLUSTRATIONS } from '../../src/data/illustration-revisions';

const svgFor = (id: string): string => readFileSync(resolve('public/assets/exercises', `${id}.svg`), 'utf8');
const finish = (id: string): string => svgFor(id).split('data-pose="finish"')[1]!;
const points = (svg: string, part: string): number[][] => {
  const path = svg.match(new RegExp(`data-part="${part}" d="([^"]+)"`))?.[1];
  expect(path, part).toBeDefined();
  return path!.slice(1).split('L').map(p => p.split(' ').map(Number));
};
describe('exercise illustration visual system', () => {
  it('preserves the category colours across the complete library', () => {
    const hues = { legs: 208, push: 28, pull: 28, core: 276, cardio: 4, 'full-body': 4, 'warm-up': 42, stretch: 160 };
    expect(EXERCISE_LIBRARY).toHaveLength(52);
    for (const exercise of EXERCISE_LIBRARY) {
      const svg = svgFor(exercise.id);
      expect(svg).toContain(`fill="hsl(${hues[exercise.category]} 42% 93%)"`);
      expect(svg).toContain(`stroke="hsl(${hues[exercise.category]} 65% 48%)"`);
    }
  });
  it('connects each revised arm at the shoulder and leg at the hip with only one elbow or knee', () => {
    expect(REVISED_ILLUSTRATIONS.size).toBe(34);
    for (const id of REVISED_ILLUSTRATIONS) {
      const bodies = [...svgFor(id).matchAll(/<g data-anatomy="joint-chains">([\s\S]*?)<\/g>/g)];
      expect(bodies.length, id).toBeGreaterThan(0);
      for (const [, body] of bodies) {
        const [shoulder, hip] = points(body!, 'torso');
        expect(points(body!, 'neck')[1], id).toEqual(shoulder);
        const limbs = [...body!.matchAll(/data-part="((?:arm|leg)-\d)"/g)];
        expect(limbs.length).toBeGreaterThanOrEqual(2);
        expect(limbs.length).toBeLessThanOrEqual(4);
        for (const [, part] of limbs) {
          const chain = points(body!, part!);
          expect(chain).toHaveLength(3);
          expect(chain[0]).toEqual(part!.startsWith('arm') ? shoulder : hip);
          for (let i = 1; i < chain.length; i++) {
            const length = Math.hypot(chain[i]![0]! - chain[i - 1]![0]!, chain[i]![1]! - chain[i - 1]![1]!);
            expect(length, `${id}: ${part}`).toBeGreaterThan(15);
            expect(length, `${id}: ${part}`).toBeLessThan(80);
          }
        }
      }
    }
  });
  it('makes both squat legs mirror-symmetric', () => {
    for (const id of ['squat', 'sumo-squat', 'squat-to-reach']) {
      const svg = id === 'squat-to-reach' ? svgFor(id).split('data-pose="finish"')[0]! : finish(id);
      const left = points(svg, 'leg-0'); const right = points(svg, 'leg-1');
      left.forEach((p, i) => { expect(p[0]! + right[i]![0]!).toBe(320); expect(p[1]).toBe(right[i]![1]); });
    }
  });
  it('keeps a rigid push-up body with grounded hand and toes in both phases', () => {
    for (const [, body] of svgFor('push-up').matchAll(/<g data-anatomy="joint-chains">([\s\S]*?)<\/g>/g)) {
      const [shoulder, hip] = points(body!, 'torso');
      const [, knee, foot] = points(body!, 'leg-0');
      const distanceFromLine = (p: number[]): number => Math.abs((foot![0]! - shoulder![0]!) * (p[1]! - shoulder![1]!) - (foot![1]! - shoulder![1]!) * (p[0]! - shoulder![0]!)) / Math.hypot(foot![0]! - shoulder![0]!, foot![1]! - shoulder![1]!);
      expect(distanceFromLine(hip!)).toBeLessThan(2);
      expect(distanceFromLine(knee!)).toBeLessThan(2);
      expect(foot![1]).toBe(204);
      expect(points(body!, 'arm-0')[2]![1]).toBe(204);
    }
  });
  it('distinguishes forearm and knee supports and makes the bridge torso/thigh continuous', () => {
    expect(points(finish('plank'), 'arm-0').slice(1).map(p => p[1])).toEqual([203, 203]);
    expect(svgFor('plank')).not.toContain('data-pose="start"');
    const leg = points(finish('knee-push-up'), 'leg-0');
    expect(leg[1]![1]).toBe(204); expect(leg[2]![1]).toBeLessThan(204);
    const [shoulder, hip] = points(finish('glute-bridge'), 'torso');
    const knee = points(finish('glute-bridge'), 'leg-0')[1]!;
    expect(Math.abs((hip![1]! - shoulder![1]!) / (hip![0]! - shoulder![0]!) - (knee[1]! - hip![1]!) / (knee[0]! - hip![0]!))).toBeLessThan(.02);
  });
  it('uses separate burpee panels and keeps accepted pull-up overlays', () => {
    expect(svgFor('burpee').match(/transform="translate/g)).toHaveLength(4);
    for (const id of ['pull-up', 'chin-up']) {
      expect(svgFor(id)).toContain('<circle cx="160" cy="95"');
      expect(svgFor(id)).toContain('<circle cx="160" cy="55"');
    }
  });
});
