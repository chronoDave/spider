import test from 'node:test';

import * as fn from './fn.ts';

test('[fn.maybe]', t => {
  const x = (i: number) => i;

  t.assert.equal(fn.maybe(x)(1), 1, 'value');
  t.assert.equal(fn.maybe(x)(null), null, 'null');
  t.assert.equal(fn.maybe(x)(undefined), null, 'undefined');
});

test('[fn.debounce]', async t => {
  let n = 0;

  const x = async (i: number): Promise<void> => new Promise(resolve => {
    n += i;
    resolve();
  });
  const dx = fn.debounce(100)(x);

  dx(1);
  dx(1);
  await dx(1);

  t.assert.equal(n, 1, 'debounces');
});
