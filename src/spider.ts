import type { Stats } from 'fs';
import type { BundleResult } from './bundle/bundle';

import fsp from 'fs/promises';
import path from 'path';
import bundle from './bundle/bundle';

import load from './load/load';

export type { Html } from './load/load';

export type SpiderResult = BundleResult;

export type SpiderOptions = {
  /** Enable file outputting, default `false` */
  write?: boolean;
  /** Output root directory, default `process.cwd()` */
  outdir?: string;
};

export default (options?: SpiderOptions) =>
  async (file: string | Buffer, stats?: Stats): Promise<BundleResult[]> => {
    const pages = await Promise.all((await load(file)).map(bundle({ outdir: options?.outdir, stats })));

    if (options?.write) {
      const dirs = Array.from(new Set(pages.map(page => path.parse(page.file).dir)));

      await Promise.all(dirs.map(async dir => fsp.mkdir(dir, { recursive: true })));
      await Promise.all(pages.map(async page => fsp.writeFile(path.join(process.cwd(), page.file), page.html)));
    }

    return pages;
  };
