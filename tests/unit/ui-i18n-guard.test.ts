import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const sourcePath = fileURLToPath(new URL('../../src/ui/app.ts', import.meta.url));
const sourceText = readFileSync(sourcePath, 'utf8');
const source = ts.createSourceFile(sourcePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const allowedStaticCopy = [
  'Home Workout',
  'GitHub',
  'HW',
  'PolyForm Perimeter',
  'Dr. Dustin Hebecker',
  'SCHEMA V',
  '文/A'
];

const visibleStaticCopy = (template: ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral): string => {
  const html = ts.isTemplateExpression(template)
    ? template.head.text + template.templateSpans.map((span) => `0${span.literal.text}`).join('')
    : template.text;
  if (!html.includes('<')) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replaceAll('0', ' ');
};

describe('user-visible UI copy', () => {
  it('comes from the complete translation catalogue', () => {
    const rawCopy: string[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        let visible = visibleStaticCopy(node);
        for (const allowed of allowedStaticCopy) visible = visible.replaceAll(allowed, '');
        visible = visible.replace(/[\p{N}\p{P}\p{S}\p{Z}\s]/gu, '');
        if (/\p{L}/u.test(visible)) rawCopy.push(visible.trim());
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(rawCopy).toEqual([]);
  });
});
