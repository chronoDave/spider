import type { TestContext } from 'node:test';

import test from 'node:test';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import * as esm from './esm.ts';

test('[esm.imports]', async t => {
  const struct = async (...raw: string[]) => {
    const file = fileURLToPath(new URL(`${crypto.randomUUID()}.mjs`, import.meta.url));
    await fsp.writeFile(file, raw.join('\n'));
    const modules = await esm.imports(new Set())(file);

    await fsp.rm(file);

    return modules;
  };

  const a = await struct(
    'import type { Body, Template } from \'./document.ts\';',
    '',
    'import fsp from \'fs/promises\';',
    'import path from \'path\';',
    '',
    'import * as parse from \'./parse.ts\';',
    'import {',
    '  maybe',
    '} from \'./fn.ts\';'
  );
  t.assert.equal(a.size, 7, 'imports');
});

test('[esm.load]', async (t: TestContext) => {
  const tmp = path.join(os.tmpdir(), 'esm');
  await fsp.mkdir(tmp, { recursive: true });

  const struct = async (...raw: string[]) => {
    const name = `${crypto.randomUUID()}.mjs`;
    await fsp.writeFile(path.join(tmp, name), raw.join('\n'));

    return name;
  };

  const a = await struct('export default "a"');
  const b = await struct(`import x from "./${a}"; export default x`);

  const x = await esm.load(path.join(tmp, b));
  t.assert.equal(x.default, 'a', 'loads module');

  await fsp.writeFile(path.join(tmp, a), 'export default "b"');
  const y = await esm.load(path.join(tmp, b));

  t.assert.notEqual(x.default, y.default, 'busts cache');

  t.after(async () => {
    await fsp.rm(tmp, { recursive: true, force: true });
  });
});
