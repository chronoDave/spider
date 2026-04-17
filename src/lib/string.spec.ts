import test from 'node:test';

import * as string from './string.ts';

test('[string.slugify]', t => {
  t.assert.equal(string.slugify('Foo Bar'), 'foo-bar');
  t.assert.equal(string.slugify('Foo & Bar'), 'foo-bar');
  t.assert.equal(string.slugify(' Foo Bar Baz '), 'foo-bar-baz');
  t.assert.equal(string.slugify('foo-bar'), 'foo-bar');
  t.assert.equal(string.slugify('foo-----bar        baz'), 'foo-bar-baz');
  t.assert.equal(string.slugify('FooBar'), 'foobar');
});
