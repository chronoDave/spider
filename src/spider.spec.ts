import test from 'node:test';
import fs from 'fs';
import fsp from 'fs/promises';

import Spider from './spider.ts';

test('[Spider]', async t => {
  await t.test('build', async tt => {
    await fsp.rm('build', { recursive: true, force: true });
    const spider = new Spider({
      files: ['test/**/*.ts', 'test/**/*.md'],
      root: 'test',
      dirout: 'build',
      exclude: ['**/*.spec.ts', 'test/template/**/*']
    });

    const registry = await spider.build();

    tt.assert.equal(registry.size, 5);
  });

  await t.test('watch', async tt => {
    await fsp.rm('build', { recursive: true, force: true });
    const spider = new Spider({
      files: ['test/**/*.ts', 'test/**/*.md'],
      root: 'test',
      dirout: 'build',
      exclude: ['**/*.spec.ts', 'test/template/**/*']
    });

    const abort = await spider.watch();
    const raw = await fsp.readFile('test/index.ts', 'utf-8');
    await fsp.writeFile('test/watch.ts', raw.replace('\'/\'', '\'/watch\''));
    await new Promise(resolve => setTimeout(resolve, 100));
    abort();
    await fsp.rm('test/watch.ts');

    tt.assert.equal(fs.existsSync('build/watch.html'), true);
  });
});

