import type { Body, PageOptions, Template } from './page.ts';

import fsp from 'fs/promises';
import { resolve } from 'path';

import * as date from './date.ts';
import * as path from './path.ts';
import * as parse from './parse.ts';
import { maybe } from './fn.ts';

export type Loader = (root: string) => (file: string) => Promise<PageOptions>;

export const js: Loader = root => async file => {
  try {
    /**
     * Force cache-busting as Node caches ESM imports by default.
     *
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const [raw, stat] = await Promise.all([
      import(`file://${resolve(file)}?${Date.now()}`) as Promise<Record<string, unknown>>,
      fsp.stat(file)
    ]);

    const module = parse.object('default')(raw.default);

    const title = parse.string('title')(module.title);
    const description = maybe(parse.string('description'))(module.description);
    const url = maybe(parse.string('url'))(module.url) ?? path.url(root)(file)(title);
    const ext = maybe(parse.string('ext'))(module.ext);
    const created = date.truncateDay(maybe(parse.date('created'))(module.created) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(parse.date('updated'))(module.updated) ?? stat.mtime);
    const template = maybe(parse.fn<Template>('template'))(module.template);
    const body = maybe(parse.fn<Body>('body'))(module.body);

    return {
      title,
      description,
      ext,
      url,
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template,
      body
    };
  } catch (err) {
    throw new Error(`Failed to load ${file}`, { cause: err });
  }
};

export const md: Loader = root => async file => {
  try {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file, 'utf-8'),
      fsp.stat(file)
    ]);

    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== 'string') throw new Error('Missing metadata');

    const metadata = Object.fromEntries(header.split(/\r?\n/).map(line => line.split(':').map(x => x.trim()))) as Record<string, string>;

    const title = parse.string('title')(metadata.title);
    const description = maybe(parse.string('description'))(metadata.description);
    const url = maybe(parse.string('url'))(metadata.url) ?? path.url(root)(file)(title);
    const ext = maybe(parse.string('ext'))(metadata.ext);
    const created = date.truncateDay(maybe(date.fromString)(maybe(parse.string('created'))(metadata.created)) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(date.fromString)(maybe(parse.string('updated'))(metadata.updated)) ?? stat.mtime);

    return {
      title,
      description,
      url,
      ext,
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template: registry => document => document.body?.(registry) ?? null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, '')
    };
  } catch (err) {
    throw new Error(`Failed to load ${file}`, { cause: err });
  }
};
