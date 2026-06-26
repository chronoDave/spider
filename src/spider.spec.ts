import type { TestContext } from 'node:test';

import test from 'node:test';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import Spider from './spider.ts';

test('[Spider.load]', async t => {
  const spider = new Spider({
    entryPoints: ['test/**/*.ts'],
    exclude: ['**/*.spec.ts', 'test/template/**/*'],
    root: 'test',
    outdir: 'build'
  });

  await spider.load(path.resolve('test/blogs.ts'));
  await t.assert.doesNotReject(spider.load(path.resolve('test/blogs.feed.ts')));
});

test('[Spider.build]', async (t: TestContext) => {
  const spider = new Spider({
    entryPoints: ['test/**/*.ts', 'test/**/*.md'],
    exclude: ['**/*.spec.ts', 'test/template/**/*'],
    root: 'test',
    outdir: 'build'
  });
  const result = await spider.build();

  t.assert.equal(result.size, 7, 'finds all files');
  t.assert.ok(Object.keys(result).every(url => url.startsWith('/')), 'all paths are root relative');

  t.assert.ok(fs.existsSync('build/index.html'), 'root');
  t.assert.ok(fs.existsSync('build/blogs/index.html'), 'nested (js)');
  t.assert.ok(fs.existsSync('build/blogs.xml'), 'url (xml)');
  t.assert.ok(fs.existsSync('build/blogs/blog-a/index.html'), 'nested (md)');
  t.assert.ok(fs.existsSync('build/about.html'), 'url (html)');
  t.assert.ok(fs.existsSync('build/about.xml'), 'url (xml)');

  await fsp.rm('build', { recursive: true, force: true });
});
