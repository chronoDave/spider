import path from 'path';
import fsp from 'fs/promises';
import r from 'runtypes';

import { slugify } from './string.ts';
import * as date from './date.ts';
import * as p from './path.ts';
import { maybe } from './fn.ts';

export type Template = (registry: Map<string, Draft>) => (body: string) => string;

export type Draft = {
  title: string;
  description: string | null;
  /** Relative URL */
  url: string;
  /** Truncted to day */
  created: Date;
  /** Truncted to day */
  updated: Date | null;
  template: Template;
  body: (registry: Map<string, Draft>) => string;
};

const page = r.Record({
  title: r.String,
  description: r.String.optional(),
  url: r.String.optional(),
  created: r.String.optional(),
  updated: r.String.optional(),
  template: r.Function.optional(),
  body: r.Function
});

export type Page = Omit<r.Static<typeof page>, 'template' | 'body'> & {
  template: Template;
  body: (registry: Map<string, Draft>) => string;
};

export const js = (root: string) =>
  async (file: string): Promise<Draft> => {
    /**
     * Force cache-busting as Node caches ESM imports by default.
     *
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const [raw, stat] = await Promise.all([
      import(`file://${path.resolve(file)}?${Date.now()}`) as Promise<Record<string, unknown>>,
      fsp.stat(file)
    ]);

    /**
     * Force type conversion as functions cannot be validated statically:
     *
     * @see https://github.com/runtypes/runtypes/issues/250#issuecomment-833899333
     */
    const { default: module } = r.Record({ default: page }).check(raw) as { default: Page };

    const created = date.truncateDay(maybe(date.fromString)(module.created) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(date.fromString)(module.updated) ?? stat.mtime);

    return {
      title: module.title,
      description: module.description ?? null,
      url: module.url ?? path.posix.join(p.rel(root)(path.dirname(file)), slugify(module.title)),
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template: module.template,
      body: module.body
    };
  };

export const md = (root: string) =>
  async (file: string): Promise<Draft> => {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file, 'utf-8'),
      fsp.stat(file)
    ]);

    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== 'string') throw new Error('Missing metadata');

    const metadata = r.Record({
      title: r.String,
      url: r.String.optional(),
      description: r.String.optional(),
      created: r.String.optional(),
      updated: r.String.optional()
    }).check(Object.fromEntries(header.split(/\r?\n/).map(line => line.split(':').map(x => x.trim()))));

    const created = date.truncateDay(maybe(date.fromString)(metadata.created) ?? stat.birthtime);
    const updated = date.truncateDay(maybe(date.fromString)(metadata.updated) ?? stat.mtime);

    return {
      title: metadata.title,
      description: metadata.description ?? null,
      url: metadata.url ?? path.posix.join(p.rel(root)(path.dirname(file)), slugify(metadata.title)),
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template: () => body => body,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, '')
    };
  };
