import type { BundleOptions } from './bundle';

import test from 'tape';
import path from 'path';

import bundle from './bundle';

test('[bundle] resolves file path', t => {
  t.equal(
    bundle()({ url: '/', html: '' }).file,
    path.normalize('index.html'),
    'resolves index'
  );

  t.equal(
    bundle()({ url: '/about', html: '' }).file,
    path.normalize('about.html'),
    'resolves page'
  );

  t.equal(
    bundle()({ url: '/blog/post', html: '' }).file,
    path.normalize('blog/post.html'),
    'resolves nested'
  );

  t.equal(
    bundle({ outdir: 'dist' })({ url: '/blog/post', html: '' }).file,
    path.normalize('dist/blog/post.html'),
    'resolves outdir'
  );

  t.equal(
    bundle()({ url: 'about', html: '' }).file,
    path.normalize('about.html'),
    'resolves url without /'
  );

  t.end();
});

test('[bundle] resolves file html', t => {
  t.equal(
    bundle()({ url: '/', html: '<p>Home</p>' }).html,
    '<p>Home</p>',
    'resolves string'
  );

  const { html } = bundle({
    outdir: 'dist',
    stats: { birthtimeMs: 1 }
  } as BundleOptions)({
    url: '/blog/post',
    html: stats => `<p>${stats?.birthtimeMs}</p>`
  });

  t.true(/\d+/.test(html), 'injects stats');

  t.end();
});
