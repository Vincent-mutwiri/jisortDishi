import next from '@next/eslint-plugin-next';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['.next/**/*', 'node_modules/**/*']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@next/next': next,
      '@typescript-eslint': ts,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...ts.configs.recommended.rules,
    },
  }
];
