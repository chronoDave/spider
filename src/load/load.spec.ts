import test from 'tape';
import path from 'path';
import fsp from 'fs/promises';

import load from './load';

test('[load] loads from file', async t => {
  const root = path.join(process.cwd(), 'tmp');
  const page = {
    single: {
      file: path.join(root, 'single.js'),
      content: 'export const url = "/";\nexport default "<p></p>"'
    },
    multiple: {
      file: path.join(root, 'multiple.js'),
      content: 'export default [{ url: "/blog/1", html: "<h1>1</h1>" }, { url: "/blog/2", html: "<h1>2</h1>" }]'
    },
    import: {
      file: path.join(root, 'import.js'),
      content: 'import fsp from "fs/promises"; import path from "path"; const html = await fsp.readFile(path.join(import.meta.dirname, "single.js"), "utf-8"); export default [{ url: "/", html }];'
    }
  };

  try {
    await fsp.mkdir(root);
    await Promise.all(Object.values(page)
      .map(async ({ file, content }) => fsp.writeFile(file, content)));

    const single = await load(page.single.file);
    t.equal(single.length, 1, 'loads single page from file');
    t.equal(single[0].html, '<p></p>', 'loads html');

    const multiple = await load(page.multiple.file);
    t.equal(multiple.length, 2, 'loads multiple pages from file');

    const relative = await load('tmp/single.js');
    t.equal(relative.length, 1, 'resolves relative url');

    const imported = await load(page.import.file);
    t.equal(imported[0].html, 'export const url = "/";\nexport default "<p></p>"', 'resolves import');

    await fsp.writeFile(page.single.file, page.multiple.content);

    const cached = await load(page.single.file);
    t.equal(cached.length, 2, 'does not cache module');
  } catch (err) {
    t.fail((err as Error).message);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }
  
  t.end();
});

test('[load] loads from buffer', async t => {
  const single = await load(Buffer.from('export const url = "/";\nexport default "<p></p>"'));
  t.equal(single.length, 1, 'loads single page from buffer');
  
  const multiple = await load(Buffer.from('export default [{ url: "/blog/1", html: "<h1>1</h1>" }, { url: "/blog/2", html: "<h1>2</h1>" }]'));
  t.equal(multiple.length, 2, 'loads multiple pages from buffer');

  const async = await load(Buffer.from('const sleep = n => new Promise(resolve => setTimeout(resolve, n)); export default await new Promise(async resolve => { await sleep(1); return resolve([{ url: "/", html: "" }]); });'));
  t.equal(async.length, 1, 'loads async pages');

  t.end();
});
