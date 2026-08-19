import type Registry from './registry.ts';
import type { LoaderResult } from './loader.ts';

import path from 'path/posix';

import * as string from './string.ts';

export type Template = (registry: Registry) => (page: Page) => string;

export type Body = (registry: Registry) => string;

export type Page = {
  readonly title: string;
  readonly description: string | null;
  readonly url: string;
  readonly created: Date | null;
  readonly updated: Date | null;
  readonly body: Body | null;
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
  static file(root: string, result: LoaderResult) {
    if (typeof result.page.url === 'string') {
      const { dir, name, ext } = path.parse(result.page.url);

      if (result.page.url.endsWith('/')) {
        return path.normalize(path.format({
          dir: path.join(dir, name),
          name: 'index',
          ext: 'html'
        }));
      }

      return path.normalize(path.format({
        dir,
        name: string.maybe(name) ?? 'index',
        ext: string.maybe(ext) ?? 'html'
      }));
    }

    const ext = result.page.ext ?? '.html';
    const name = string.slugify(result.page.title);

    let dir = path.join(root, name);
    if (
      typeof result.page.ext === 'string' ||
      name === 'index' || // Prevent index/index
      root.endsWith(name) // Prevent dir/dir/index
    ) dir = root;

    return path.normalize(path.format({
      dir,
      name: typeof result.page.ext === 'string' ?
        name :
        'index',
      ext
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
    if (typeof result.page.url === 'string') {
      if (result.page.url.endsWith('.html')) return result.page.url.replace(/\.html$/, '');
      return result.page.url;
    }

    const { ext, dir, name } = path.parse(file);
    if (ext === '.html') return path.join(dir, name === 'index' ? '/' : name);

    return file;
  }

  constructor(dir: string, result: LoaderResult) {
    this.#template = result.page.template;

    this.file = Document.file(dir, result);
    this.page = {
      title: result.page.title,
      description: result.page.description,
      url: Document.url(this.file, result),
      created: result.page.created,
      updated: result.page.updated,
      body: result.page.body
    };
  }

  render(registry: Registry): string {
    return this.#template?.(registry)(this.page) ?? this.page.body?.(registry) ?? '';
  }
}

