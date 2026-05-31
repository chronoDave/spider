import test from 'node:test';

import * as url from './url.ts';

test('[url.relative]', t => {
  t.assert.equal(
    url.relative('C:\\Users\\node')('C:\\Users\\node'),
    '/',
    'root (win32)'
  );

  t.assert.equal(
    url.relative('C:\\Users\\node')('C:\\Users\\node\\a\\b'),
    '/a/',
    'dir (win32)'
  );

  t.assert.equal(
    url.relative('src\\pages')('src\\pages\\about.md'),
    '/',
    'dir (win32 - file)'
  );

  t.assert.equal(
    url.relative('/Users/node')('/Users/node'),
    '/',
    'root (posix)'
  );

  t.assert.equal(
    url.relative('/Users/node')('/Users/node/a/b'),
    '/a/',
    'dir (posix)'
  );
});
