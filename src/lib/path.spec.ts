import test from 'tape';

import { absolute } from './path';

test('[path.absolute] returns absolute path', t => {
  t.notEqual(absolute('/src'), '/src');
  t.equal(absolute(process.cwd()), process.cwd());

  t.end();
});

