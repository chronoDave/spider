import test from 'node:test';
import path from 'path';
import fsp from 'fs/promises';

import * as load from './load.ts';

await test('[load.file] loads module from file', async t => {
  const root = path.join(process.cwd(), 'load');
  const file = path.join(root, 'single.js');

  try {
    await fsp.mkdir(root);
    await fsp.writeFile(file, 'export const url = "/a";\nexport default "<p></p>"');

    const single = await load.file<{ url: string; default: string }>(file);
    t.assert.equal(!!single.default, true, 'loads module');

    const relative = await load.file(path.normalize('/load/single.js'));
    t.assert.equal(!!relative.url, true, 'loads from relative path');

    await fsp.writeFile(file, 'export const url = "/b";\nexport default "<p></p>"');
    const cached = await load.file<{ url: string }>(file);

    t.assert.notEqual(single, cached, 'does not cache import');
  } catch (err) {
    t.assert.fail(err as Error);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }
});

await test('[load.buffer] loads module from buffer', async t => {
  try {
    const single = await load.buffer(Buffer.from('export const url = "/";\nexport default "<p></p>"'));
    t.assert.equal(!!single.url, true, 'loads module');
    
    const cached = await load.buffer(Buffer.from('export const url = "/b";\nexport default "<p></p>"'));
    t.assert.notEqual(single, cached, 'does not cache import');
  } catch (err) {
    t.assert.fail(err as Error);
  }
});
