import test from 'node:test';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

import * as loader from './loader.ts';
import Registry from './registry.ts';

test('[loader.js]', async t => {
  const tmp = await fsp.mkdtemp(os.tmpdir());
  const [a, b] = await Promise.all([
    'export default { title: "a", body: () => "b" }',
    'export default { title: "b", description: "c", url: "/abc", ext: ".xml", created: new Date("2020-01-01"), updated: new Date("2021-01-01"), body: () => "d", template: registry => doc => doc.body(registry) }'
  ].map(async (page, i) => {
    const file = path.join(tmp, `${i}.js`);

    await fsp.writeFile(file, page);
    return loader.js(file);
  }));

  t.assert.equal(a.title, 'a', 'title (a)');
  t.assert.equal(a.description, null, 'description (a)');
  t.assert.equal(a.url, null, 'url (a)');
  t.assert.equal(a.ext, null, 'ext (a)');
  t.assert.equal(a.created.getTime(), new Date().setUTCHours(0, 0, 0, 0), 'created (a)');
  t.assert.equal(a.updated, null, 'updated (a)');
  t.assert.equal(a.template, null, 'template (a)');
  t.assert.equal(a.body(new Registry([])), 'b', 'body (a)');

  t.assert.equal(b.title, 'b', 'title (b)');
  t.assert.equal(b.description, 'c', 'description (b)');
  t.assert.equal(b.url, '/abc', 'url (b)');
  t.assert.equal(b.ext, '.xml', 'ext (b)');
  t.assert.equal(b.created.getTime(), new Date('2020-01-01').getTime(), 'created (b)');
  t.assert.equal(b.updated?.getTime(), new Date('2021-01-01').getTime(), 'updated (b)');
  t.assert.equal(typeof b.template, 'function', 'template (b)');
  t.assert.equal(b.body(new Registry([])), 'd', 'body (b)');

  await fsp.rm(tmp, { recursive: true });
});

test('[loader.md]', async t => {
  const tmp = await fsp.mkdtemp(os.tmpdir());
  const [a, b] = await Promise.all([
    '---\ntitle:a\n---b',
    '---\ntitle:b\ndescription:c\nurl:/abc\next:.xml\ncreated:2020-01-01\nupdated:2021-01-01\n---c'
  ].map(async (page, i) => {
    const file = path.join(tmp, `${i}.md`);

    await fsp.writeFile(file, page);
    return loader.md(file);
  }));

  t.assert.equal(a.title, 'a', 'title (a)');
  t.assert.equal(a.description, null, 'description (a)');
  t.assert.equal(a.url, null, 'url (a)');
  t.assert.equal(a.ext, null, 'ext (a)');
  t.assert.equal(a.created.getTime(), new Date().setUTCHours(0, 0, 0, 0), 'created (a)');
  t.assert.equal(a.updated, null, 'updated (a)');
  t.assert.equal(a.template, null, 'template (a)');
  t.assert.equal(a.body(new Registry([])), 'b', 'body (a)');

  t.assert.equal(b.title, 'b', 'title (b)');
  t.assert.equal(b.description, 'c', 'description (b)');
  t.assert.equal(b.url, '/abc', 'url (b)');
  t.assert.equal(b.ext, '.xml', 'ext (b)');
  t.assert.equal(b.created.getTime(), new Date('2020-01-01').getTime(), 'created (b)');
  t.assert.equal(b.updated?.getTime(), new Date('2021-01-01').getTime(), 'updated (b)');
  t.assert.equal(b.template, null, 'template (b)');
  t.assert.equal(b.body(new Registry([])), 'c', 'body (b)');

  await fsp.rm(tmp, { recursive: true });
});
