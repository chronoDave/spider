import test from 'node:test';

import * as url from './url.ts';

test('[url.relative]', t => {
  t.test('win32', () => {
    t.assert.equal(
      url.relative('C:\\Users\\node')('C:\\Users\\node'),
      '.',
      'root'
    );

    t.assert.equal(
      url.relative('C:\\Users\\node')('C:\\Users\\node\\a\\b.html'),
      'a',
      'file'
    );

    t.assert.equal(
      url.relative('C:\\Users\\node')('C:\\Users\\node\\a\\b\\'),
      'a',
      'dir'
    );
  });

  t.test('posix', () => {
    t.assert.equal(
      url.relative('/Users/node')('/Users/node'),
      '.',
      'root'
    );

    t.assert.equal(
      url.relative('/Users/node')('/Users/node/a/b.html'),
      'a',
      'file'
    );

    t.assert.equal(
      url.relative('/Users/node')('/Users/node/a/b/'),
      'a',
      'dir'
    );
  });
});

// test('[url.create]', t => {
//   t.assert.equal(
//     url.create('/')('about'),
//     '/about/',
//     'root'
//   );

//   t.assert.equal(
//     url.create('/')('index'),
//     '/',
//     'index (root)'
//   );

//   t.assert.equal(
//     url.create('/about/')('me'),
//     '/about/me/',
//     'dir'
//   );

//   t.assert.equal(
//     url.create('/about/')('about'),
//     '/about/',
//     'dir (duplicate)'
//   );

//   t.assert.equal(
//     url.create('/about/')('index'),
//     '/about/',
//     'dir (index)'
//   );
// });

// test('[url.ext]', t => {
//   t.assert.equal(url.ext('/abc')('.xml'), '/abc.xml', 'file');
//   t.assert.equal(url.ext('/abc/')('.xml'), '/abc/index.xml', 'dir');
//   t.assert.equal(url.ext('/abc.html')('.xml'), '/abc.xml', 'ext');
// });
