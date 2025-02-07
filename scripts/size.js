import fsp from 'fs/promises';
import path from 'path';
import psize from '@chronocide/package-size';

const root = path.join(process.cwd(), 'README.md');
const raw = await fsp.readFile(root, 'utf-8')
  .then(x => x.split('\n'));
const size = await psize('dist')
  .then(x => (x / 1000).toFixed(2));

// eslint-disable-next-line @stylistic/js/max-len
raw[9] = `  <img alt="${size}KB" src="https://img.shields.io/badge/gzip-${size}KB-g">`;

await fsp.writeFile(root, raw.join('\n'));
