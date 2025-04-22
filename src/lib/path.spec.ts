import test from 'node:test';
import { normalize } from 'path';

import path from './path.ts';

await test('[path] resolves file path', t => {
  t.assert.equal(
    path()('/'),
    normalize('index.html'),
    'resolves root (dir)'
  );

  t.assert.equal(
    path()('index.html'),
    normalize('index.html'),
    'resolves root (absolute)'
  );

  t.assert.equal(
    path()('/about/'),
    normalize('about/index.html'),
    'resolves level 1 (dir)'
  );

  t.assert.equal(
    path()('/about'),
    normalize('about.html'),
    'resolves level 1 (file)'
  );

  t.assert.equal(
    path()('/about.html'),
    normalize('about.html'),
    'resolves level 1 (absolute)'
  );

  t.assert.equal(
    path()('/about/me/'),
    normalize('about/me/index.html'),
    'resolves level 2 (dir)'
  );

  t.assert.equal(
    path()('/about/me'),
    normalize('about/me.html'),
    'resolves level 2 (file)'
  );

  t.assert.equal(
    path()('/about/me.html'),
    normalize('about/me.html'),
    'resolves level 2 (absolute)'
  );

  t.assert.equal(
    path({ outdir: 'dist' })('/about/me'),
    normalize('dist/about/me.html'),
    'resolves outdir'
  );

  t.assert.equal(
    path({ outdir: 'dist' })('rss.xml'),
    normalize('dist/rss.xml'),
    'resolves arbitrary file types'
  );
});
