var __defProp = Object.defineProperty;
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};

// src/spider.ts
import path5 from "path";
import fsp3 from "fs/promises";

// src/lib/document.ts
import path from "path/posix";

// src/lib/fn.ts
var maybe = (fn2) => (x) => {
  if (x === null || x === void 0) return null;
  return fn2(x);
};

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();
var count = (c) => (x) => {
  let n = 0;
  for (let i = 0; i < x.length; i += 1) {
    if (x.slice(i, i + c.length) === c) n += 1;
  }
  return n;
};

// src/lib/document.ts
var Document = class _Document {
  #template;
  file;
  page;
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
  static file(dir, result) {
    const ext = result.page.ext ?? (maybe(path.parse)(result.page.url)?.ext || null);
    const name = maybe(path.parse)(result.page.url)?.name ?? slugify(result.page.title);
    return path.normalize(path.format({
      dir: ext || name === "index" || dir.endsWith(name) ? dir : path.join(dir, name),
      name: ext ? name : "index",
      ext: ext ?? ".html"
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
  static url(file, result) {
    let url = result.page.url ?? file;
    const { ext, dir, name } = path.parse(file);
    if (ext === ".html") url = path.join(dir, name === "index" ? "/" : name);
    return url;
  }
  constructor(dir, result) {
    this.#template = result.page.template;
    this.file = _Document.file(dir, result);
    this.page = {
      title: result.page.title,
      description: result.page.description,
      url: _Document.url(this.file, result),
      created: result.page.created,
      updated: result.page.updated,
      body: result.page.body
    };
  }
  render(registry) {
    return this.#template?.(registry)(this.page) ?? this.page.body(registry);
  }
};

// src/lib/array.ts
var tree = (arr) => (parent) => {
  const flat = [];
  const nested = [];
  for (const x of arr) {
    const node = { parent: parent(x, nested), children: [], value: x };
    flat.push(node);
    if (node.parent) {
      node.parent.children.push(node);
    } else {
      nested.push(node);
    }
  }
  return { flat, nested };
};

// src/lib/registry.ts
var Registry = class {
  #map;
  #tree;
  constructor(pages) {
    this.#tree = tree(pages)((page, tree2) => {
      let current = null;
      const dirs = page.url.split("/").filter(Boolean);
      for (let i = 0; i < dirs.length; i += 1) {
        const url = i === 0 ? "/" : `/${dirs.slice(0, i).join("/")}/`;
        const parent = (current?.children ?? tree2).find((node) => node.value.url === url) ?? null;
        if (parent) current = parent;
      }
      return current;
    });
    this.#map = new Map(this.#tree.flat.map((node) => [node.value.url, node]));
  }
  get list() {
    return this.#tree.flat;
  }
  get tree() {
    return this.#tree.nested;
  }
  get(url) {
    return this.#map.get(url) ?? null;
  }
};

// src/lib/url.ts
import path2 from "path";
var relative = (from) => (to) => {
  const rel = path2.posix.relative(
    from.replaceAll(path2.sep, path2.posix.sep),
    to.replaceAll(path2.sep, path2.posix.sep)
  );
  return `/${rel.length === 0 ? rel : path2.dirname(rel)}`;
};

// src/lib/loader.ts
var loader_exports = {};
__export(loader_exports, {
  js: () => js,
  md: () => md
});
import fsp2 from "fs/promises";
import path4 from "path";
import os from "os";
import { pathToFileURL as pathToFileURL2 } from "url";

// src/lib/date.ts
var truncateDay = (x) => {
  x.setUTCHours(0, 0, 0, 0);
  return x;
};
var fromString = (x) => {
  const date2 = new Date(x);
  if (Number.isNaN(date2.getTime())) throw new Error("Invalid date string");
  return date2;
};

// src/lib/parse.ts
var err = (label) => (expected) => (actual) => new Error(`Failed to parse "${label}"`, {
  cause: new Error(`Expected "${expected}", got "${actual}"`)
});
var string = (label) => (x) => {
  if (typeof x !== "string") throw err(label)("string")(typeof x);
  return x;
};
var fn = (label) => (x) => {
  if (typeof x !== "function") throw err(label)("function")(typeof x);
  return x;
};
var object = (label) => (x) => {
  const errObj = err(label)("object");
  if (typeof x !== "object") throw errObj(typeof x);
  if (x === null) throw errObj("null");
  if (Array.isArray(x)) throw errObj("array");
  return x;
};
var date = (label) => (x) => {
  if (!(x instanceof Date)) throw err(label)("Date")(typeof x);
  return x;
};

// src/lib/modules.ts
import path3 from "path";
import fsp from "fs/promises";
import { createRequire } from "module";
import { pathToFileURL } from "url";
var imports = (root) => (raw) => Array.from(raw.matchAll(/import\s+[^'"]+.(.+)['"]/g)).filter((match) => match[1].startsWith(".")).map((match) => path3.join(path3.dirname(root), match[1]));
var bust = async (file) => {
  const raw = await fsp.readFile(file, "utf-8");
  return raw.replaceAll(
    /(import\s+[^'"]+.)(.+)(['"])/g,
    (_, p1, p2, p3) => {
      const require2 = createRequire(path3.resolve(file));
      const absolute = pathToFileURL(require2.resolve(p2)).href;
      if (p2.startsWith(".")) return `${p1}${absolute}?${crypto.randomUUID()}${p3}`;
      return `${p1}${absolute}${p3}`;
    }
  );
};
var all = (root) => async (raw) => {
  const stack = imports(root)(raw);
  const cache = new Set(stack);
  while (stack.length > 0) {
    const file = stack.pop();
    if (typeof file !== "string") throw new Error("Empty stack");
    const raw2 = await fsp.readFile(file, "utf-8");
    for (const result of imports(file)(raw2)) {
      cache.add(result);
      if (!cache.has(result)) stack.push(result);
    }
  }
  return cache;
};

// src/lib/loader.ts
var js = async (file) => {
  const id = crypto.randomUUID();
  const tmp = path4.join(os.tmpdir(), `${id}.ts`);
  await fsp2.writeFile(tmp, await bust(file));
  const raw = await import(pathToFileURL2(tmp).href);
  await fsp2.rm(tmp);
  const draft = object("default")(raw.default);
  return {
    dependencies: await all(path4.resolve(file))(await fsp2.readFile(file, "utf-8")),
    page: {
      title: string("title")(draft.title),
      description: maybe(string("description"))(draft.description),
      url: maybe(string("url"))(draft.url),
      ext: maybe(string("ext"))(draft.ext),
      created: maybe(truncateDay)(maybe(date("created"))(draft.created)),
      updated: maybe(truncateDay)(maybe(date("updated"))(draft.updated)),
      template: maybe(fn("template"))(draft.template),
      body: fn("body")(draft.body)
    }
  };
};
var md = async (file) => {
  const raw = await fsp2.readFile(file, "utf-8");
  const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
  if (typeof header !== "string") throw new Error("Missing metadata");
  const metadata = Object.fromEntries(header.split(/\r?\n/).map((line) => line.split(":").map((x) => x.trim())));
  return {
    dependencies: /* @__PURE__ */ new Set(),
    page: {
      title: string("title")(metadata.title),
      description: maybe(string("description"))(metadata.description),
      url: maybe(string("url"))(metadata.url),
      ext: maybe(string("ext"))(metadata.ext),
      created: maybe(truncateDay)(maybe(fromString)(maybe(string("created"))(metadata.created))),
      updated: maybe(truncateDay)(maybe(fromString)(maybe(string("updated"))(metadata.updated))),
      template: null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, "")
    }
  };
};

// src/spider.ts
var Spider = class {
  #entryPoints;
  #exclude;
  #root;
  #outdir;
  #loaders;
  #cache;
  get #registry() {
    if (!this.#cache.dirty) return this.#cache.registry;
    const depth = count("/");
    const pages = Array.from(this.#cache.documents.values()).map((document) => document.page).sort((a, b) => {
      if (depth(a.url) === depth(b.url)) return a.url.localeCompare(b.url);
      return depth(a.url) - depth(b.url);
    });
    this.#cache.registry = new Registry(pages);
    this.#cache.dirty = false;
    return this.#cache.registry;
  }
  constructor(options) {
    this.#entryPoints = options.entryPoints;
    this.#exclude = options.exclude ?? [];
    this.#root = typeof options.root === "string" ? path5.normalize(options.root) : process.cwd();
    this.#outdir = options.outdir ?? null;
    this.#loaders = /* @__PURE__ */ new Map();
    this.#loaders.set(".js", js);
    this.#loaders.set(".ts", js);
    this.#loaders.set(".md", md);
    if (options.loader) Object.entries(options.loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));
    this.#cache = {
      documents: /* @__PURE__ */ new Map(),
      registry: new Registry([]),
      dependencies: /* @__PURE__ */ new Map(),
      dirty: false
    };
  }
  /**
   * Load file
   *
   * @param file Input file, must default export a `Draft`
   * @param force If true, overwrites cached entry
   */
  async load(file, force) {
    try {
      const result = await this.#loaders.get(path5.extname(file))?.(file);
      if (!result) throw new Error(`Unknown file type "${path5.extname(file)}"`);
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
  /** Write cached documents to `outdir` */
  async write() {
    if (typeof this.#outdir !== "string") return;
    for (const document of this.#cache.documents.values()) {
      try {
        const file = path5.join(this.#outdir, document.file);
        await fsp3.mkdir(path5.dirname(file), { recursive: true });
        await fsp3.writeFile(file, document.render(this.#registry));
      } catch (cause) {
        throw new Error(`Failed to write document "${document.file}"`, { cause });
      }
    }
  }
  /** Find all files in `entryPoints`, loads and writes to `outdir` */
  async build() {
    try {
      for await (const file of fsp3.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file);
      await this.write();
      return this.#cache.documents;
    } catch (cause) {
      throw new Error("Failed to build", { cause });
    }
  }
  /**
   * Watch `entryPoints` and dependencies. Calls `build` on file changes.
   *
   * **Note**: Files that exist outside the working directly do not trigger a build.
   *
   * **Note**: Due to Node's [limitations](https://github.com/nodejs/node/issues/49442#issuecomment-1894620232), every file change will
   * increase memory usage. It is not recommended to run `watch` for extended periods of time.
   */
  async watch() {
    await this.build();
    const ac = new AbortController();
    const watcher = fsp3.watch(process.cwd(), {
      recursive: true,
      ignore: this.#outdir ? [this.#outdir, `${this.#outdir}/**/*`] : void 0,
      signal: ac.signal
    });
    (async () => {
      try {
        let last = "";
        for await (const event of watcher) {
          if (event.eventType === "rename" || typeof event.filename !== "string" || last === event.filename) continue;
          const file = event.filename;
          last = file;
          if (this.#cache.dependencies.has(file)) {
            await this.load(file, true);
            await this.write();
          }
          const files = this.#cache.dependencies.entries().filter(([_, dependencies]) => dependencies.has(path5.join(process.cwd(), file)));
          for (const [file2] of files) {
            await this.load(file2, true);
            await this.write();
          }
        }
      } catch (err2) {
        if (err2 instanceof Error && err2.name === "AbortError") return;
        throw err2;
      }
    })();
    return () => ac.abort();
  }
};
export {
  Registry,
  Spider as default,
  loader_exports as loader
};
