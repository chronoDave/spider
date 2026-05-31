import type { Body, Template } from './document.ts';

import fsp from 'fs/promises';
import path from 'path';

import * as date from './date.ts';
import * as parse from './parse.ts';
import { maybe } from './fn.ts';

export type Draft = {
  title: string;
  description: string | null;
  url: string | null;
  ext: string | null;
  created: Date;
  updated: Date | null;
  template: Template | null;
  body: Body;
};

export type Loader = (file: string) => Promise<Draft>;

export const js: Loader = async file => {
  try {
    /**
     * Force cache-busting as Node caches ESM imports by default.
     *
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const [raw, stat] = await Promise.all([
      import(`file://${path.resolve(file)}?${Date.now()}`) as Promise<Record<string, unknown>>,
      fsp.stat(file)
    ]);

    const module = parse.object('default')(raw.default);
    const created = date.truncateDay(maybe(parse.date('created'))(module.created) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(parse.date('updated'))(module.updated) ?? stat.mtime);

    return {
      title: parse.string('title')(module.title),
      description: maybe(parse.string('description'))(module.description),
      url: maybe(parse.string('url'))(module.url),
      ext: maybe(parse.string('ext'))(module.ext),
      created,
      updated: updated.getTime() !== created.getTime() ? updated : null,
      template: maybe(parse.fn<Template>('template'))(module.template),
      body: parse.fn<Body>('body')(module.body)
    };
  } catch (err) {
    throw new Error(`Failed to load ${file}`, { cause: err });
  }
};

export const md: Loader = async file => {
  try {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file, 'utf-8'),
      fsp.stat(file)
    ]);

    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== 'string') throw new Error('Missing metadata');

    const metadata = Object.fromEntries(header.split(/\r?\n/).map(line => line.split(':').map(x => x.trim()))) as Record<string, string>;
    const created = date.truncateDay(maybe(date.fromString)(maybe(parse.string('created'))(metadata.created)) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(date.fromString)(maybe(parse.string('updated'))(metadata.updated)) ?? stat.mtime);

    return {
      title: parse.string('title')(metadata.title),
      description: maybe(parse.string('description'))(metadata.description),
      url: maybe(parse.string('url'))(metadata.url),
      ext: maybe(parse.string('ext'))(metadata.ext),
      created,
      updated: updated.getTime() !== created.getTime() ? updated : null,
      template: null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, '')
    };
  } catch (err) {
    throw new Error(`Failed to load ${file}`, { cause: err });
  }
};
