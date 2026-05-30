import type { TestContext } from 'node:test';

import test from 'node:test';
import fs from 'fs';
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

test('[Spider.build]', async (t: TestContext) => {
  const spider = new Spider({
    files: ['test/**/*.ts', 'test/**/*.md'],
    root: 'test',
    dirout: 'build',
    exclude: ['**/*.spec.ts', 'test/template/**/*']
  });
  const registry = await spider.build();

  t.assert.equal(registry.nodes.length, 6);
  t.assert.ok(fs.existsSync(path.join('build/index.html')), 'root');
  t.assert.ok(fs.existsSync(path.join('build/blogs/index.html')), 'nested (js)');
  t.assert.ok(fs.existsSync(path.join('build/blogs/blog-a/index.html')), 'nested (md)');
  t.assert.ok(fs.existsSync(path.join('build/about.html')), 'url (html)');
  t.assert.ok(fs.existsSync(path.join('build/blogs.xml')), 'url (rss)');

  await fsp.rm('build', { recursive: true, force: true });
});
