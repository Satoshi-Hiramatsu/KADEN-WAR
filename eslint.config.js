import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.wrangler/**', '**/worker-configuration.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parserOptions: { project: ['./tsconfig.json', './apps/api/tsconfig.json'] } },
    rules: { '@typescript-eslint/no-floating-promises': 'error' },
  },
);
