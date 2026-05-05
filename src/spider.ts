import type { Loader } from './lib/loader.ts';

import fsp from 'fs/promises';
import path from 'path';

import Document from './lib/document.ts';
import * as loader from './lib/loader.ts';

export type { Page, Template } from './lib/document.ts';
export type { Loader, LoadResult, LoadContext } from './lib/loader.ts';

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
  const registry = new Map<string, Document>();
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

    registry.set(result.url, new Document(result));
  }

  if (typeof options.dirout === 'string') {
    for (const page of registry.values()) {
      await fsp.mkdir(path.join(options.dirout, page.dir), { recursive: true });
      await fsp.writeFile(path.join(options.dirout, page.file), page.render(registry));
    }
  }

  return registry;
};
