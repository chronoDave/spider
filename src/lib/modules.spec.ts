import test from 'node:test';
import { fileURLToPath } from 'url';
import path from 'path';

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

test('[modules.bust]', async t => {
  await t.assert.doesNotReject(modules.bust('./src/lib/loader.ts'), 'relative');
  await t.assert.doesNotReject(modules.bust(path.resolve('./src/lib/loader.ts')), 'absolute');
});
