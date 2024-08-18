import test from 'tape';
import fs from 'fs';

import write from './write';
import init from './write.struct';

test('[write] writes html', async t => {
  const { ROOT, FILE, cleanup } = await init();

  const file = await write({ file: FILE, dirout: ROOT });

  t.true(
    fs.existsSync(file.path),
    'writes html file'
  );

  t.true(
    fs.readFileSync(file.path, 'utf-8').length > 0,
    'writes html output into file'
  );

  await cleanup();
  t.end();
});

test('[write] accepts relative path', async t => {
  const { cleanup } = await init();

  const file = await write({ file: 'test/assets/page.valid.js', dirout: 'tmp' });

  t.true(
    fs.existsSync(file.path),
    'writes html file'
  );

  t.true(
    fs.readFileSync(file.path, 'utf-8').length > 0,
    'writes html output into file'
  );

  await cleanup();
  t.end();
});
