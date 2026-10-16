import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'vendor', 'tmp', 'log']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.browser,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // React 19 ignores propTypes.
      'react/prop-types': 'off',
      // All user-facing text comes from translations/en.json via i18next.
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true, allowedStrings: [' '] },
      ],
    },
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/test/**'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
])
