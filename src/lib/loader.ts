import type { Body, Template } from './document.ts';

import fsp from 'fs/promises';
import path from 'path';

import * as date from './date.ts';
import * as parse from './parse.ts';
import { maybe } from './fn.ts';
import modules from './modules.ts';

export type LoaderResult = {
  dependencies: Set<string>;
  page: {
    title: string;
    description: string | null;
    url: string | null;
    ext: string | null;
    created: Date | null;
    updated: Date | null;
    template: Template | null;
    body: Body;
  };
};

export type Loader = (file: string) => Promise<LoaderResult>;

export const js: Loader = async file => {
  /**
   * TODO, nested imports don't get their cache busted,
   * meaning this fails when dependencies get updated.
   *
   * Solution is to spawn single-use worker threads, so
   * there's no cache at all.
   */

  /**
   * Force cache-busting as Node caches ESM imports by default.
   *
   * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
   */
  const raw = await import(`file://${path.resolve(file)}`) as Record<string, unknown>;
  const draft = parse.object('default')(raw.default);

  return {
    dependencies: await modules(path.resolve(file))(await fsp.readFile(file, 'utf-8')),
    page: {
      title: parse.string('title')(draft.title),
      description: maybe(parse.string('description'))(draft.description),
      url: maybe(parse.string('url'))(draft.url),
      ext: maybe(parse.string('ext'))(draft.ext),
      created: maybe(date.truncateDay)(maybe(parse.date('created'))(draft.created)),
      updated: maybe(date.truncateDay)(maybe(parse.date('updated'))(draft.updated)),
      template: maybe(parse.fn<Template>('template'))(draft.template),
      body: parse.fn<Body>('body')(draft.body)
    }
  };
};

export const md: Loader = async file => {
  const raw = await fsp.readFile(file, 'utf-8');

  const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
  if (typeof header !== 'string') throw new Error('Missing metadata');

  const metadata = Object.fromEntries(header.split(/\r?\n/).map(line => line.split(':').map(x => x.trim()))) as Record<string, string>;

  return {
    dependencies: new Set(),
    page: {
      title: parse.string('title')(metadata.title),
      description: maybe(parse.string('description'))(metadata.description),
      url: maybe(parse.string('url'))(metadata.url),
      ext: maybe(parse.string('ext'))(metadata.ext),
      created: maybe(date.truncateDay)(maybe(date.fromString)(maybe(parse.string('created'))(metadata.created))),
      updated: maybe(date.truncateDay)(maybe(date.fromString)(maybe(parse.string('updated'))(metadata.updated))),
      template: null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, '')
    }
  };
};
