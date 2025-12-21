import nextTypescript from 'eslint-config-next/typescript';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import love from 'eslint-config-love';
import react from 'eslint-plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

const exports = [
  ...nextTypescript,
  {
    ignores: [
      '**/node_modules',
      '**/.next',
      '**/build',
      'pages/api',
      '**/next-env.d.ts',
      '**/yarn.lock',
      '**/public',
      '**/package-lock.json',
      '**/init-service-worker.ts',
      '**/.vercel/',
      '.unlighthouse/',
      'tmp_part/*',
      '**/react-smooth-dnd/**'
    ]
  },
  ...compat.extends('plugin:react/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:next-recommended/recommended'),
  ...compat.extends('prettier'),
  ...nextCoreWebVitals,
  {
    languageOptions: {
      globals: {
        ...globals.browser
      },

      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    rules: {
      'next-recommended/async-component-no-hooks': 'off'
    }
  },
  {
    files: ['**/.eslintrc.{js,cjs}', '**/*.js', '**/*.ts', '**/*.tsx'],
    plugins: {
      react,
      love
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 5,
      sourceType: 'commonjs'
    }
  }
];

export default exports;
