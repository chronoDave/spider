import fsp from 'fs/promises';
import path from 'path';

import { ROOT, ASSETS } from '../../../test/const';

export default async () => {
  await fsp.mkdir(ROOT, { recursive: true });

  return {
    ROOT,
    FILE: path.join(ASSETS, 'page.valid.js'),
    cleanup: () => fsp.rm(ROOT, { recursive: true, force: true })
  };
};
