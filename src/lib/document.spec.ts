import type { LoaderResult } from './loader.ts';

import test from 'node:test';

import Document from './document.ts';
import Registry from './registry.ts';

const result = (options: { title: string; url?: string; ext?: string }): LoaderResult => ({
  dependencies: new Set(),
  page: {
    title: options.title,
    url: options.url ?? null,
    ext: options.ext ?? null,
    description: null,
    created: null,
    updated: null,
    body: () => '',
    template: () => () => ''
  }
});

test('[Document.file]', t => {
  t.test('root', () => {
    t.assert.equal(
      Document.file('/', result({ title: 'index' })),
      '/index.html',
      'index'
    );

    t.assert.equal(
      Document.file('/', result({ title: 'about' })),
      '/about/index.html',
      'title'
    );

    t.assert.equal(
      Document.file('/', result({ title: 'about', ext: '.html' })),
      '/about.html',
      'ext (html)'
    );

    t.assert.equal(
      Document.file('/', result({ title: 'about', ext: '.xml' })),
      '/about.xml',
      'ext (xml)'
    );

    t.assert.equal(
      Document.file('/', result({ url: '/abc', title: 'def' })),
      '/abc.html',
      'url'
    );

    t.assert.equal(
      Document.file('/', result({ url: '/abc/', title: 'def' })),
      '/abc/index.html',
      'url (dir)'
    );
  });

  t.test('dir', () => {
    t.assert.equal(
      Document.file('/about', result({ title: 'index' })),
      '/about/index.html',
      'index'
    );

    t.assert.equal(
      Document.file('/about', result({ title: 'me' })),
      '/about/me/index.html',
      'title'
    );

    t.assert.equal(
      Document.file('/about', result({ title: 'about' })),
      '/about/index.html',
      'dir'
    );

    t.assert.equal(
      Document.file('/about', result({ title: 'about', ext: '.html' })),
      '/about/about.html',
      'ext (html)'
    );

    t.assert.equal(
      Document.file('/about', result({ title: 'about', ext: '.xml' })),
      '/about/about.xml',
      'ext (xml)'
    );

    t.assert.equal(
      Document.file('/about', result({ url: '/abc', title: 'def' })),
      '/abc.html',
      'url'
    );

    t.assert.equal(
      Document.file('/about', result({ url: '/abc/', title: 'def' })),
      '/abc/index.html',
      'url (dir)'
    );
  });
});

test('[Document.url]', t => {
  t.test('root', () => {
    t.assert.equal(
      new Document('/', result({ title: 'index' })).page.url,
      '/',
      'index'
    );

    t.assert.equal(
      new Document('/', result({ title: 'about' })).page.url,
      '/about/',
      'title'
    );

    t.assert.equal(
      new Document('/', result({ title: 'about', ext: '.html' })).page.url,
      '/about',
      'ext (html)'
    );

    t.assert.equal(
      new Document('/', result({ title: 'about', ext: '.xml' })).page.url,
      '/about.xml',
      'ext (xml)'
    );

    t.assert.equal(
      new Document('/', result({ url: '/abc', title: 'def' })).page.url,
      '/abc',
      'url'
    );

    t.assert.equal(
      new Document('/', result({ url: '/abc.html', title: 'def' })).page.url,
      '/abc',
      'url (html)'
    );

    t.assert.equal(
      new Document('/', result({ url: '/abc.xml', title: 'def' })).page.url,
      '/abc.xml',
      'url (xml)'
    );
  });

  t.test('dir', () => {
    t.assert.equal(
      new Document('/about', result({ title: 'index' })).page.url,
      '/about/',
      'index'
    );

    t.assert.equal(
      new Document('/about', result({ title: 'me' })).page.url,
      '/about/me/',
      'title'
    );

    t.assert.equal(
      new Document('/about', result({ title: 'about' })).page.url,
      '/about/',
      'dir'
    );

    t.assert.equal(
      new Document('/about', result({ title: 'about', ext: '.html' })).page.url,
      '/about/about',
      'ext (html)'
    );

    t.assert.equal(
      new Document('/about', result({ title: 'about', ext: '.xml' })).page.url,
      '/about/about.xml',
      'ext (xml)'
    );

    t.assert.equal(
      new Document('/about', result({ url: '/abc', title: 'def' })).page.url,
      '/abc',
      'url'
    );

    t.assert.equal(
      new Document('/about', result({ url: '/abc.html', title: 'def' })).page.url,
      '/abc',
      'url (html)'
    );

    t.assert.equal(
      new Document('/about', result({ url: '/abc.xml', title: 'def' })).page.url,
      '/abc.xml',
      'url (xml)'
    );
  });
});

test('[Document.render]', t => {
  const registry = new Registry([]);

  t.assert.equal(
    new Document('/', {
      dependencies: new Set(),
      page: {
        title: 'a',
        description: null,
        url: '/',
        ext: null,
        created: new Date(),
        updated: null,
        template: null,
        body: () => 'a'
      }
    }).render(registry),
    'a',
    'body'
  );

  t.assert.equal(
    new Document('/', {
      dependencies: new Set(),
      page: {
        title: 'a',
        description: null,
        url: '/',
        ext: null,
        created: new Date(),
        updated: null,
        template: () => () => 'b',
        body: () => 'a'
      }
    }).render(registry),
    'b',
    'template'
  );
});
