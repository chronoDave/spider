import test from 'tape';
import fsp from 'fs/promises';
import path from 'path';

import * as json from './json';

const init = async () => {
  const tmp = path.join(process.cwd(), 'tmp');
  const invalid = path.join(tmp, 'invalid.json');
  const valid = path.join(tmp, 'valid.json');

  await fsp.mkdir(tmp);
  await Promise.all([
    fsp.writeFile(invalid, ''),
    fsp.writeFile(valid, JSON.stringify([]))
  ]);

  return {
    valid,
    invalid,
    cleanup: () => fsp.rm(tmp, { recursive: true, force: true })
  };
};

test('[json.read] resolves on valid json', async t => {
  const { valid, cleanup } = await init();

  await json.read(valid)
    .then(raw => t.true(Array.isArray(raw), 'read valid json'))
    .catch(err => t.fail(err));

  await cleanup();
  t.end();
});

test('[json.read] rejects on invalid json', async t => {
  const { invalid, cleanup } = await init();

  await json.read(invalid)
    .then(() => t.fail('expected to throw'))
    .catch(() => t.pass('throws'));

  await cleanup();
  t.end();
});
