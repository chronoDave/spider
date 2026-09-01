var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import path4 from "path";
import fsp3 from "fs/promises";

// src/lib/document.ts
import path from "path/posix";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();
var count = (c) => (x) => {
  let n = 0;
  for (let i = 0; i < x.length; i += 1) {
    if (x.slice(i, i + c.length) === c) n += 1;
  }
  return n;
};
var maybe = (x) => {
  if (x === "") return null;
  return x;
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
  static file(root, result) {
    if (typeof result.page.url === "string") {
      const { dir: dir2, name: name2, ext: ext2 } = path.parse(result.page.url);
      if (result.page.url.endsWith("/")) {
        return path.normalize(path.format({
          dir: path.join(dir2, name2),
          name: "index",
          ext: "html"
        }));
      }
      return path.normalize(path.format({
        dir: dir2,
        name: maybe(name2) ?? "index",
        ext: maybe(ext2) ?? "html"
      }));
    }
    const ext = result.page.ext ?? ".html";
    const name = slugify(result.page.title);
    let dir = path.join(root, name);
    if (typeof result.page.ext === "string" || name === "index" || // Prevent index/index
    root.endsWith(name)) dir = root;
    return path.normalize(path.format({
      dir,
      name: typeof result.page.ext === "string" ? name : "index",
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
  static url(file, result) {
    if (typeof result.page.url === "string") {
      if (result.page.url.endsWith(".html")) return result.page.url.replace(/\.html$/, "");
      return result.page.url;
    }
    const { ext, dir, name } = path.parse(file);
    if (ext === ".html") return path.join(dir, name === "index" ? "/" : name);
    return file;
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
    return this.#template?.(registry)(this.page) ?? this.page.body?.(registry) ?? "";
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

// src/lib/fn.ts
var maybe2 = (fn2) => (x) => {
  if (x === null || x === void 0) return null;
  return fn2(x);
};

// src/lib/modules.ts
import path3 from "path";
import fsp from "fs/promises";
import os from "os";
import { createRequire } from "module";
import { pathToFileURL } from "url";
var imports = async (file, results) => {
  const raw = await fsp.readFile(file, "utf-8");
  for (const match of raw.matchAll(/import\s+[^'"]+.([^'"]+)['"].*/g)) {
    if (!match[1].startsWith(".")) continue;
    const next = path3.join(path3.dirname(file), match[1]);
    if (results.has(next)) continue;
    results.add(next);
    for (const result of await imports(next, results)) results.add(result);
  }
  return results;
};
var bust = (root) => (raw) => raw.replaceAll(
  /(import\s+[^'"]+.)([^'"]+)(['"].*)/g,
  (_, p1, p2, p3) => {
    const require2 = createRequire(path3.resolve(root));
    const absolute = pathToFileURL(require2.resolve(p2)).href;
    if (p2.startsWith(".")) return `${p1}${absolute}?${crypto.randomUUID()}${p3}`;
    return `${p1}${absolute}${p3}`;
  }
);
var load = async (file) => {
  const raw = await fsp.readFile(file, "utf-8");
  const tmp = path3.join(os.tmpdir(), `${crypto.randomUUID()}${path3.extname(file)}`);
  await fsp.writeFile(tmp, bust(file)(raw));
  const module = await import(pathToFileURL(tmp).href);
  await fsp.rm(tmp);
  return module;
};

// src/lib/loader.ts
var js = async (file) => {
  const [
    module,
    dependencies
  ] = await Promise.all([
    load(file).then((result) => object("default")(result.default)),
    imports(file, /* @__PURE__ */ new Set())
  ]);
  return {
    dependencies,
    page: {
      title: string("title")(module.title),
      description: maybe2(string("description"))(module.description),
      url: maybe2(string("url"))(module.url),
      ext: maybe2(string("ext"))(module.ext),
      created: maybe2(truncateDay)(maybe2(date("created"))(module.created)),
      updated: maybe2(truncateDay)(maybe2(date("updated"))(module.updated)),
      template: maybe2(fn("template"))(module.template),
      body: maybe2(fn("body"))(module.body)
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
      description: maybe2(string("description"))(metadata.description),
      url: maybe2(string("url"))(metadata.url),
      ext: maybe2(string("ext"))(metadata.ext),
      created: maybe2(truncateDay)(maybe2(fromString)(maybe2(string("created"))(metadata.created))),
      updated: maybe2(truncateDay)(maybe2(fromString)(maybe2(string("updated"))(metadata.updated))),
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
  #plugins;
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
    this.#root = typeof options.root === "string" ? path4.normalize(options.root) : process.cwd();
    this.#outdir = options.outdir ?? null;
    this.#plugins = options.plugins ?? [];
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
      const result = await this.#loaders.get(path4.extname(file))?.(file);
      if (!result) throw new Error(`Unknown file type "${path4.extname(file)}"`);
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
  async write() {
    const results = [];
    for (const document of this.#cache.documents.values()) {
      try {
        const html = await this.#plugins.reduce(async (acc, cur) => {
          try {
            const next = await acc;
            if (!cur.write) return next;
            return await cur.write(next);
          } catch (cause) {
            throw new Error(`Failed to call write on plugin "${cur.name}"`, { cause });
          }
        }, document.render(this.#registry));
        if (typeof this.#outdir !== "string") {
          results.push({ file: document.file, html });
          continue;
        }
        const file = path4.join(this.#outdir, document.file);
        await fsp3.mkdir(path4.dirname(file), { recursive: true });
        await fsp3.writeFile(file, html);
      } catch (cause) {
        throw new Error(`Failed to write document "${document.file}"`, { cause });
      }
    }
    return results;
  }
  /** Find all files in `entryPoints`, loads and writes to `outdir` */
  async build() {
    try {
      for await (const file of fsp3.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file);
      return {
        documents: this.#cache.documents,
        outputFiles: await this.write()
      };
    } catch (cause) {
      throw new Error("Failed to build", { cause });
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
   */
  async watch() {
    await this.build();
    const ac = new AbortController();
    const watcher = fsp3.watch(process.cwd(), {
      recursive: true,
      signal: ac.signal
    });
    const queue = /* @__PURE__ */ new Set();
    const task = (async () => {
      try {
        for await (const event of watcher) {
          if (event.eventType === "rename" || typeof event.filename !== "string") continue;
          if (queue.has(event.filename)) continue;
          queue.add(event.filename);
          for (const [page, dependencies] of this.#cache.dependencies.entries()) {
            if (page !== event.filename && !dependencies.has(event.filename)) continue;
            await this.load(page, true);
            await this.write();
          }
          queue.delete(event.filename);
        }
      } catch (err2) {
        if (err2 instanceof Error && err2.name === "AbortError") return;
        throw err2;
      }
    })();
    return async () => {
      ac.abort();
      await task;
    };
  }
};
export {
  Registry,
  Spider as default,
  loader_exports as loader
};
