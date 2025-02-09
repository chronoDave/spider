import test from 'tape';
import path from 'path';
import fsp from 'fs/promises';

import parse from './parse';

test('[parse] parses file', async t => {
  const root = path.join(process.cwd(), 'tmp');
  const file = path.join(root, 'single.js');

  try {
    await fsp.mkdir(root);
    await fsp.writeFile(file, 'export const url = "/a";\nexport default "<p></p>"');

    const result = await parse()(file);

    t.equal(result.url, '/a', 'url');
    t.equal(result.html, '<p></p>', 'html');
  } catch (err) {
    t.fail((err as Error).message);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }

  t.end();
});

test('[parse] parses buffer', async t => {
  const result = await parse()(Buffer.from('export const url = "/";\nexport default "<p></p>"'));

  t.equal(result.url, '/', 'url');
  t.equal(result.html, '<p></p>', 'html');

  t.end();
});

test('[parse] accepts options', async t => {
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

  t.equal(result.url, '/', 'url');
  t.equal(result.html, '<p></p>', 'html');

  t.end();
});
