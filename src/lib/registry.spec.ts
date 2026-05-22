import type { TestContext } from 'node:test';

import test from 'node:test';

import Registry from './registry.ts';
import Page from './page.ts';

test('[Registry]', (t: TestContext) => {
  const urls = ['/', '/a', '/b', '/b/c', '/b/c/d', '/e', '/f', '/f/g'];
  const registry = new Registry(urls.map(url => new Page({
    title: '',
    description: null,
    url,
    ext: '.html',
    created: new Date(),
    updated: null,
    body: null,
    template: null
  })));

  t.assert.equal(registry.nodes.length, urls.length, 'has pages');
  t.assert.ok(registry.node('/b/c/d'), 'has page');

  /**
   * /
   *  /a
   *  /b
   *    /b/c
   *      /b/c/d
   *  /e
   *  /f
   *    /f/g
   */
  const tree = JSON.parse(JSON.stringify(registry.tree, (k, v) => {
    if (v instanceof Page) return v.url;
    if (k === 'parent') return null;
    return v;
  }));

  t.assert.equal(tree.length, 1, 'has root');
  t.assert.equal(tree[0].children.length, 4, 'has children');
  t.assert.equal(tree[0].children[1].children.length, 1, 'has nested children (/b/c/d)');
});
