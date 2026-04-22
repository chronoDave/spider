import type { Loader } from './lib/loader.ts';

import fsp from 'fs/promises';
import path from 'path';

import Page from './lib/page.ts';
import * as loader from './lib/loader.ts';

/**
 * 1) Read all files
 * 2) Map url to file
 * 3) Generate HTML
 * 4) Write HTML to disk
 */

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
  const registry = new Map<string, Page>();
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

    registry.set(result.url, new Page(result));
  }

  return registry;
};
