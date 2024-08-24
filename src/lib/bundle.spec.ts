import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import { bundle } from './bundle';

const init = async () => {
  const tmp = path.join(process.cwd(), 'tmp');

  const invalid = {
    html: path.join(tmp, 'html.js'),
    url: path.join(tmp, 'url.js'),
    redirects: path.join(tmp, 'redirects.js')
  } as const;
  const valid = path.join(tmp, 'valid.js');

  await fsp.mkdir(tmp);
  await Promise.all([
    fsp.writeFile(invalid.url, 'export default { html: "", url: "", redirects: [] }'),
    fsp.writeFile(invalid.html, 'export default { html: 1, url: "/", redirects: [] }'),
    fsp.writeFile(invalid.redirects, 'export default { html: "", url: "/", redirects: [1] }'),
    fsp.writeFile(valid, 'export default { html: "<!doctype html><html lang=`en`><title>.</title></html>", url: "/", redirects: [] }')
  ]);

  return {
    valid,
    invalid,
    cleanup: () => fsp.rm(tmp, { recursive: true, force: true })
  };
};

test('[bundle] throws on invalid page', async t => {
  const { invalid, cleanup } = await init();

  await bundle(invalid.url)
    .then(() => t.fail('expected to throw `url`'))
    .catch(err => t.pass(err));

  await bundle(invalid.html)
    .then(() => t.fail('expected to throw `html`'))
    .catch(err => t.pass(err));

  await bundle(invalid.redirects)
    .then(() => t.fail('expected to throw `redirects`'))
    .catch(err => t.pass(err));

  await cleanup();
  t.end();
});

test('[bundle] passes on valid page', async t => {
  const { valid, cleanup } = await init();

  try {
    const result = await bundle(valid);

    t.deepEqual(result.redirects, [], 'redirects');
    t.equal(result.path, 'index.html', 'path');
    t.equal(result.html, '<!doctype html><html lang=`en`><title>.</title></html>', 'html');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});
