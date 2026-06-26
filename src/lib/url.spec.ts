import test from 'node:test';

import * as url from './url.ts';

test('[url.relative]', t => {
  t.test('win32', () => {
    t.assert.equal(
      url.relative('C:\\Users\\node')('C:\\Users\\node'),
      '/',
      'root'
    );

    t.assert.equal(
      url.relative('C:\\Users\\node')('C:\\Users\\node\\a\\b.html'),
      '/a',
      'file'
    );

    t.assert.equal(
      url.relative('C:\\Users\\node')('C:\\Users\\node\\a\\b\\'),
      '/a',
      'dir'
    );
  });

  t.test('posix', () => {
    t.assert.equal(
      url.relative('/Users/node')('/Users/node'),
      '/',
      'root'
    );

    t.assert.equal(
      url.relative('/Users/node')('/Users/node/a/b.html'),
      '/a',
      'file'
    );

    t.assert.equal(
      url.relative('/Users/node')('/Users/node/a/b/'),
      '/a',
      'dir'
    );
  });
});
