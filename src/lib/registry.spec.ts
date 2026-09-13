import type { TestContext } from 'node:test';
import type { Page } from './document.ts';

import test from 'node:test';

import registry from './registry.ts';

const setup = () => {
  /**
   * `/`
   * - `/a.xml`
   * - `/a/`
   * - `/b/`
   *   - `/b/c/`
   *     - `/b/c/d/`
   * - `/e/`
   * - `/f/`
   *   - `/f/g/`
   *   - `/f/g.html`
   */
  const pages: Page[] = [
    '/b/c/',
    '/',
    '/b/',
    '/a/',
    '/e/',
    '/f/',
    '/f/g/',
    '/b/c/d/',
    '/f/g.html',
    '/a.xml'
  ].map(url => ({
    title: '',
    description: null,
    url,
    created: null,
    updated: null,
    body: null
  }));

  return registry(pages);
};

test('registry', (t: TestContext) => {
  const registry = setup();

  t.test('size', () => {
    t.assert.equal(registry.size, 10, 'has list');
  });

  t.test('get', () => {
    t.assert.ok(registry.get('/'), 'has root');
    t.assert.ok(registry.get('/b/c/d/'), 'has page');
    t.assert.ok(registry.get('/f/g.html'), 'has page (html)');
    t.assert.ok(registry.get('/a.xml'), 'has page (xml)');
  });

  t.test('nesting', () => {
    t.assert.equal(registry.get('/')?.children.length, 5, 'has children');
    t.assert.equal(registry.get('/')?.children[2].children.length, 1, 'has nested children (/b/c/d)');
  });
});
