import type { Loader, Draft } from './lib/loader.ts';
import type { Document, Template, Body } from './lib/document.ts';

import fsp from 'fs/promises';
import path from 'path';

import Registry from './lib/registry.ts';
import * as loader from './lib/loader.ts';
import * as document from './lib/document.ts';
import * as url from './lib/url.ts';

export type {
  Loader,
  Draft,
  Document,
  Template,
  Body
};

export { Registry, loader };

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
    if (options.loader) Object.entries(options.loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));
  }

  /** Write registry to `dirout` */
  async write() {
    let file: string | null = null;

    try {
      if (typeof this.#dirout !== 'string') throw new Error('Missing option "dirout"');

      const registry = new Registry(Array.from(this.#documents.values()));
      for (const node of registry.list) {
        file = document.file(node.value.url);

        await fsp.mkdir(path.dirname(path.join(this.#dirout, file)), { recursive: true });
        await fsp.writeFile(path.join(this.#dirout, file), document.render(registry)(node.value));
      }

      return registry;
    } catch (cause) {
      throw new Error(`Failed to write ${file ?? ''}`, { cause });
    }
  }

  /** Load file into registry */
  async load(file: string): Promise<Document> {
    try {
      const draft = await this.#loaders.get(path.extname(file))?.(file);
      if (!draft) throw new Error(`Unknown file type "${path.extname(file)}"`);

      if (typeof draft.url !== 'string') draft.url = url.create(url.dirrel(this.#root)(file))(draft.title);
      if (typeof draft.ext === 'string') draft.url = url.ext(draft.url)(draft.ext);
      if (this.#documents.has(draft.url)) throw new Error(`Page already exists with url "${draft.url}"`);

      this.#documents.set(draft.url, draft as Document);

      return draft as Document;
    } catch (cause) {
      throw new Error(`Failed to load page "${file}"`, { cause });
    }
  }

  /** Build project */
  async build() {
    try {
      for await (const file of fsp.glob(this.#files, { exclude: this.#exclude })) await this.load(file);

      return await this.write();
    } catch (cause) {
      throw new Error('Failed to build', { cause });
    }
  }
}

