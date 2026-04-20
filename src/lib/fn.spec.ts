import test from 'node:test';

import * as fn from './fn.ts';

test('[fn.maybe]', t => {
  const x = (i: number) => i;

  t.assert.equal(fn.maybe(x)(1), 1, 'value');
  t.assert.equal(fn.maybe(x)(null), null, 'null');
  t.assert.equal(fn.maybe(x)(undefined), null, 'undefined');
});
