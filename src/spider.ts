import type { Loader, Draft } from './lib/loader.ts';
import type { Document, Template, Body } from './lib/document.ts';
import type { Node, Tree } from './lib/array.ts';

import path from 'path';
import fsp from 'fs/promises';

import * as loader from './lib/loader.ts';
import * as url from './lib/url.ts';
import * as document from './lib/document.ts';
import * as string from './lib/string.ts';
import Registry from './lib/registry.ts';

export type {
  Loader,
  Draft,
  Document,
  Template,
  Body,
  Node,
  Tree
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
  /** Supports [Node globs](https://github.com/isaacs/minimatch#features) */
  entryPoints: string[];
  /** Supports [Node globs](https://github.com/isaacs/minimatch#features) */
  exclude?: string[];
  /** Output directory */
  outdir?: string;
  /** Base directory */
  root?: string;
  /** File loaders */
  loader?: Record<string, Loader>;
};

export default class Spider {
  readonly #entryPoints: string[];
  readonly #exclude: string[];
  readonly #root: string;
  readonly #outdir: string | null;
  readonly #loaders: Map<string, Loader>;
  readonly #cache: {
    dirty: boolean;
    documents: Map<string, Document>;
    registry: Registry;
  };

  get #registry(): Registry {
    if (!this.#cache.dirty) return this.#cache.registry;

    const depth = string.count('/');
    const docs = Array.from(this.#cache.documents.values())
      .sort((a, b) => {
        if (depth(a.url) === depth(b.url)) return a.url.localeCompare(b.url);
        return depth(a.url) - depth(b.url);
      });

    this.#cache.registry = new Registry(docs);
    this.#cache.dirty = false;

    return this.#cache.registry;
  }

  constructor(options: SpiderOptions) {
    this.#entryPoints = options.entryPoints;
    this.#exclude = options.exclude ?? [];
    this.#root = typeof options.root === 'string' ?
      path.normalize(options.root) :
      process.cwd();
    this.#outdir = options.outdir ?? null;

    this.#loaders = new Map();
    this.#loaders.set('.js', loader.js);
    this.#loaders.set('.ts', loader.js);
    this.#loaders.set('.md', loader.md);
    if (options.loader) Object.entries(options.loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));

    this.#cache = {
      documents: new Map(),
      registry: new Registry([]),
      dirty: false
    };
  }

  /** Load file */
  async load(file: string, force?: boolean): Promise<Document> {
    try {
      const draft = await this.#loaders.get(path.extname(file))?.(file);
      if (!draft) throw new Error(`Unknown file type "${path.extname(file)}"`);

      if (typeof draft.url !== 'string') draft.url = url.create(url.dirrel(this.#root)(file))(draft.title);
      if (typeof draft.ext === 'string') draft.url = url.ext(draft.url)(draft.ext);
      if (!force && this.#cache.documents.has(draft.url)) throw new Error(`Page already exists with url "${draft.url}"`);

      this.#cache.documents.set(draft.url, draft as Document);
      this.#cache.dirty = true;

      return draft as Document;
    } catch (cause) {
      throw new Error(`Failed to load page "${file}"`, { cause });
    }
  }

  /** Write documents to `outdir` */
  async write() {
    if (typeof this.#outdir !== 'string') return;

    for (const doc of this.#cache.documents.values()) {
      try {
        const file = path.join(this.#outdir, document.file(doc.url));

        await fsp.mkdir(path.dirname(file), { recursive: true });
        await fsp.writeFile(file, document.render(this.#registry)(doc));
      } catch (cause) {
        throw new Error(`Failed to write document "${doc.url}"`, { cause });
      }
    }
  }

  async build() {
    try {
      for await (const file of fsp.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file);
      await this.write();

      return this.#cache.documents;
    } catch (cause) {
      throw new Error('Failed to build', { cause });
    }
  }

  async watch() {
    await this.build();

    const ac = new AbortController();
    const watcher = fsp.watch(this.#root, {
      recursive: true,
      ignore: this.#exclude,
      signal: ac.signal
    });

    for await (const event of watcher) {
      if (typeof event.filename !== 'string') return;

      const file = path.join(this.#root, event.filename);
      await this.load(file, true);
      await this.write();
    }

    return () => ac.abort();
  }
}
