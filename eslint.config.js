import next from '@next/eslint-plugin-next';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['.next/**/*', 'node_modules/**/*']
  },
  {
    ...next.configs.recommended,
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      ...next.configs.recommended.plugins,
      '@typescript-eslint': ts,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...ts.configs.recommended.rules,
    },
  }
];
