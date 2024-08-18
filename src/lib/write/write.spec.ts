import test from 'tape';
import fs from 'fs';

import write from './write';
import init from './write.struct';

test('[write] writes html', async t => {
  const { ROOT, FILE, cleanup } = await init();

  const { file } = await write(FILE, ROOT);

  t.true(
    fs.existsSync(file),
    'writes html file'
  );

  t.true(
    fs.readFileSync(file, 'utf-8').length > 0,
    'writes html output into file'
  );

  await cleanup();
  t.end();
});
