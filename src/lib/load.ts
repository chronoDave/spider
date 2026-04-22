import type { PageOptions } from './page.ts';

import fsp from 'fs/promises';
import { resolve } from 'path';

import * as date from './date.ts';
import * as path from './path.ts';
import * as parse from './parse.ts';
import { maybe } from './fn.ts';
import Page from './page.ts';

export const js = (root: string) =>
  async (file: string): Promise<Page> => {
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
    const url = maybe(parse.string('url'))(module.url);
    const created = date.truncateDay(maybe(date.fromString)(maybe(parse.string('created'))(module.created)) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(date.fromString)(maybe(parse.string('updated'))(module.updated)) ?? stat.mtime);
    const template = parse.fn<PageOptions['template']>('template')(module.template);
    const body = parse.fn<PageOptions['body']>('body')(module.body);

    return new Page({
      title,
      description,
      url: url ?? path.url(root)(file)(title),
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template,
      body
    });
  };

export const md = (root: string) =>
  async (file: string): Promise<Page> => {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file, 'utf-8'),
      fsp.stat(file)
    ]);

    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== 'string') throw new Error('Missing metadata');

    const metadata = Object.fromEntries(header.split(/\r?\n/).map(line => line.split(':').map(x => x.trim()))) as Record<string, string>;

    const title = parse.string('title')(metadata.title);
    const description = maybe(parse.string('description'))(metadata.description);
    const url = maybe(parse.string('url'))(metadata.url);
    const created = date.truncateDay(maybe(date.fromString)(maybe(parse.string('created'))(metadata.created)) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(date.fromString)(maybe(parse.string('updated'))(metadata.updated)) ?? stat.mtime);

    return new Page({
      title,
      description,
      url: url ?? path.url(root)(file)(title),
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template: () => () => '',
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, '')
    });
  };
