import test from 'node:test';

import * as url from './url.ts';

test('[url.dirrel]', t => {
  t.assert.equal(
    url.dirrel('C:\\Users\\node')('C:\\Users\\node'),
    '/',
    'root (win32)'
  );

  t.assert.equal(
    url.dirrel('C:\\Users\\node')('C:\\Users\\node\\a\\b'),
    '/a/',
    'dir (win32)'
  );

  t.assert.equal(
    url.dirrel('src\\pages')('src\\pages\\about.md'),
    '/',
    'dir (win32 - file)'
  );

  t.assert.equal(
    url.dirrel('/Users/node')('/Users/node'),
    '/',
    'root (posix)'
  );

  t.assert.equal(
    url.dirrel('/Users/node')('/Users/node/a/b'),
    '/a/',
    'dir (posix)'
  );
});

test('[url.create]', t => {
  t.assert.equal(
    url.create('/')('about'),
    '/about/',
    'root'
  );

  t.assert.equal(
    url.create('/')('index'),
    '/',
    'index (root)'
  );

  t.assert.equal(
    url.create('/about/')('me'),
    '/about/me/',
    'dir'
  );

  t.assert.equal(
    url.create('/about/')('about'),
    '/about/',
    'dir (duplicate)'
  );

  t.assert.equal(
    url.create('/about/')('index'),
    '/about/',
    'dir (index)'
  );
});

test('[url.ext]', t => {
  t.assert.equal(url.ext('/abc')('.xml'), '/abc.xml', 'file');
  t.assert.equal(url.ext('/abc/')('.xml'), '/abc/index.xml', 'dir');
  t.assert.equal(url.ext('/abc.html')('.xml'), '/abc.xml', 'ext');
});
