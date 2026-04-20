import test from 'node:test';

import * as parse from './parse.ts';

test('[parse.title]', t => {
  t.assert.throws(() => parse.title(undefined), 'invalid (undefined)');
  t.assert.throws(() => parse.title(1), 'invalid (type)');
  t.assert.throws(() => parse.title(''), 'invalid (empty)');
  t.assert.equal(parse.title('abc'), 'abc', 'valid');
});

test('[parse.body]', t => {
  t.assert.throws(() => parse.body(undefined), 'invalid (undefined)');
  t.assert.throws(() => parse.body(1), 'invalid (type)');
  t.assert.throws(() => parse.body(''), 'invalid (empty)');
  t.assert.equal(parse.body('abc'), 'abc', 'valid');
});

test('[parse.description]', t => {
  t.assert.throws(() => parse.description(1), 'invalid (type)');
  t.assert.equal(parse.description(undefined), null, 'valid (undefined)');
  t.assert.equal(parse.description(null), null, 'valid (null)');
  t.assert.equal(parse.description(''), null, 'valid (empty)');
  t.assert.equal(parse.description('abc'), 'abc', 'valid (string)');
});

test('[parse.url]', t => {
  t.assert.throws(() => parse.url(1), 'invalid (type)');
  t.assert.equal(parse.url(undefined), null, 'valid (undefined)');
  t.assert.equal(parse.url(null), null, 'valid (null)');
  t.assert.equal(parse.url(''), null, 'valid (empty)');
  t.assert.equal(parse.url('/abc'), '/abc', 'valid (string)');
});

test('[parse.created]', t => {
  t.assert.throws(() => parse.created(false), 'invalid (type)');
  t.assert.equal(parse.created(undefined), null, 'valid (undefined)');
  t.assert.equal(parse.created(null), null, 'valid (null)');
  t.assert.equal(parse.created(''), null, 'valid (empty)');
  t.assert.deepEqual(parse.created('1999-01-01'), new Date('1999-01-01'), 'valid (string)');
  t.assert.deepEqual(parse.created(1), new Date(1), 'valid (number)');
});

test('[parse.updated]', t => {
  t.assert.throws(() => parse.updated(false), 'invalid (type)');
  t.assert.equal(parse.updated(undefined), null, 'valid (undefined)');
  t.assert.equal(parse.updated(null), null, 'valid (null)');
  t.assert.equal(parse.updated(''), null, 'valid (empty)');
  t.assert.deepEqual(parse.updated('1999-01-01'), new Date('1999-01-01'), 'valid (string)');
  t.assert.deepEqual(parse.updated(1), new Date(1), 'valid (number)');
});

test('[parse.module]', t => {
  t.assert.throws(() => parse.module(false), 'invalid (type)');
  t.assert.throws(() => parse.module(null), 'invalid (null)');
  t.assert.throws(() => parse.module([]), 'invalid (array)');
  t.assert.deepEqual({ a: 1 }, { a: 1 }, 'valid');
});
