import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import spider from './spider';

test('[spider] loads string html', async t => {
  const root = path.resolve(process.cwd(), 'tmp');
  const file = {
    single: {
      path: path.resolve(root, 'single.js'),
      content: 'export const url = "/"; export default "<h1>Home</h1>"'
    },
    multiple: {
      path: path.resolve(root, 'multiple.js'),
      content: 'export default [{ url: "/about", html: "" }, { url: "/blog/post", html: "" }]'
    }
  };

  try {
    await fsp.mkdir(root);
    await Promise.all(Object.values(file).map(async x => fsp.writeFile(x.path, x.content)));

    const single = await spider({ outdir: 'tmp' })('tmp/single.js');

    t.equal(single.length, 1, 'bundles file');
    t.equal(single[0].file, path.normalize('tmp/index.html'), 'has path');
    t.equal(single[0].html, '<h1>Home</h1>', 'has html');

    const multiple = await spider({ outdir: 'tmp', write: true })('tmp/multiple.js');

    t.equal(multiple.length, 2, 'bundles files');
    t.true(await fsp.stat(path.join(process.cwd(), multiple[0].file)), 'writes file');
  } catch (err) {
    t.fail((err as Error).message);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }

  t.end();
});
