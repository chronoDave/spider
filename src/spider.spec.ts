import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import spider from './spider';

test('[spider] transforms js file into html file', async t => {
  const root = path.resolve(process.cwd(), 'tmp');
  const file = path.resolve(root, 'page.js');

  try {
    await fsp.mkdir(root);
    await fsp.writeFile(file, 'export const url = "/"; export default "<h1>Home</h1>"');

    const page = await spider({ outdir: 'tmp' })(file);

    t.equal(page.path, path.normalize('tmp/index.html'), 'path');
    t.equal(page.html, '<h1>Home</h1>', 'html');
  } catch (err) {
    t.fail((err as Error).message);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }

  t.end();
});
