import test from 'node:test';
import path from 'path';

import * as fs from './fs.ts';

test('[fs.files]', async t => {
  t.assert.rejects(fs.files('package.json'), 'file');
  t.assert.deepEqual(await fs.files('test'), [
    'test/about.ts',
    'test/blogs.ts',
    'test/index.ts',
    'test/blogs/a.md',
    'test/blogs/b.md'
  ].map(p => path.normalize(p)), 'directory');
});
