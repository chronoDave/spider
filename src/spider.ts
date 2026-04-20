import type { Page } from './lib/load.ts';

import fsp from 'fs/promises';
import path from 'path';

import * as fs from './lib/fs.ts';
import * as load from './lib/load.ts';

/**
 * 1) Read all files
 * 2) Map url to file
 * 3) Generate HTML
 * 4) Write HTML to disk
 */

export type SpiderOptions = {
  /** Source directories. Will read contents recursively */
  dirs: string[];
  /** Output directory */
  dirout: string;
  /** If true, disables writing to `dirout`. Default `false` */
  dry?: boolean;
};

export default async (options: SpiderOptions) => {
  // 1) Read all files
  const files = await Promise.all(options.dirs.map(fs.files))
    .then(files => Array.from(new Set(files.flat())));
  // 1.5) Load all files
  const pages = await Promise.all<Array<Promise<Page>>>(files.map(async file => {
    if (file.endsWith('.md')) return load.md(file);
    return load.js(file);
  }));
  // 2) Map url to page
  const registry = new Map<string, Page>(pages.map(page => [page.url, page]));
  // 3) Generate HTML
  if (!options.dry) {
    for (const [url, page] of registry.entries()) {
      await fsp.mkdir(path.join(options.dirout, url), { recursive: true });
      await fsp.writeFile(path.join(options.dirout, url, 'index.html'), page.body);
    }
  }

  return registry;
};
