// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unusedImports = require('eslint-plugin-unused-imports');
const catchMustRethrow = require('./eslint-rules/catch-must-rethrow');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: {
      local: {
        rules: {
          'catch-must-rethrow': catchMustRethrow,
        },
      },
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'local/catch-must-rethrow': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
]);
