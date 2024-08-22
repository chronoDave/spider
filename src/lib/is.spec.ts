import test from 'tape';

import * as is from './is';

test('[is.record] validates record', t => {
  t.true(is.record({}), 'object');

  t.false(is.record(null), 'null');
  t.false(is.record(1), 'number');
  t.false(is.record(''), 'string');
  t.false(is.record(false), 'boolean');
  t.false(is.record(undefined), 'undefined');
  t.false(is.record([]), 'array');
  
  t.end();
});

test('[is.string] validates string', t => {
  t.true(is.string(''), 'string');

  t.false(is.string({}), 'object');
  t.false(is.string(null), 'null');
  t.false(is.string(1), 'number');
  t.false(is.string(false), 'boolean');
  t.false(is.string(undefined), 'undefined');
  t.false(is.string([]), 'array');
  
  t.end();
});
