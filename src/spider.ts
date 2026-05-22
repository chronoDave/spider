import type { Loader } from './lib/loader.ts';

import fsp from 'fs/promises';
import path from 'path';

import Page from './lib/page.ts';
import Registry from './lib/registry.ts';
import * as loader from './lib/loader.ts';

export type { Loader } from './lib/loader.ts';
export type { Node } from './lib/registry.ts';
export type {
  Template,
  Body,
  Draft,
  PageOptions
} from './lib/page.ts';
export { Page, Registry };

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
  readonly #pages: Map<string, Page>;
  readonly #exclude: string[];
  readonly #dirout: string | null;
  readonly #root: string;
  readonly #loaders: Map<string, ReturnType<Loader>>;

  constructor(options: SpiderOptions) {
    this.#files = options.files;
    this.#pages = new Map();
    this.#root = options.root ?? process.cwd();
    this.#exclude = options.exclude ?? [];
    this.#dirout = options.dirout ?? null;

    this.#loaders = new Map();
    this.#loaders.set('.js', loader.js(this.#root));
    this.#loaders.set('.ts', loader.js(this.#root));
    this.#loaders.set('.md', loader.md(this.#root));
    if (options.loader) Object.entries(loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader(this.#root)));
  }

  /** Write registry to `dirout` */
  async write() {
    if (typeof this.#dirout !== 'string') throw new Error('Failed to write', { cause: new Error('Missing option "dirout"') });

    const registry = new Registry(Array.from(this.#pages.values()));
    for (const node of registry.nodes) {
      await fsp.mkdir(path.join(this.#dirout, node.page.dir), { recursive: true });
      await fsp.writeFile(path.join(this.#dirout, node.page.file), node.page.render(registry));
    }

    return registry;
  }

  /** Load file into registry */
  async load(file: string) {
    const err = (reason: string) => new Error(`Failed to load page "${file}"`, { cause: new Error(reason) });

    const draft = await this.#loaders.get(path.extname(file))?.(file);
    if (!draft) throw err(`Unknown file type "${path.extname(file)}"`);
    if (this.#pages.has(draft.url)) throw err(`Page already exists with url "${draft.url}"`);

    this.#pages.set(draft.url, new Page(draft));
  }

  /** Build project */
  async build() {
    for await (const file of fsp.glob(this.#files, { exclude: this.#exclude })) await this.load(file);

    return this.write();
  }
}

