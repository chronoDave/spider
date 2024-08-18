import test from 'tape';
import glob from 'fast-glob';

import bundle from './bundle';
import init from './bundle.struct';

test('[bundle] writes files', async t => {
  const { ROOT, ASSETS, cleanup } = await init();

  await bundle({
    root: ASSETS,
    pattern: '**/*.js',
    dirout: ROOT
  });

  const files = await glob('**/*.html', { cwd: ROOT });

  t.equal(files.length, 2, 'writes files');
  
  await cleanup();
  t.end();
});

test('[bundle] returns redirects', async t => {
  const { ROOT, ASSETS, cleanup } = await init();

  const { redirects } = await bundle({
    root: ASSETS,
    pattern: '**/*.js',
    dirout: ROOT
  });

  t.deepEqual(
    redirects['/about/me'],
    ['/me'],
    'returns redirects'
  );

  await cleanup();
  t.end();
});
