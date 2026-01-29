import eslintPluginPrettierRecommended
  from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// @ts-check
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // turn off all 'error' rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // basic rules
      'no-empty-function': 'off',
      'no-useless-constructor': 'off',
      'class-methods-use-this': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // prettier rules
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'object-shorthand': 'off',

      // Optional: if you want to be stricter in some places, set 'error'
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
);