import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

import globals from 'globals';

export default {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.node,
    },
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
  ignores: [
    'dist/*',
    'node_modules/*',
    'coverage/*',
    '.nx/*',
    '**/vite.config.*.timestamp*',
    '**/vitest.config.*.timestamp*',
  ],
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  plugins: {
    '@typescript-eslint': tseslint,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...tseslint.configs.recommended.rules,
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-multiple-empty-lines': ['warn', {max: 2}],
    quotes: ['warn', 'single', {allowTemplateLiterals: true, avoidEscape: true}],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-case-declarations': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-nocheck': false,
      },
    ],
    '@typescript-eslint/no-empty-object-type': 'off',
  },
};
