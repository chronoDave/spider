import type { Body, Template } from './document.ts';

import fsp from 'fs/promises';

import * as date from './date.ts';
import * as parse from './parse.ts';
import { maybe } from './fn.ts';
import * as modules from './modules.ts';

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
    body: Body | null;
  };
};

export type Loader = (file: string) => Promise<LoaderResult>;

export const js: Loader = async file => {
  const [
    module,
    dependencies
  ] = await Promise.all([
    modules.load(file).then(result => parse.object('default')(result.default)),
    modules.imports(file, new Set())
  ]);

  return {
    dependencies,
    page: {
      title: parse.string('title')(module.title),
      description: maybe(parse.string('description'))(module.description),
      url: maybe(parse.string('url'))(module.url),
      ext: maybe(parse.string('ext'))(module.ext),
      created: maybe(date.truncateDay)(maybe(parse.date('created'))(module.created)),
      updated: maybe(date.truncateDay)(maybe(parse.date('updated'))(module.updated)),
      template: maybe(parse.fn<Template>('template'))(module.template),
      body: maybe(parse.fn<Body>('body'))(module.body)
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
