import fs from 'fs';
import path from 'path';

import { read } from './meta';

export type BundleOptions = {
  /** Page file name, defaults to `<meta.name>` */
  name?: string;
  /** Page file extension, defaults to `js` */
  ext?: string;
};

export type BundleResult = {
  redirects: string[] | null;
  /** Absolute page path */
  in: string;
  /** Relative output path */
  out: string;
};

/**
 * Create bundle
 * @param url - Absolute file path
 * */
export const bundle = async (url: string, options?: BundleOptions): Promise<BundleResult> => {
  const { name, dir } = path.parse(url);
  const page = path.format({
    dir,
    name: options?.name ?? name,
    ext: options?.ext ?? 'js'
  });

  if (!fs.existsSync(page)) throw new Error(`${page.replace(process.cwd(), '')} does not exist`);

  const meta = await read(url);

  return {
    redirects: meta.redirects,
    in: page,
    out: meta.url.length === 1 ?
      'index.html' :
      path.format({
        dir: meta.url.split('/').slice(0, -1).join(path.sep),
        name: meta.url.split('/').slice(-1)[0],
        ext: 'html'
      })
  };
};
