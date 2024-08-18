import fsp from 'fs/promises';
import path from 'path';

import { build } from 'esbuild';
import glob from 'fast-glob';

const outdir = path.resolve(process.cwd(), 'build');

build({
  entryPoints: glob.sync('src/**/*.spec.ts*', {
    absolute: true
  }),
  bundle: true,
  external: [
    'tape',
    'fast-glob'
  ],
  platform: 'node',
  format: 'esm',
  outdir,
  plugins: [{
    name: 'clean',
    setup: () => fsp.rm(outdir, { force: true, recursive: true })
  }]
});
