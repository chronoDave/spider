import type { TestContext } from 'node:test';

import test from 'node:test';
import path from 'path';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';

import * as modules from './modules.ts';

test('[modules.imports]', async t => {
  const struct = async (...raw: string[]) => {
    const file = fileURLToPath(new URL(`${crypto.randomUUID()}.mjs`, import.meta.url));
    await fsp.writeFile(file, raw.join('\n'));
    const results = await modules.imports(file, new Set());
    await fsp.rm(file);
    return results;
  };

  const a = await struct(
    'import type { Body, Template } from \'./document.ts\';',
    '',
    'import fsp from \'fs/promises\';',
    'import path from \'path\';',
    '',
    'import * as date from \'./date.ts\';',
    'import * as parse from \'./parse.ts\';',
    'import {',
    '  maybe',
    '} from \'./fn.ts\';'
  );
  t.assert.equal(a.size, 9, 'imports');
});

test('[modules.bust]', async (t: TestContext) => {
  const file = './src/lib/loader.ts';
  const raw = await fsp.readFile(file, 'utf-8');

  t.assert.doesNotThrow(() => modules.bust(file)(raw), 'relative');
  t.assert.doesNotThrow(() => modules.bust(path.resolve(file))(raw), 'absolute');

  const busted = Array.from(modules.bust(file)(raw).matchAll(/import\s+[^'"]+.([^'"]+)['"].*/g))
    .map(match => match[1])
    .filter(match => match.includes('/src/'));

  t.assert.ok(busted.every(match => match.includes('.ts?')), 'busts cache');
});
