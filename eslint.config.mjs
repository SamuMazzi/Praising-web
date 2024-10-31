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
      '.unlighthouse/'
    ]
  },
  ...compat.extends(
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:@next/next/recommended',
    'prettier',
    'next/core-web-vitals'
  ),
  {
    languageOptions: {
      globals: {
        ...globals.browser
      },

      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    rules: {}
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
