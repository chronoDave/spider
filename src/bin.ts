#!/usr/bin/env node
import minimist from 'minimist';
import chokidar from 'chokidar';

import createConfig from './lib/config';

const args = minimist(process.argv.slice(2), {
  alias: {
    config: 'c',
    outdir: 'o',
    include: 'r'
  }
});

const config = createConfig({
  include: args.include,
  outdir: args.outdir
});
