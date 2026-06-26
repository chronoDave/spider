import type { TestContext } from 'node:test';

import test from 'node:test';
import fs from 'fs';
import fsp from 'fs/promises';

import Spider from './spider.ts';

test('[Spider.load]', async t => {
  const spider = new Spider({
    entryPoints: ['test/**/*.ts'],
    exclude: ['**/*.spec.ts', 'test/template/**/*'],
    root: 'test',
    outdir: 'build'
  });

  await spider.load('test/blogs.ts');
  await t.assert.doesNotReject(spider.load('test/blogs.feed.ts'));
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

  t.assert.ok(fs.readFileSync('build/index.html', 'utf-8').includes('About'));

  await fsp.rm('build', { recursive: true, force: true });
});

test('[Spider.load]', async t => {
  const spider = new Spider({
    entryPoints: ['test/**/*.ts', 'test/**/*.md'],
    exclude: ['**/*.spec.ts', 'test/template/**/*'],
    root: 'test',
    outdir: 'build'
  });
  const cancel = await spider.watch();

  await t.test('direct', async () => {
    const original = await fsp.readFile('test/blogs/a.md', 'utf-8');
    const a = await fsp.readFile('build/blogs/blog-a/index.html', 'utf-8');

    try {
      await fsp.writeFile('test/blogs/a.md', `${original}\n`);
      await new Promise(resolve => setTimeout(resolve, 100));
      const b = await fsp.readFile('build/blogs/blog-a/index.html', 'utf-8');

      t.assert.notEqual(a.length, b.length);
    } catch (err) {
      await fsp.writeFile('test/blogs/a.md', original);

      throw err;
    }

    await fsp.writeFile('test/blogs/a.md', original);
  });

  await t.test('dependency', async () => {
    const original = await fsp.readFile('test/template/root.ts', 'utf-8');
    const a = await fsp.readFile('build/index.html', 'utf-8');

    try {
      await fsp.writeFile('test/template/root.ts', original.replace(/return.+;/, 'return "";'));
      await new Promise(resolve => setTimeout(resolve, 100));
      const b = await fsp.readFile('build/index.html', 'utf-8');

      t.assert.notEqual(a.length, b.length);
    } catch (err) {
      await fsp.writeFile('test/template/root.ts', original);

      throw err;
    }

    await fsp.writeFile('test/template/root.ts', original);
  });

  cancel();

  await fsp.rm('build', { recursive: true, force: true });
});
