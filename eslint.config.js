import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,vue}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      pluginVue.configs['flat/recommended'],
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier,
])
