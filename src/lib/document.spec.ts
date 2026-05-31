import test from 'node:test';

import * as document from './document.ts';
import Registry from './registry.ts';

test('[document.file]', t => {
  t.assert.equal(
    document.file('/'),
    '/index.html',
    'dir'
  );

  t.assert.equal(
    document.file('/about.xml'),
    '/about.xml',
    'ext'
  );

  t.assert.equal(
    document.file('/about'),
    '/about.html',
    'file'
  );
});

test('[document.render]', t => {
  const registry = new Registry([]);

  t.assert.equal(
    document.render(registry)({
      title: 'a',
      description: null,
      url: '/',
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
      created: new Date(),
      updated: null,
      template: () => () => 'b',
      body: () => 'a'
    }),
    'b',
    'template'
  );
});
