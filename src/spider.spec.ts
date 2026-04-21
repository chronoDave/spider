import test from 'node:test';

import spider from './spider.ts';

test('[spider]', async t => {
  const registry = await spider({
    files: ['test/**/*.ts', 'test/**/*.md'],
    root: 'test',
    exclude: ['**/*.spec.ts']
  });

  t.assert.equal(registry.size, 5);
  t.assert.equal(!!registry.get('/about'), true);
});
