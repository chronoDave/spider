import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import { bundle } from './bundle';

const init = async (url: string) => {
  const tmp = path.join(process.cwd(), 'tmp');
  const meta = path.format({ dir: tmp, base: 'page.json' });
  const page = path.format({ dir: tmp, base: 'page.js' });

  await fsp.mkdir(tmp);
  await fsp.writeFile(meta, JSON.stringify({ url }));
  await fsp.writeFile(page, '');

  return {
    meta,
    page,
    cleanup: () => fsp.rm(tmp, { recursive: true, force: true })
  };
};

test('[bundle] does not return full path on error', async t => {
  await bundle(path.join(process.cwd(), '/src/lib/page.js'))
    .then(() => t.fail('expected to throw'))
    .catch((err: Error) => t.true(/^(\/|\\)src/.test(err.message), err.message));

  t.end();
});

test('[bundle] bundles index url', async t => {
  const { page, meta, cleanup } = await init('/');

  try {
    const result = await bundle(meta);
  
    t.equal(result.redirects, null, 'redirects');
    t.equal(result.in, page, 'in');
    t.equal(result.out, 'index.html', 'out');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[bundle] bundles nested url', async t => {
  const { page, meta, cleanup } = await init('/my/page');

  try {
    const result = await bundle(meta);
  
    t.equal(result.redirects, null, 'redirects');
    t.equal(result.in, page, 'in');
    t.equal(result.out, path.normalize('/my/page.html'), 'out');
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});
