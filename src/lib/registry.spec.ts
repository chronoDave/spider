import type { TestContext } from 'node:test';

import test from 'node:test';

import Registry from './registry.ts';

test('[Registry.get]', (t: TestContext) => {
  const urls = ['/b/c/', '/', '/b/', '/a/', '/e/', '/f/', '/f/g/', '/b/c/d/', '/f/g.html', '/a.xml'];
  const registry = new Registry(urls.map(url => ({
    title: '',
    description: null,
    url,
    ext: '.html',
    created: new Date(),
    updated: null,
    body: () => '',
    template: null
  })));

  t.assert.ok(registry.get('/b/c/d/'), 'has page');
  t.assert.ok(registry.get('/f/g.html'), 'has page (html)');
  t.assert.ok(registry.get('/a.xml'), 'has page (xml)');
});

test('[Registry.tree]', t => {
  const urls = ['/b/c/', '/', '/b/', '/a/', '/e/', '/f/', '/f/g/', '/b/c/d/', '/f/g.html', '/a.xml'];
  const registry = new Registry(urls.map(url => ({
    title: '',
    description: null,
    url,
    ext: '.html',
    created: new Date(),
    updated: null,
    body: () => '',
    template: null
  })));

  t.assert.equal(registry.tree.length, 1, 'has root');
  t.assert.equal(registry.tree[0].children.length, 5, 'has children');
  t.assert.equal(registry.tree[0].children[2].children.length, 1, 'has nested children (/b/c/d)');
});
