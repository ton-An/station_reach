import { readFileSync } from 'fs';
import { join } from 'path';

/*
  Vendored SVGs have to be tintable.

  `react-native-svg` does not apply embedded CSS, so an icon coloured through a
  `<style>` rule or a `class` renders at whatever the path falls back to —
  black — and silently ignores the colour it is passed. Two icons shipped that
  way before this test existed.
*/

const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const ICON_MODULE = join(__dirname, 'icon.tsx');

/** The SVGs the icon module actually imports, so the list stays in sync. */
function importedIconFiles(): string[] {
  const source = readFileSync(ICON_MODULE, 'utf8');
  const matches = source.matchAll(/@\/assets\/(icons\/[\w-]+\.svg)/g);

  return [...new Set([...matches].map((match) => match[1] as string))];
}

describe('vendored icons', () => {
  const files = importedIconFiles();

  it('imports at least the transit modes and chrome glyphs', () => {
    expect(files.length).toBeGreaterThanOrEqual(14);
  });

  it.each(files)('%s is tintable', (file) => {
    const svg = readFileSync(join(PROJECT_ROOT, 'assets', file), 'utf8');
    const root = /<svg\b[^>]*>/.exec(svg)?.[0] ?? '';

    // CSS the renderer will drop on the floor.
    expect(svg).not.toMatch(/<style/);
    expect(svg).not.toMatch(/class=/);

    // Exactly one source of colour, on the root.
    expect(root).toContain('fill="currentColor"');
    expect(root.match(/fill="/g)).toHaveLength(1);
  });
});
