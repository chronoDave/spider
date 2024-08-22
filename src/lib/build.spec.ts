import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import { build } from './build';

const init = async () => {
  const dir = path.join(process.cwd(), 'tmp');

  const meta = path.format({ dir, base: 'home.json' });
  const page = path.format({ dir, base: 'home.js' });

  await fsp.mkdir(dir);
  await fsp.writeFile(meta, JSON.stringify({ url: '/' }));
  await fsp.writeFile(page, 'export default (() => `<!doctype html><html lang="en"><title>.</title></html>`)()');

  return {
    meta,
    cleanup: () => fsp.rm(dir, { recursive: true, force: true })
  };
};

test('[build] generates html', async t => {
  const { meta, cleanup } = await init();

  try {
    const result = await build(meta);
    t.equal(
      result.html,
      '<!doctype html><html lang="en"><title>.</title></html>',
      'generates html'
    );
  
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});

test('[build] transforms source file', async t => {
  const { meta, cleanup } = await init();

  try {
    const result = await build(meta, {
      loader: {
        type: 'js',
        transform: () => 'export default (() => `<div></div>`)()'
      }
    });
  
    t.equal(
      result.html,
      '<div></div>',
      'generates html'
    );
  
  } catch (err) {
    t.fail((err as Error).message);
  }

  await cleanup();
  t.end();
});
