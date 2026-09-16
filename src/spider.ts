import type { Loader, LoaderResult } from './lib/loader.ts';
import type { Template, Body, Page } from './lib/document.ts';
import type { Node } from './lib/registry.ts';

import path from 'path';
import fsp from 'fs/promises';

import Document from './lib/document.ts';
import registry from './lib/registry.ts';
import { relative } from './lib/url.ts';
import { debounce } from './lib/fn.ts';
import * as loader from './lib/loader.ts';

export type {
  Loader,
  LoaderResult,
  Document,
  Template,
  Body,
  Page,
  Node
};

export { loader };

export type Draft = {
  title: string;
  description?: string;
  url?: string;
  ext?: string;
  created?: Date;
  updated?: Date;
  template?: Template;
  body?: Body;
};

export type PluginWritePayload = {
  html: string;
  page: Page;
  file: string;
};

export type Plugin = {
  /** Plugin name */
  name: string;
  /** Called after rendering document. This function is called even if `outdir` is not provided. */
  write?: (payload: PluginWritePayload) => string | Promise<string>;
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
  /** Plugins */
  plugins?: Plugin[];
};

export type WriteResult = {
  file: string;
  html: string;
};

export default class Spider {
  readonly #entryPoints: string[];
  readonly #exclude: string[];
  readonly #root: string;
  readonly #outdir: string | null;
  readonly #loaders: Map<string, Loader>;
  readonly #plugins: Plugin[];
  readonly #cache: {
    dirty: boolean;
    documents: Map<string, Document>;
    dependencies: Map<string, Set<string>>; // { entry: dependencies[] }
    registry: Map<string, Node>;
  };

  get #registry(): Map<string, Node> {
    if (!this.#cache.dirty) return this.#cache.registry;

    const pages: Page[] = [];
    for (const document of this.#cache.documents.values()) pages.push(document.page);

    this.#cache.registry = registry(pages);
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
    this.#plugins = options.plugins ?? [];

    this.#loaders = new Map();
    this.#loaders.set('.js', loader.js);
    this.#loaders.set('.ts', loader.js);
    if (options.loader) Object.entries(options.loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));

    this.#cache = {
      documents: new Map(),
      registry: registry([]),
      dependencies: new Map(),
      dirty: false
    };
  }

  /**
   * Load file
   *
   * @param file Input file, must default export a `Draft`
   * @param force If true, overwrites cached entry
   */
  async load(file: string, force?: boolean): Promise<Document> {
    try {
      const result = await this.#loaders.get(path.extname(file))?.(file);
      if (!result) throw new Error(`Unknown file type "${path.extname(file)}"`);

      const document = new Document(relative(this.#root)(file), result);
      if (!force && this.#cache.documents.has(document.page.url)) throw new Error(`Page already exists with url "${document.page.url}"`);

      this.#cache.documents.set(document.page.url, document);
      this.#cache.dependencies.set(file, result.dependencies);
      this.#cache.dirty = true;

      return document;
    } catch (cause) {
      throw new Error(`Failed to load "${file}"`, { cause });
    }
  }

  /** Render document and write to `outdir` if `outdir` is set */
  async write(): Promise<WriteResult[]> {
    const results: WriteResult[] = [];

    for (const document of this.#cache.documents.values()) {
      try {
        const html = await this.#plugins.reduce<string | Promise<string>>(async (acc, cur) => {
          try {
            const next = await acc;

            if (!cur.write) return next;
            return await cur.write({
              html: next,
              page: document.page,
              file: document.file
            });
          } catch (cause) {
            throw new Error(`Failed to call write on plugin "${cur.name}"`, { cause });
          }
        }, document.render(this.#registry));

        if (typeof this.#outdir !== 'string') {
          results.push({ file: document.file, html });

          continue;
        }

        const file = path.join(this.#outdir, document.file);

        await fsp.mkdir(path.dirname(file), { recursive: true });
        await fsp.writeFile(file, html);
      } catch (cause) {
        throw new Error(`Failed to write document "${document.file}"`, { cause });
      }
    }

    return results;
  }

  /** Find all files in `entryPoints`, loads and writes to `outdir` */
  async build() {
    try {
      for await (const file of fsp.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file);

      return {
        documents: this.#cache.documents,
        outputFiles: await this.write()
      };
    } catch (cause) {
      throw new Error('Failed to build', { cause });
    }
  }

  /**
   * Watch `entryPoints` and dependencies. Calls `build` on file changes.
   *
   * **Note**: Files that exist outside the working directly do not trigger a build.
   *
   * **Note**: Some systems may send duplicate events.
   *
   * **Note**: Due to Node's [limitations](https://github.com/nodejs/node/issues/49442#issuecomment-1894620232), every file change will
   * increase memory usage. It is not recommended to run `watch` for extended periods of time.
   *
   * @see https://nodejs.org/api/fs.html#caveats
   *
   * @param n Event debounce rate, default `100`
   */
  async watch(n?: number) {
    await this.build();

    const ac = new AbortController();
    const watcher = fsp.watch(process.cwd(), {
      recursive: true,
      signal: ac.signal
    });

    const rebuild = debounce(n ?? 100)(async (file: string) => {
      for (const [page, dependencies] of this.#cache.dependencies.entries()) {
        if (page !== file && !dependencies.has(file)) continue;

        await this.load(page, true);
        await this.write();
      }
    });

    const task = (async () => {
      try {
        for await (const event of watcher) {
          if (
            event.eventType === 'rename' ||
            typeof event.filename !== 'string'
          ) continue;

          rebuild(event.filename);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        throw err;
      }
    })();

    return async () => {
      ac.abort();

      await task;
    };
  }
}
