import test from 'node:test';
import path from 'path';

import * as fs from './fs.ts';

test('[fs.files]', async t => {
  t.assert.deepEqual(await fs.files('package.json'), ['package.json'], 'file');
  t.assert.deepEqual(await fs.files('src'), [
    'src/spider.ts',
    'src/lib/fs.spec.ts',
    'src/lib/fs.ts',
    'src/lib/is.spec.ts',
    'src/lib/is.ts',
    'src/lib/load.spec.ts',
    'src/lib/load.ts'
  ].map(p => path.normalize(p)), 'directory');
});
