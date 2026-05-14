import test from 'node:test';

import Page from './page.ts';

test('[Page]', t => {
  const a = new Page({
    title: 'abc',
    description: null,
    ext: '.html',
    url: '/',
    created: new Date(),
    updated: null,
    template: () => () => '',
    body: () => ''
  });

  t.assert.equal(a.file, '/index.html');
  t.assert.equal(a.dir, '/');
});
