import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Read the source of truth, not a second hand-maintained palette.
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = new Map(
  [...css.matchAll(/(--[\w-]+)\s*:\s*(#[\da-f]{6})\s*;/gi)].map((match) => [
    match[1],
    match[2].toLowerCase(),
  ]),
);

function themeTokens(selector) {
  const start = css.indexOf(selector);
  assert.ok(start !== -1, `Missing theme selector ${selector}.`);
  const block = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return new Map(
    [...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
  );
}

const lightTheme = themeTokens(':root');
const darkTheme = new Map([...lightTheme, ...themeTokens('.surface-dark')]);

function resolveColor(theme, name, visited = new Set()) {
  assert.ok(!visited.has(name), `Circular theme token ${name}.`);
  visited.add(name);
  const value = theme.get(name);
  assert.ok(value, `Missing theme token ${name}.`);
  const alias = value.match(/^var\((--[\w-]+)\)$/);
  return alias ? resolveColor(theme, alias[1], visited) : value;
}

function luminance(hex) {
  assert.match(hex, /^#[\da-f]{6}$/i, 'Contrast requires an opaque six-digit sRGB color.');
  const channels = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test('contrast calculation preserves thresholds without rounding up', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#141312', '#141312'), 1);
  assert.ok(Math.abs(contrast('#777777', '#ffffff') - 4.478089453577214) < 1e-10);
  assert.ok(contrast('#777777', '#ffffff') < 4.5, 'A rounded 4.5 result must still fail.');
});

// These are the supported semantic pairings, not a promise that every combination
// of palette colors is accessible. Small text is held to 4.5:1 throughout.
const textPairs = [
  ['--ink', '--paper', 'body text'],
  ['--ink', '--paper-raised', 'card and field text'],
  ['--ink-muted', '--paper', 'secondary text'],
  ['--ink-muted', '--paper-raised', 'field hints'],
  ['--signal-ink', '--paper', 'accent links'],
  ['--signal-ink', '--paper-raised', 'accent links on cards'],
  ['--ink', '--signal', 'primary button label'],
  ['--ink', '--lavender', 'secondary badge label'],
  ['--ink', '--paper-fold', 'status badges and primary button hover'],
  ['--ink-muted', '--paper-fold', 'disabled control labels'],
  ['--muted-purple', '--paper', 'purple text'],
  ['--muted-purple', '--paper-raised', 'purple text on cards'],
  ['--paper', '--charcoal', 'dark section text'],
  ['--lavender', '--charcoal', 'dark section accent text'],
  ['--signal', '--charcoal', 'dark section accent links'],
  ['--error', '--paper', 'inline error text'],
  ['--error', '--paper-raised', 'field error text'],
  ['--dark-muted', '--charcoal', 'dark section secondary text'],
];

const interfacePairs = [
  ['--border-strong', '--paper', 'field boundary'],
  ['--border-strong', '--paper-raised', 'field boundary on cards'],
  ['--signal-ink', '--paper', 'focus ring'],
  ['--signal-ink', '--paper-raised', 'focus ring on cards'],
  ['--signal', '--charcoal', 'dark section focus ring'],
];

for (const [pairs, minimum] of [
  [textPairs, 4.5],
  [interfacePairs, 3],
]) {
  for (const [foreground, background, role] of pairs) {
    test(`${role}: ${foreground} on ${background} meets ${minimum}:1`, (context) => {
      assert.ok(tokens.has(foreground), `Missing color token ${foreground} in tokens.css.`);
      assert.ok(tokens.has(background), `Missing color token ${background} in tokens.css.`);
      const ratio = contrast(tokens.get(foreground), tokens.get(background));
      context.diagnostic(`${ratio.toFixed(3)}:1 (minimum ${minimum}:1)`);
      assert.ok(
        ratio >= minimum,
        `${foreground} (${tokens.get(foreground)}) on ${background} (${tokens.get(background)}) ` +
          `has ${ratio.toFixed(3)}:1 contrast; requires ${minimum}:1 for ${role}.`,
      );
    });
  }
}

// Exercise the aliases that components actually inherit. A correct raw palette
// must not mask a light-theme error color accidentally reused on a dark field.
for (const [themeName, theme] of [
  ['light', lightTheme],
  ['dark', darkTheme],
]) {
  for (const [foreground, background, minimum, role] of [
    ['--text', '--surface', 4.5, 'body and secondary button text'],
    ['--text', '--surface-raised', 4.5, 'card, input, toast, and hover text'],
    ['--text-muted', '--surface', 4.5, 'hints and social handles'],
    ['--text-muted', '--surface-raised', 4.5, 'card copy and placeholders'],
    ['--feedback-error', '--surface', 4.5, 'inline error text'],
    ['--feedback-error', '--surface-raised', 3, 'invalid field boundary'],
    ['--border-strong', '--surface', 3, 'secondary button and field outer boundary'],
    ['--border-strong', '--surface-raised', 3, 'field inner boundary'],
    ['--focus', '--surface', 3, 'focus indicator'],
    ['--focus', '--surface-raised', 3, 'focus indicator on a card'],
  ]) {
    test(`${themeName} theme ${role}: ${foreground} on ${background}`, (context) => {
      const first = resolveColor(theme, foreground);
      const second = resolveColor(theme, background);
      const ratio = contrast(first, second);
      context.diagnostic(`${ratio.toFixed(3)}:1 (minimum ${minimum}:1)`);
      assert.ok(
        ratio >= minimum,
        `${themeName} theme ${foreground} (${first}) on ${background} (${second}) ` +
          `has ${ratio.toFixed(3)}:1 contrast; requires ${minimum}:1 for ${role}.`,
      );
    });
  }
}
