import type { Stats } from 'fs';
import type { Page } from '../load/load';

import path from 'path';

export type BundleOptions = {
  outdir?: string;
  stats?: Stats;
};

export type BundleResult = {
  /** Relative file path */
  file: string;
  /** Raw HTML string */
  html: string;
};

export default (options?: BundleOptions) =>
  (page: Page): BundleResult => {
    const chunks = page.url.split('/');
    const file = /(\w+)(\..*)?/.exec(chunks[chunks.length - 1]);

    return {
      file: path.format({
        dir: [options?.outdir, ...chunks.slice(1, -1)]
          .filter(x => x)
          .join(path.sep),
        name: file?.[1] ?? 'index',
        ext: file?.[2] ?? '.html'
      }),
      html: typeof page.html === 'string' ?
        page.html :
        page.html(options?.stats ?? null)
    };
  };
