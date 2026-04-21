import test from 'node:test';

import spider from './spider.ts';

test('[spider]', async t => {
  const registry = await spider({
    files: ['test/**/*.ts', 'test/**/*.md'],
    root: 'test',
    exclude: ['**/*.spec.ts', 'test/template/**/*']
  });

  t.assert.equal(registry.size, 5);
  t.assert.equal(!!registry.get('/about'), true);
  t.assert.equal(registry.get('/about')?.created.getFullYear(), 2020);
  t.assert.equal(
    !!registry
      .get('/home')
      ?.body(registry)
      .includes('/about'),
    true
  );
});
