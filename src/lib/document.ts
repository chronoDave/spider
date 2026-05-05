import path from 'path';

import * as string from './string.ts';

export type Template = (registry: Map<string, Document>) => (body: string) => string;

export type Page = {
  title: string;
  description?: string;
  ext?: string;
  url?: string;
  created?: string;
  updated?: string;
  template: Template;
  body: (registry: Map<string, Document>) => string;
};

export type DocumentOptions = {
  title: string;
  description: string | null;
  ext: string;
  url: string;
  created: Date;
  updated: Date | null;
  template: Template;
  body: (registry: Map<string, Document>) => string;
};

export default class Document {
  readonly title: string;
  readonly description: string | null;
  readonly url: string;
  readonly created: Date;
  readonly updated: Date | null;
  readonly body: (registry: Map<string, Document>) => string;
  readonly #template: (registry: Map<string, Document>) => (body: string) => string;
  readonly #ext: string;

  constructor(options: DocumentOptions) {
    this.#template = options.template;
    this.#ext = options.ext;

    this.title = options.title;
    this.description = options.description;
    this.url = options.url;
    this.created = options.created;
    this.updated = options.updated;
    this.body = options.body;
  }

  /** Return page level */
  get level(): number {
    return string.count('/')(this.url);
  }

  /** Return file directory */
  get dir(): string {
    return path.dirname(this.file);
  }

  /** Return file url */
  get file(): string {
    let url = this.url;
    if (url.endsWith('/')) url = `${url}index`;

    return `${url}${this.#ext}`;
  }

  /** Render page (template + body) */
  render(registry: Map<string, Document>): string {
    return this.#template(registry)(this.body(registry));
  }
}
