import test from 'node:test';
import fsp from 'fs/promises';
import path from 'path';

import spider from './spider.ts';

await test('[spider] transforms js file into html file', async t => {
  const root = path.resolve(process.cwd(), 'spider');
  const file = path.resolve(root, 'page.js');

  try {
    await fsp.mkdir(root);
    await fsp.writeFile(file, 'export const url = "/"; export default "<h1>Home</h1>"');

    const page = await spider({ path: { outdir: 'spider' } })(file);

    t.assert.equal(page.path, path.normalize('spider/index.html'), 'path');
    t.assert.equal(page.html, '<h1>Home</h1>', 'html');
  } catch (err) {
    t.assert.fail(err as Error);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }
});
