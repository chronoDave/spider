import type { Stats } from 'fs';
import type { Page } from '../load/load';

import path from 'path';

export type BundleOptions = {
  outdir?: string;
  stats?: Stats;
};

export type BundleResult = {
  file: string;
  html: string;
};

export default (options?: BundleOptions) =>
  (page: Page): BundleResult => ({
    file: path.format({
      dir: [options?.outdir, ...page.url.split('/').slice(1, -1)]
        .filter(x => x)
        .join(path.sep),
      name: /\/([^\/]+)$/.exec(page.url)?.[1] ?? 'index',
      ext: '.html'
    }),
    html: typeof page.html === 'string' ?
      page.html :
      page.html(options?.stats ?? null)
  });
