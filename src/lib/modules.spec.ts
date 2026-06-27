import type { TestContext } from 'node:test';

import test from 'node:test';
import { fileURLToPath } from 'url';
import path from 'path';
import fsp from 'fs/promises';

import * as modules from './modules.ts';

test('[modules.imports]', t => {
  t.assert.equal(modules.imports(fileURLToPath(import.meta.url))([
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
  ].join('\n')).length, 4, 'imports');
});

test('[modules.all]', async t => {
  const imports = await modules.all(fileURLToPath(import.meta.url))([
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
  ].join('\n'));

  t.assert.equal(imports.size, 7, 'imports (recursive)');
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
