import type Registry from './registry.ts';
import type { LoaderResult } from './loader.ts';

import path from 'path/posix';

import { maybe } from './fn.ts';
import { slugify } from './string.ts';

export type Template = (registry: Registry) => (page: Page) => string;

export type Body = (registry: Registry) => string;

export type Page = {
  readonly title: string;
  readonly description: string | null;
  readonly url: string;
  readonly created: Date | null;
  readonly updated: Date | null;
  readonly body: Body;
};

export default class Document {
  readonly #template: Template | null;

  readonly file: string;
  readonly page: Page;

  /**
   * Create document file path
   *
   * - `/` + `index` => `/index.html`
   * - `/` + `about` => `/about/index.html`
   * - `/` + `about.html` => `/about.html`
   * - `/` + `about.xml` => `/about.xml`
   * - `/about` + `index` => `/about/index.html`
   * - `/about` + `me` => `/about/me/index.html`
   * - `/about` + `about` => `/about/index.html`
   * - `/about` + `about.html` => `/about/about.html`
   * - `/about` + `about.xml` => `/about/about.xml`
   */
  static file(dir: string, result: LoaderResult) {
    const ext = result.ext ?? (maybe(path.parse)(result.url)?.ext || null);
    const name = maybe(path.parse)(result.url)?.name ?? slugify(result.title);

    return path.normalize(path.format({
      dir: ext || name === 'index' || dir.endsWith(name) ?
        dir :
        path.join(dir, name),
      name: ext ? name : 'index',
      ext: ext ?? '.html'
    }));
  }

  /**
   * Create document url
   *
   * - `/` + `index` => `/`
   * - `/` + `about` => `/about/`
   * - `/` + `about.html` => `/about`
   * - `/` + `about.xml` => `/about.xml`
   * - `/about` + `index` => `/about/`
   * - `/about` + `me` => `/about/me/`
   * - `/about` + `about` => `/about/`
   * - `/about` + `about.html` => `/about/about`
   * - `/about` + `about.xml` => `/about/about.xml`
   */
  static url(file: string, result: LoaderResult) {
    let url = result.url ?? file;

    const { ext, dir, name } = path.parse(file);
    if (ext === '.html') url = path.join(dir, name === 'index' ? '/' : name);

    return url;
  }

  constructor(root: string, result: LoaderResult) {
    this.#template = result.template;

    this.file = Document.file(root, result);
    this.page = {
      title: result.title,
      description: result.description,
      url: Document.url(this.file, result),
      created: result.created,
      updated: result.updated,
      body: result.body
    };
  }

  render(registry: Registry) {
    return this.#template?.(registry)(this.page) ?? this.page.body(registry);
  }
}

