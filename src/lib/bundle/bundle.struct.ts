import fsp from 'fs/promises';

import { ROOT, ASSETS } from '../../../test/const';

export default async () => {
  await fsp.mkdir(ROOT, { recursive: true });

  return {
    ROOT,
    ASSETS,
    cleanup: () => fsp.rm(ROOT, { recursive: true, force: true })
  };
};
