import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: [
      '.astro/**',
      '.cache/**',
      '.tools/**',
      '.wrangler/**',
      'dist/**',
      'node_modules/**',
      'worker-configuration.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,tsx,astro}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
