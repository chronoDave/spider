import type { Draft } from './lib/load.ts';

import fsp from 'fs/promises';
import path from 'path';

import * as load from './lib/load.ts';

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
};

export default async (options: SpiderOptions) => {
  const registry = new Map<string, Draft>();

  for await (const file of fsp.glob(options.files, { exclude: options.exclude })) {
    let draft: Draft | null = null;

    if (file.endsWith('.md')) draft = await load.md(options.root ?? process.cwd())(file);
    if (file.endsWith('.js')) draft = await load.js(options.root ?? process.cwd())(file);
    if (file.endsWith('.ts')) draft = await load.js(options.root ?? process.cwd())(file);

    if (!draft) throw new Error(`Unknown file type: "${path.parse(file).ext}"`);
    if (registry.has(draft.url)) throw new Error('Found duplicate page');

    registry.set(draft.url, draft);
  }

  return registry;
};
