import type { Draft } from './loader.ts';

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

test('[url.create]', t => {
  const draft = (options: { title: string; url?: string; ext?: string }): Draft => ({
    title: options.title,
    url: options.url ?? null,
    ext: options.ext ?? null,
    description: null,
    created: null,
    updated: null,
    body: () => '',
    template: () => () => ''
  });

  t.assert.equal(
    url.create('/')(draft({ title: 'about' })),
    '/about/index.html',
    'root'
  );

  t.assert.equal(
    url.create('/')(draft({ title: 'index' })),
    '/index.html',
    'index (root)'
  );

  t.assert.equal(
    url.create('/about')(draft({ title: 'me' })),
    '/about/me/index.html',
    'dir'
  );

  t.assert.equal(
    url.create('/about')(draft({ title: 'about' })),
    '/about/index.html',
    'dir (duplicate)'
  );

  t.assert.equal(
    url.create('/about')(draft({ title: 'index' })),
    '/about/index.html',
    'dir (index)'
  );
});
