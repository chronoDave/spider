import test from 'node:test';

import * as load from './load.ts';

test('[load.file]', t => {
  t.assert.rejects(load.file('does-not-exist'), 'rejects on invalid path');
  t.assert.rejects(load.file('.gitignore'), 'rejects on invalid file type');
  t.assert.doesNotReject(load.file('eslint.config.js'), 'does not reject on valid file type');
});
