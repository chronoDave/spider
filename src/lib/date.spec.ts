import test from 'node:test';

import * as date from './date.ts';

test('[date.truncateDay]', t => {
  t.assert.equal(
    date.truncateDay(new Date(0)).getTime(),
    new Date(0).getTime(),
    'utc'
  );

  t.assert.equal(
    date.truncateDay(new Date(1)).getTime(),
    new Date(0).getTime(),
    'ms'
  );

  t.assert.equal(
    date.truncateDay(new Date(1000)).getTime(),
    new Date(0).getTime(),
    's'
  );

  t.assert.equal(
    date.truncateDay(new Date(1000 * 60)).getTime(),
    new Date(0).getTime(),
    'm'
  );

  t.assert.equal(
    date.truncateDay(new Date(1000 * 60 * 60)).getTime(),
    new Date(0).getTime(),
    'h'
  );

  t.assert.equal(
    date.truncateDay(new Date(1000 * 60 * 60 * 25)).getTime(),
    new Date(1000 * 60 * 60 * 24).getTime(),
    'day'
  );
});
