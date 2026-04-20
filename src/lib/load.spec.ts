import test from 'node:test';
import path from 'path';
import fsp from 'fs/promises';
import os from 'os';

import * as load from './load.ts';

test('[load.js]', async t => {
  const tmp = await fsp.mkdtemp(os.tmpdir());

  await fsp.writeFile(path.join(tmp, 'a.js'), 'export default { title: "abc", body: "abc" }');
  const a = await load.js(path.join(tmp, 'a.js'));

  t.assert.equal(a.title, 'abc', 'title');
  t.assert.equal(a.body, 'abc', 'body');
  t.assert.equal(a.url, path.posix.join(tmp, '/abc/'), 'url');
  t.assert.equal(a.description, null, 'description');
  t.assert.equal(a.created.getTime(), new Date().setUTCHours(0, 0, 0, 0), 'created');
  t.assert.equal(a.updated, null, 'updated');

  await fsp.writeFile(path.join(tmp, 'b.js'), 'export default { title: "abc", description: "abc", created: "2020-01-01", updated: "2021-01-01", body: "abc" }');
  const b = await load.js(path.join(tmp, 'b.js'));

  t.assert.equal(b.description, 'abc', 'description');
  t.assert.equal(b.created.getTime(), new Date('2020-01-01').getTime(), 'created');
  t.assert.equal(b.updated?.getTime(), new Date('2021-01-01').getTime(), 'updated');

  await fsp.writeFile(path.join(tmp, 'c.js'), 'export default { title: "abc", body: "abc" }');
  await fsp.utimes(path.join(tmp, 'c.js'), 0, 0);
  const c = await load.js(path.join(tmp, 'c.js'));

  t.assert.equal(c.created.getTime(), new Date().setUTCHours(0, 0, 0, 0), 'created (utime)');
  t.assert.equal(c.updated?.getTime(), new Date(0).getTime(), 'updated (utime)');

  await fsp.rm(tmp, { recursive: true });
});

test('[load.md]', async t => {
  const tmp = await fsp.mkdtemp(os.tmpdir());

  await fsp.writeFile(path.join(tmp, 'a.md'), '---\ntitle:abc\n---abc');
  const a = await load.md(path.join(tmp, 'a.md'));

  t.assert.equal(a.title, 'abc', 'title');
  t.assert.equal(a.body, 'abc', 'body');
  t.assert.equal(a.url, path.posix.join(tmp, '/abc/'), 'url');
  t.assert.equal(a.description, null, 'description');
  t.assert.equal(a.created.getTime(), new Date().setUTCHours(0, 0, 0, 0), 'created');
  t.assert.equal(a.updated, null, 'updated');

  await fsp.writeFile(path.join(tmp, 'b.md'), '---\ntitle:abc\ndescription:abc\ncreated:2020-01-01\nupdated:2021-01-01\n---abc');
  const b = await load.md(path.join(tmp, 'b.md'));

  t.assert.equal(b.description, 'abc', 'description');
  t.assert.equal(b.created.getTime(), new Date('2020-01-01').getTime(), 'created');
  t.assert.equal(b.updated?.getTime(), new Date('2021-01-01').getTime(), 'updated');

  await fsp.writeFile(path.join(tmp, 'c.md'), '---\ntitle:abc\n---abc');
  await fsp.utimes(path.join(tmp, 'c.md'), 0, 0);
  const c = await load.md(path.join(tmp, 'c.md'));

  t.assert.equal(c.created.getTime(), new Date().setUTCHours(0, 0, 0, 0), 'created (utime)');
  t.assert.equal(c.updated?.getTime(), new Date(0).getTime(), 'updated (utime)');

  await fsp.rm(tmp, { recursive: true });
});
