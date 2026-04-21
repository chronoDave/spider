import test from 'node:test';
import path from 'path';

import * as p from './path.ts';

test('[path.rel]', t => {
  t.assert.equal(
    p.rel(process.cwd())(process.cwd()),
    '/',
    'empty'
  );

  t.assert.equal(
    p.rel(process.cwd())(path.join(process.cwd(), '/a/b')),
    '/a/b',
    'dir'
  );
});
