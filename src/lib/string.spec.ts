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

test('[string.count]', t => {
  t.assert.doesNotThrow(() => string.count('^$')('^$'), 'escapes regexp');
  t.assert.equal(string.count('/')('abc'), 0, 'no match');
  t.assert.equal(string.count('/')('/abc'), 1, 'single match');
  t.assert.equal(string.count('/')('/abc/def/'), 3, 'multiple match');
  t.assert.equal(string.count('^$')('^aaa$'), 0, 'group match');
});
