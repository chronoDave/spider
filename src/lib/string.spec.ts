import test from 'node:test';

import * as string from './string.ts';

test('[string.slugify]', t => {
  t.assert.equal(string.slugify('foobar'), 'foobar', 'normal');
  t.assert.equal(string.slugify('FooBar'), 'foobar', 'capitals');
  t.assert.equal(string.slugify('     foobar      '), 'foobar', 'trim');
  t.assert.equal(string.slugify('foo bar'), 'foo-bar', 'spaces');
  t.assert.equal(string.slugify('FooBar!'), 'foobar', 'characters');
  t.assert.equal(string.slugify('Foo & Bar'), 'foo-bar', 'condense spaces');
  t.assert.equal(string.slugify('föòóbar'), 'fooobar', 'diacritics');
});
