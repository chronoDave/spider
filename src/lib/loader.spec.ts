import test from 'node:test';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

import * as loader from './loader.ts';
import registry from './registry.ts';

test('[loader.js]', async t => {
  const tmp = await fsp.mkdtemp(os.tmpdir());
  const [a, b] = await Promise.all([
    'export default { title: "a" }',
    'import a from "./0.js"\nexport default { title: "b", description: "c", url: "/abc", ext: ".xml", created: new Date("2020-01-01"), updated: new Date("2021-01-01"), body: () => "d", template: registry => doc => doc.body(registry) }'
  ].map(async (page, i) => {
    const file = path.join(tmp, `${i}.js`);

    await fsp.writeFile(file, page);
    return loader.js(file);
  }));

  t.test('a', () => {
    t.assert.equal(a.page.title, 'a', 'title');
    t.assert.equal(a.page.description, null, 'description');
    t.assert.equal(a.page.url, null, 'url');
    t.assert.equal(a.page.ext, null, 'ext');
    t.assert.equal(a.page.created, null, 'created');
    t.assert.equal(a.page.updated, null, 'updated');
    t.assert.equal(a.page.template, null, 'template');
    t.assert.equal(a.page.body, null, 'body');
    t.assert.equal(a.dependencies.size, 0, 'dependencies');
  });

  t.test('b', () => {
    t.assert.equal(b.page.title, 'b', 'title');
    t.assert.equal(b.page.description, 'c', 'description');
    t.assert.equal(b.page.url, '/abc', 'url');
    t.assert.equal(b.page.ext, '.xml', 'ext');
    t.assert.equal(b.page.created?.getTime(), new Date('2020-01-01').getTime(), 'created');
    t.assert.equal(b.page.updated?.getTime(), new Date('2021-01-01').getTime(), 'updated');
    t.assert.equal(typeof b.page.template, 'function', 'template');
    t.assert.equal(b.page.body?.(registry([])), 'd', 'body');
    t.assert.equal(b.dependencies.size, 1, 'dependencies');
  });

  await fsp.rm(tmp, { recursive: true });
});
