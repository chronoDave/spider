import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import load from './load';

test('[load] throws normal error on invalid file', async t => {
  const file = path.resolve(process.cwd(), 'tmp/index.js');

  await fsp.mkdir(path.parse(file).dir, { recursive: true });
  await fsp.writeFile(file, 'e');

  try {
    await load(file);
    t.fail('expected to throw');
  } catch (err) {
    t.false((err as Error).stack?.includes('data:text/javascript;base64,'), (err as Error)?.stack);
  }

  await fsp.rm(path.parse(file).dir, { recursive: true, force: true });
  t.end();
});

test('[load] throws minified error on invalid buffer', async t => {
  try {
    await load(Buffer.from('e'));
    t.fail('expected to throw');
  } catch (err) {
    t.false((err as Error).stack?.includes('data:text/javascript;base64,'), (err as Error)?.stack);
  }

  t.end();
});

test('[load] throws normal error on invalid buffer if showBufferError enabled', async t => {
  try {
    await load(Buffer.from('e'), { showBufferError: true });
    t.fail('expected to throw');
  } catch (err) {
    t.true((err as Error).stack?.includes('data:text/javascript;base64,'), (err as Error)?.stack);
  }

  t.end();
});
