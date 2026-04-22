import test from 'node:test';

import * as parse from './parse.ts';

test('[parse.string]', t => {
  t.assert.throws(() => parse.string('')(null), 'invalid (type)');
  t.assert.equal(parse.string('abc')('abc'), 'abc', 'valid (type)');
});

test('[parse.function]', t => {
  t.assert.throws(() => parse.fn('')(null), 'invalid (type)');
  t.assert.equal(typeof parse.fn('')(() => ''), 'function', 'valid (type)');
});

test('[parse.object]', t => {
  t.assert.throws(() => parse.object('')(false), 'invalid (type)');
  t.assert.throws(() => parse.object('')(null), 'invalid (null)');
  t.assert.throws(() => parse.object('')([]), 'invalid (array)');
  t.assert.deepEqual(parse.object('abc')({}), {}, 'valid (type)');
});
