import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**/*']
  },
  ... (Array.isArray(firebaseRulesPlugin.configs['flat/recommended']) ? firebaseRulesPlugin.configs['flat/recommended'] : [firebaseRulesPlugin.configs['flat/recommended']]),
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
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
    },
  }
];
