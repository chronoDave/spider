import test from 'node:test';
import fsp from 'fs/promises';

import Spider from './spider.ts';

test('[Spider.build]', async t => {
  const spider = new Spider({
    files: ['test/**/*.ts', 'test/**/*.md'],
    root: 'test',
    dirout: 'build',
    exclude: ['**/*.spec.ts', 'test/template/**/*']
  });

  const registry = await spider.build();
  t.assert.equal(registry.nodes.length, 5);

  await fsp.rm('build', { recursive: true, force: true });
});
