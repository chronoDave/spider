import test from 'node:test';
import { fileURLToPath } from 'url';

import modules, { imports } from './modules.ts';

test('[module.imports]', t => {
  t.assert.equal(imports(fileURLToPath(import.meta.url))([
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

test('[module]', async t => {
  const imports = await modules(fileURLToPath(import.meta.url))([
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
