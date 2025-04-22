import test from 'node:test';
import path from 'path';
import fsp from 'fs/promises';

import parse from './parse.ts';

await test('[parse] parses file', async t => {
  const root = path.join(process.cwd(), 'parse');
  const file = path.join(root, 'single.js');

  try {
    await fsp.mkdir(root);
    await fsp.writeFile(file, 'export const url = "/a";\nexport default "<p></p>"');

    const result = await parse()(file);

    t.assert.equal(result.url, '/a', 'url');
    t.assert.equal(result.html, '<p></p>', 'html');
  } catch (err) {
    t.assert.fail(err as Error);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }
});

await test('[parse] parses buffer', async t => {
  const result = await parse()(Buffer.from('export const url = "/";\nexport default "<p></p>"'));

  t.assert.equal(result.url, '/', 'url');
  t.assert.equal(result.html, '<p></p>', 'html');
});

await test('[parse] accepts options', async t => {
  const result = await parse({
    url: raw => {
      if (typeof raw.meta !== 'object' || raw.meta === null) throw new Error('Invalid export "meta"');
      if (typeof (raw.meta as Record<string, unknown>).url !== 'string') throw new Error('Invalid export "meta.url"');

      return (raw.meta as { url: string }).url;
    },
    html: raw => {
      if (typeof raw.b !== 'string') throw new Error('Invalid export "b"');
      return raw.b;
    }
  })(Buffer.from('export const meta = { url: "/" };\nexport const b = "<p></p>"'));

  t.assert.equal(result.url, '/', 'url');
  t.assert.equal(result.html, '<p></p>', 'html');
});
