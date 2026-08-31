// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const catchMustRethrow = require('./eslint-rules/catch-must-rethrow');

module.exports = defineConfig([
  expoConfig,
  // Formatting is Prettier's job; keep ESLint to correctness.
  prettierConfig,
  {
    plugins: {
      local: {
        rules: {
          'catch-must-rethrow': catchMustRethrow,
        },
      },
    },
    rules: {
      'local/catch-must-rethrow': 'error',
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
]);
