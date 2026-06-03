import type { TestContext } from 'node:test';

import test from 'node:test';

import Registry from './registry.ts';
import * as string from './string.ts';

const setup = () => {
  const depth = string.count('/');
  const urls = ['/b/c/', '/', '/b/', '/a/', '/e/', '/f/', '/f/g/', '/b/c/d/', '/f/g.html', '/a.xml']
    .sort((a, b) => {
      if (depth(a) === depth(b)) return a.localeCompare(b);
      return depth(a) - depth(b);
    })
    .map(url => ({
      title: '',
      description: null,
      url,
      ext: '.html',
      created: new Date(),
      updated: null,
      body: () => '',
      template: null
    }));

  return new Registry(urls);
};

test('[Registry.get]', (t: TestContext) => {
  const registry = setup();

  t.assert.ok(registry.get('/b/c/d/'), 'has page');
  t.assert.ok(registry.get('/f/g.html'), 'has page (html)');
  t.assert.ok(registry.get('/a.xml'), 'has page (xml)');
});

test('[Registry.tree]', t => {
  const registry = setup();

  t.assert.equal(registry.tree.length, 1, 'has root');
  t.assert.equal(registry.tree[0].children.length, 5, 'has children');
  t.assert.equal(registry.tree[0].children[2].children.length, 1, 'has nested children (/b/c/d)');
});

test('[Registry.list]', t => {
  const registry = setup();

  t.assert.equal(registry.list.length, 10, 'has list');
});
