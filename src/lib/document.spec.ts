import test from 'node:test';

import * as document from './document.ts';

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

// test('[Page.file]', t => {
//   const page = (url: string, ext?: string) => new Page({
//     title: 'title',
//     description: null,
//     url,
//     ext: ext ?? null,
//     created: new Date(),
//     updated: null,
//     template: null,
//     body: null
//   });

//   t.assert.equal(page('/').file, '/index.html', '/');
//   t.assert.equal(page('/a/b').file, '/a/b.html', '/a/b');
//   t.assert.equal(page('/rss', '.xml').file, '/rss.xml', '/rss.xml');
// });

// test('[Page.dir]', t => {
//   const page = (url: string, ext?: string) => new Page({
//     title: 'title',
//     description: null,
//     url,
//     ext: ext ?? null,
//     created: new Date(),
//     updated: null,
//     template: null,
//     body: null
//   });

//   t.assert.equal(page('/').dir, '/', '/');
//   t.assert.equal(page('/a/b').dir, '/a', '/a/b');
//   t.assert.equal(page('/a/b/c').dir, '/a/b', '/a/b/c');
//   t.assert.equal(page('/rss', '.xml').dir, '/', '/rss.xml');
// });

// test('[Page.depth]', t => {
//   const page = (url: string, ext?: string) => new Page({
//     title: 'title',
//     description: null,
//     url,
//     ext: ext ?? null,
//     created: new Date(),
//     updated: null,
//     template: null,
//     body: null
//   });

//   t.assert.equal(page('/').depth, 0, '/');
//   t.assert.equal(page('/a/b').depth, 2, '/a/b');
//   t.assert.equal(page('/a/b/c').depth, 3, '/a/b/c');
//   t.assert.equal(page('/rss', '.xml').depth, 1, '/rss.xml');
// });
