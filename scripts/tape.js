import fsp from 'fs/promises';
import path from 'path';

import { build } from 'esbuild';

const outdir = path.resolve(process.cwd(), 'build');

await fsp.rm(outdir, { force: true, recursive: true });

build({
  entryPoints: ['src/**/*.spec.ts*'],
  bundle: true,
  external: [
    'tape'
  ],
  platform: 'node',
  format: 'esm',
  outdir
});
