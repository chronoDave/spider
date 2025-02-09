import test from 'tape';
import path from 'path';
import fsp from 'fs/promises';

import * as load from './load';

test('[load.file] loads module from file', async t => {
  const root = path.join(process.cwd(), 'tmp');
  const file = path.join(root, 'single.js');

  try {
    await fsp.mkdir(root);
    await fsp.writeFile(file, 'export const url = "/a";\nexport default "<p></p>"');

    const single = await load.file<{ url: string; default: string }>(file);
    t.true(single.default, 'loads module');

    const relative = await load.file(path.normalize('/tmp/single.js'));
    t.true(relative.url, 'loads from relative path');

    await fsp.writeFile(file, 'export const url = "/b";\nexport default "<p></p>"');
    const cached = await load.file<{ url: string }>(file);

    t.notEqual(single, cached, 'does not cache import');
  } catch (err) {
    t.fail((err as Error).message);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }

  t.end();
});

test('[load.buffer] loads module from buffer', async t => {
  try {
    const single = await load.buffer(Buffer.from('export const url = "/";\nexport default "<p></p>"'));
    t.true(single.url, 'loads module');
    
    const cached = await load.buffer(Buffer.from('export const url = "/b";\nexport default "<p></p>"'));
    t.notEqual(single, cached, 'does not cache import');
  } catch (err) {
    t.fail((err as Error).message);
  }

  t.end();
});
