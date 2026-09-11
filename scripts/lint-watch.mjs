// Re-runs the project lint whenever a source file changes.
//
// The `lint: start` and `lint: done` markers delimit each run for the VS Code
// background problem matcher in `.vscode/tasks.json`. VS Code clears the stale
// diagnostics on the first marker and publishes the new ones on the second, so
// neither line may be removed without editing that matcher too.

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';

const WATCH_DIR = 'src';
const DEBOUNCE_MS = 300;
const SOURCE_FILE = /\.(?:ts|tsx|js|jsx)$/;

let debounce = null;
let running = false;
let queued = false;

function lint() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  console.log('lint: start');
  spawn('npm', ['run', 'lint'], { stdio: 'inherit' }).on('close', () => {
    running = false;
    console.log('lint: done');
    if (queued) {
      queued = false;
      lint();
    }
  });
}

watch(WATCH_DIR, { recursive: true }, (_event, filename) => {
  if (!filename || !SOURCE_FILE.test(filename)) return;
  clearTimeout(debounce);
  debounce = setTimeout(lint, DEBOUNCE_MS);
});

lint();
