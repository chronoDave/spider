import test from 'node:test';

import * as document from './document.ts';
import Registry from './registry.ts';

test('[document.url]', t => {
  t.assert.equal(
    document.url('.html')('/')('about'),
    '/about/',
    'root'
  );

  t.assert.equal(
    document.url('.html')('/')('index'),
    '/',
    'index (root)'
  );

  t.assert.equal(
    document.url('.html')('/about/')('me'),
    '/about/me/',
    'dir'
  );

  t.assert.equal(
    document.url('.html')('/about/')('about'),
    '/about/',
    'dir (duplicate)'
  );

  t.assert.equal(
    document.url('.html')('/about/')('index'),
    '/about/',
    'dir (index)'
  );

  t.assert.equal(
    document.url('.xml')('/')('about'),
    '/about.xml',
    'root'
  );

  t.assert.equal(
    document.url('.xml')('/')('index'),
    '/index.xml',
    'index (root)'
  );

  t.assert.equal(
    document.url('.xml')('/about/')('me'),
    '/about/me.xml',
    'dir'
  );

  t.assert.equal(
    document.url('.xml')('/about/')('about'),
    '/about.xml',
    'dir (duplicate)'
  );

  t.assert.equal(
    document.url('.xml')('/about/')('index'),
    '/about/index.xml',
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
    document.file('/index.xml')('.xml'),
    '/index.xml',
    'root (ext)'
  );

  t.assert.equal(
    document.file('/about/index.xml')('.xml'),
    '/about/index.xml',
    'dir (ext)'
  );

  t.assert.equal(
    document.file('/about.xml')('.xml'),
    '/about.xml',
    'file (ext)'
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
