import type { Loader, LoadResult } from './lib/loader.ts';

import fsp from 'fs/promises';
import path from 'path';

import * as loader from './lib/loader.ts';

export type {
  Loader,
  LoadResult,
  LoadContext,
  Template,
  Body,
  Page
} from './lib/loader.ts';

export type SpiderOptions = {
  /** File globs */
  files: string[];
  /** Filter out files / directories using glob patterns from src */
  exclude?: string[];
  /** Base directory */
  root?: string;
  /** Output directory. If empty, does not write files */
  dirout?: string;
  /** File loaders */
  loader?: Record<string, Loader>;
};

export default async (options: SpiderOptions) => {
  const registry = new Map<string, LoadResult>();
  const root = options.root ?? process.cwd();
  const loaders = new Map<string, Loader>();

  loaders.set('.md', loader.md);
  loaders.set('.js', loader.js);
  loaders.set('.ts', loader.js);
  if (options.loader) Object.entries(loader).forEach(([ext, loader]) => loaders.set(ext, loader));

  for await (const file of fsp.glob(options.files, { exclude: options.exclude })) {
    const err = (reason: string) => new Error(`Failed to load page "${file}"`, { cause: new Error(reason) });
    const result = await loaders.get(path.extname(file))?.({ root, file });
    if (!result) throw err(`Unknown file type "${path.extname(file)}"`);
    if (registry.has(result.url)) throw err(`Page already exists with url "${result.url}"`);

    registry.set(result.url, result);
  }

  if (typeof options.dirout === 'string') {
    for (const result of registry.values()) {
      let url = result.url;
      if (url.endsWith('/')) url = `${url}index`;

      await fsp.mkdir(path.join(options.dirout, path.dirname(result.url)), { recursive: true });
      await fsp.writeFile(path.join(options.dirout, `${url}${result.ext}`), result.template(registry)(result));
    }
  }

  return registry;
};
