import path from 'path';
import fsp from 'fs/promises';

import { slugify } from './string.ts';
import * as parse from './parse.ts';
import * as date from './date.ts';
import * as p from './path.ts';

export type Document = {
  title: string;
  description: string | null;
  /** Relative URL */
  url: string;
  /** Truncted to day */
  created: Date;
  /** Truncted to day */
  updated: Date | null;
  body: string;
};

export const js = (root: string) =>
  async (file: string): Promise<Document> => {
    /**
     * Force cache-busting as Node caches ESM imports by default.
     *
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const [raw, stat] = await Promise.all([
      import(`file://${path.resolve(file)}?${Date.now()}`) as Promise<Record<string, unknown>>,
      fsp.stat(file)
    ]);

    const module = parse.module(raw.default);
    const title = parse.title(module.title);
    const url = parse.url(module.url) ?? path.posix.join(p.rel(root)(path.dirname(file)), slugify(title));
    const description = parse.description(module.description);
    const created = date.truncateDay(parse.created(module.created) ?? stat.birthtime);
    const updated = date.truncateDay(parse.updated(module.updated) ?? stat.mtime);
    const body = parse.body(module.body);

    return {
      title,
      description,
      url,
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      body
    };
  };

export const md = (root: string) =>
  async (file: string): Promise<Document> => {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file, 'utf-8'),
      fsp.stat(file)
    ]);

    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== 'string') throw new Error('Missing metadata');

    const metadata = Object.fromEntries(header.split(/\r?\n/)
      .map(line => line.split(':').map(x => x.trim()))) as Record<string, unknown>;

    const title = parse.title(metadata.title);
    const url = parse.url(metadata.url) ?? path.posix.join(p.rel(root)(path.dirname(file)), slugify(title));
    const description = parse.description(metadata.description);
    const created = date.truncateDay(parse.created(metadata.created) ?? stat.birthtime);
    const updated = date.truncateDay(parse.updated(metadata.updated) ?? stat.mtime);

    return {
      title,
      description,
      url,
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      body: raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, '')
    };
  };
