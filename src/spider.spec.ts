import test from 'node:test';
import fsp from 'fs/promises';

import spider from './spider.ts';

test('[spider]', async t => {
  await fsp.rm('build', { recursive: true });
  const registry = await spider({
    files: ['test/**/*.ts', 'test/**/*.md'],
    root: 'test',
    dirout: 'build',
    exclude: ['**/*.spec.ts', 'test/template/**/*']
  });

  t.assert.equal(registry.size, 5);
});
