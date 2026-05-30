import type { Loader, Draft } from './lib/loader.ts';
import type { Document, Template, Body } from './lib/document.ts';

import fsp from 'fs/promises';
import path from 'path';

import Registry from './lib/registry.ts';
import * as loader from './lib/loader.ts';
import * as document from './lib/document.ts';
import { relative } from './lib/url.ts';

export type { Node } from './lib/registry.ts';
export type {
  Loader,
  Draft,
  Document,
  Template,
  Body
};

export { Registry };

export type Page = {
  title: string;
  description?: string;
  url?: string;
  ext?: string;
  created?: Date;
  updated?: Date;
  template?: Template;
  body: Body;
};

export type SpiderOptions = {
  /** File globs */
  files: string[];
  /** Filter out files / directories using glob patterns from src */
  exclude?: string[];
  /** Base directory */
  root?: string;
  /** Output directory. If empty, does not write files */
  dirout?: string;
  /** File loaders */
  loader?: Record<string, Loader>;
};

export default class Spider {
  readonly #files: string[];
  readonly #documents: Map<string, Document>;
  readonly #exclude: string[];
  readonly #dirout: string | null;
  readonly #root: string;
  readonly #loaders: Map<string, Loader>;

  constructor(options: SpiderOptions) {
    this.#files = options.files;
    this.#documents = new Map();
    this.#root = typeof options.root === 'string' ?
      path.normalize(options.root) :
      process.cwd();
    this.#exclude = options.exclude ?? [];
    this.#dirout = options.dirout ?? null;

    this.#loaders = new Map();
    this.#loaders.set('.js', loader.js);
    this.#loaders.set('.ts', loader.js);
    this.#loaders.set('.md', loader.md);
    if (options.loader) Object.entries(loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));
  }

  /** Write registry to `dirout` */
  async write() {
    if (typeof this.#dirout !== 'string') throw new Error('Failed to write', { cause: new Error('Missing option "dirout"') });

    const registry = new Registry(Array.from(this.#documents.values()));
    for (const node of registry.nodes) {
      const file = document.file(node.url)(node.ext);

      await fsp.mkdir(path.dirname(path.join(this.#dirout, file)), { recursive: true });
      await fsp.writeFile(path.join(this.#dirout, file), document.render(registry)(node));
    }

    return registry;
  }

  /** Load file into registry */
  async load(file: string) {
    try {
      const draft = await this.#loaders.get(path.extname(file))?.(file);
      if (!draft) throw new Error(`Unknown file type "${path.extname(file)}"`);

      let url = draft.url;
      if (typeof url !== 'string') url = document.url(relative(this.#root)(file))(draft.title);
      const id = document.file(url)(draft.ext);
      if (this.#documents.has(id)) throw new Error(`Page already exists with file "${id}"`);

      this.#documents.set(id, {
        title: draft.title,
        description: draft.description,
        url,
        ext: draft.ext,
        created: draft.created,
        updated: draft.updated,
        template: draft.template,
        body: draft.body
      });
    } catch (cause) {
      throw new Error(`Failed to load page "${file}"`, { cause });
    }
  }

  /** Build project */
  async build() {
    for await (const file of fsp.glob(this.#files, { exclude: this.#exclude })) await this.load(file);

    return this.write();
  }
}

