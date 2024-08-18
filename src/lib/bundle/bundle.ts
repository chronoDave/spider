import glob from 'fast-glob';
import path from 'path';

import write from '../write/write';

export type BundleOptions = {
  root: string;
  dirout: string;
  pattern: string;
};

export type Bundle = {
  redirects: Record<string, string[]>;
};

export default async (options: BundleOptions): Promise<Bundle> => {
  const entrypoints = await glob(options.pattern, { cwd: options.root, absolute: true });
  const files = await Promise.all(entrypoints.map(entrypoint => write({
    file: entrypoint,
    dirout: options.dirout
  })));

  const redirects = Object.fromEntries(files.map(file => [
    path.parse(file.path).dir.replace(options.dirout, '').replaceAll('\\', '/'),
    file.redirects ?? []
  ]));

  return { redirects };
};
