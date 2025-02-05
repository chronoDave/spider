import test from 'tape';

import get from './get';

test('[get] gets nested property through dot notation', t => {
  t.equal(get({ a: 1 })('a'), 1, 'single');
  t.equal(get({ a: { b: 'c' } })('a.b'), 'c', 'nested');

  try {
    get({ a: 1 })('b.c');
  } catch (err) {
    t.pass((err as Error).message);
  }

  t.end();
});
