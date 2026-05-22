import type Registry from './registry.ts';

import path from 'path';

import * as string from './string.ts';

export type Template = (registry: Registry) => (page: Page) => string | null;

export type Body = (registry: Registry) => string | null;

export type Draft = {
  title: string;
  description?: string;
  ext?: string;
  url?: string;
  created?: string;
  updated?: string;
  template?: Template;
  body?: Body;
};

export type PageOptions = {
  title: string;
  description: string | null;
  ext: string;
  url: string;
  created: Date;
  updated: Date | null;
  template: Template | null;
  body: Body | null;
};

export default class Page {
  readonly title: string;
  readonly description: string | null;
  readonly ext: string;
  readonly url: string;
  readonly created: Date;
  readonly updated: Date | null;
  readonly body: Body | null;
  readonly template: Template | null;
  readonly file: string;
  readonly dir: string;
  readonly depth: number;

  constructor(options: PageOptions) {
    this.title = options.title;
    this.description = options.description;
    this.ext = options.ext;
    this.url = options.url;
    this.created = options.created;
    this.updated = options.updated;
    this.body = options.body;
    this.template = options.template;

    this.file = this.url;
    if (this.file.endsWith('/')) this.file = `${this.file}index`;
    this.file = `${this.file}${this.ext}`;

    this.dir = path.dirname(this.file);
    this.depth = this.url === '/' ? 0 : string.count('/')(this.file);
  }

  render(registry: Registry): string {
    return this.template?.(registry)(this) ?? '';
  }
}
