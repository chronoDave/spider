import test from 'node:test';

import * as is from './is.ts';

test('[is.page]', t => {
  t.assert.throws(() => is.page({ html: () => '' }), 'missing url');
  t.assert.throws(() => is.page({ url: '' }), 'missing html');
  t.assert.doesNotThrow(() => is.page({ html: () => '', url: '' }));
});
