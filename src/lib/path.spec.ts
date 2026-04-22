import test from 'node:test';
import path from 'path';

import * as p from './path.ts';

test('[path.rel]', t => {
  t.assert.equal(
    p.rel(process.cwd())(process.cwd()),
    '/',
    'root'
  );

  t.assert.equal(
    p.rel(process.cwd())(path.join(process.cwd(), '/a/b')),
    '/a/b',
    'dir'
  );
});

test('[path.url]', t => {
  t.assert.equal(
    p.url('/')('/')('foo'),
    '/foo',
    'root'
  );

  t.assert.equal(
    p.url('/abc')('/abc/def/a.js')('foo'),
    '/def/foo',
    'dir'
  );
});
