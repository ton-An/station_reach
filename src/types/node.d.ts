/**
 * Node globals, for the tests that read vendored assets off disk.
 *
 * Referenced rather than added to `compilerOptions.types`, which would stop
 * TypeScript auto-including the rest of the project's ambient types.
 */
/// <reference types="node" />
