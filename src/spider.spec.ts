import test from 'node:test';
import fsp from 'fs/promises';
import path from 'path';

import Spider from './spider.ts';

test('[Spider.load]', async t => {
  const spider = new Spider({
    files: ['test/**/*.ts'],
    root: 'test',
    dirout: 'build',
    exclude: ['**/*.spec.ts', 'test/template/**/*']
  });

  await spider.load(path.resolve('test/blogs.ts'));
  await t.assert.doesNotReject(spider.load(path.resolve('test/blogs.feed.ts')));
});

test('[Spider.build]', async t => {
  const spider = new Spider({
    files: ['test/**/*.ts', 'test/**/*.md'],
    root: 'test',
    dirout: 'build',
    exclude: ['**/*.spec.ts', 'test/template/**/*']
  });

  const registry = await spider.build();
  t.assert.equal(registry.nodes.length, 6);

  await fsp.rm('build', { recursive: true, force: true });
});
