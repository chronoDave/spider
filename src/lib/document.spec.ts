import test from 'node:test';

import Document from './document.ts';

test('[Document]', t => {
  const a = new Document({
    title: 'title',
    description: 'description',
    ext: '.html',
    url: '/about',
    created: new Date('2021'),
    updated: new Date('2022'),
    template: () => body => body,
    body: () => 'a'
  });

  t.assert.equal(a.title, 'title');
  t.assert.equal(a.description, 'description');
  t.assert.equal(a.url, '/about');
  t.assert.equal(a.created.getFullYear(), 2021);
  t.assert.equal(a.updated?.getFullYear(), 2022);

  t.assert.equal(a.level, 1);
  t.assert.equal(a.dir, '/');
  t.assert.equal(a.file, '/about.html');
  t.assert.equal(a.render(new Map()), 'a');

  const b = new Document({
    title: 'title',
    description: 'description',
    ext: '.html',
    url: '/',
    created: new Date('2021'),
    updated: new Date('2022'),
    template: () => body => body,
    body: () => 'a'
  });

  t.assert.equal(b.url, '/');
  t.assert.equal(b.file, '/index.html');
});
