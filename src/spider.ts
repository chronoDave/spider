import type { Document } from './lib/load.ts';

import fsp from 'fs/promises';
import path from 'path';

import * as fs from './lib/fs.ts';
import * as load from './lib/load.ts';

export type Page = {
  title: string;
  description?: string;
  url?: string;
  created?: Date;
  updated?: Date;
  body: string;
};

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
  const registry = new Map<string, Document>();

  for await (const file of fsp.glob(options.files, { exclude: options.exclude })) {
    let doc: Document | null = null;

    if (file.endsWith('.md')) doc = await load.md(options.root ?? process.cwd())(file);
    if (file.endsWith('.js')) doc = await load.js(options.root ?? process.cwd())(file);
    if (file.endsWith('.ts')) doc = await load.js(options.root ?? process.cwd())(file);

    if (doc) {
      if (registry.has(doc.url)) throw new Error('Found duplicate page');

      registry.set(doc.url, doc);
    }
  }

  return registry;
};
