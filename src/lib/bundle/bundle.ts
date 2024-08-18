import fsp from 'fs/promises';
import path from 'path';

import write from '../write/write';

export type BundleOptions = {
  root: string;
  dirout: string;
  pattern: RegExp;
};

export type Bundle = {
  redirects: Record<string, string[]>;
};

export default async (options: BundleOptions): Promise<Bundle> => {
  const root = path.isAbsolute(options.root) ?
    options.root :
    path.join(process.cwd(), options.root);

  const entries = await fsp.readdir(root, { recursive: true })
    .then(files => files.reduce<string[]>((acc, cur) => {
      if (options.pattern.test(cur)) acc.push(path.join(options.root, cur));
      return acc;
    }, []));
  
  const files = await Promise.all(entries.map(entry => write({
    file: entry,
    dirout: options.dirout
  })));

  const redirects = Object.fromEntries(files.map(file => [
    path.parse(file.path).dir.replace(options.dirout, '').replaceAll('\\', '/'),
    file.redirects ?? []
  ]));

  return { redirects };
};
