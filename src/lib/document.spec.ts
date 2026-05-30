import test from 'node:test';

import * as document from './document.ts';
import Registry from './registry.ts';

test('[document.url]', t => {
  t.assert.equal(
    document.url('/')('about'),
    '/about/',
    'root'
  );

  t.assert.equal(
    document.url('/')('index'),
    '/',
    'index (root)'
  );

  t.assert.equal(
    document.url('/about/')('me'),
    '/about/me/',
    'dir'
  );

  t.assert.equal(
    document.url('/about/')('about'),
    '/about/',
    'dir (duplicate)'
  );

  t.assert.equal(
    document.url('/about/')('index'),
    '/about/',
    'dir (index)'
  );
});

test('[document.file]', t => {
  t.assert.equal(
    document.file('/')('.html'),
    '/index.html',
    'root'
  );

  t.assert.equal(
    document.file('/about/')('.html'),
    '/about/index.html',
    'dir'
  );

  t.assert.equal(
    document.file('/about')('.html'),
    '/about.html',
    'file'
  );

  t.assert.equal(
    document.file('/about.xml')('.html'),
    '/about.xml',
    'ext'
  );
});

test('[document.render]', t => {
  const registry = new Registry([]);

  t.assert.equal(
    document.render(registry)({
      title: 'a',
      description: null,
      url: '/',
      ext: '.html',
      created: new Date(),
      updated: null,
      template: null,
      body: () => 'a'
    }),
    'a',
    'body'
  );

  t.assert.equal(
    document.render(registry)({
      title: 'a',
      description: null,
      url: '/',
      ext: '.html',
      created: new Date(),
      updated: null,
      template: () => () => 'b',
      body: () => 'a'
    }),
    'b',
    'template'
  );
});
