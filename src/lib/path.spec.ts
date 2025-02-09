import test from 'tape';
import { normalize } from 'path';

import path from './path';

test('[path] resolves file path', t => {
  t.equal(
    path()('/'),
    normalize('index.html'),
    'resolves root (dir)'
  );

  t.equal(
    path()('index.html'),
    normalize('index.html'),
    'resolves root (absolute)'
  );

  t.equal(
    path()('/about/'),
    normalize('about/index.html'),
    'resolves level 1 (dir)'
  );

  t.equal(
    path()('/about'),
    normalize('about.html'),
    'resolves level 1 (file)'
  );

  t.equal(
    path()('/about.html'),
    normalize('about.html'),
    'resolves level 1 (absolute)'
  );

  t.equal(
    path()('/about/me/'),
    normalize('about/me/index.html'),
    'resolves level 2 (dir)'
  );

  t.equal(
    path()('/about/me'),
    normalize('about/me.html'),
    'resolves level 2 (file)'
  );

  t.equal(
    path()('/about/me.html'),
    normalize('about/me.html'),
    'resolves level 2 (absolute)'
  );

  t.equal(
    path({ outdir: 'dist' })('/about/me'),
    normalize('dist/about/me.html'),
    'resolves outdir'
  );

  t.equal(
    path({ outdir: 'dist' })('rss.xml'),
    normalize('dist/rss.xml'),
    'resolves arbitrary file types'
  );

  t.end();
});
