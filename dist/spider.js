var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import path5 from "path";
import fsp2 from "fs/promises";

// src/lib/document.ts
import path from "path/posix";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();

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
        name: name2 === "" ? "index" : name2,
        ext: ext2 === "" ? "html" : ext2
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

// src/lib/registry.ts
import path2 from "path";
var registry_default = (pages) => pages.sort((a, b) => {
  const depth = (x) => x.split("/").length;
  if (depth(a.url) === depth(b.url)) return a.url.localeCompare(b.url);
  return depth(a.url) - depth(b.url);
}).reduce((acc, cur) => {
  if (cur.url === "/") {
    const node2 = { parent: null, children: [], value: cur };
    acc.set(cur.url, node2);
    return acc;
  }
  const { dir } = path2.parse(cur.url);
  let key = dir;
  if (dir !== "/") key += "/";
  const parent = acc.get(key);
  if (!parent) throw new Error(`Found unattached page "${cur.url}"`);
  const node = { parent, children: [], value: cur };
  parent.children.push(node);
  acc.set(cur.url, node);
  return acc;
}, /* @__PURE__ */ new Map());

// src/lib/url.ts
import path3 from "path";
var relative = (a) => (b) => {
  const rel = path3.posix.relative(
    a.replaceAll(path3.sep, path3.posix.sep),
    b.replaceAll(path3.sep, path3.posix.sep)
  );
  return `/${rel.length === 0 ? rel : path3.dirname(rel)}`;
};

// src/lib/loader.ts
var loader_exports = {};
__export(loader_exports, {
  js: () => js
});

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

// src/lib/esm.ts
import path4 from "path";
import fsp from "fs/promises";
import os from "os";
import { createRequire } from "module";
import { pathToFileURL } from "url";
var imports = (results) => async (file) => {
  const raw = await fsp.readFile(file, "utf-8");
  for (const match of raw.matchAll(/import\s+[^'"]+.([^'"]+)['"].*/g)) {
    if (!match[1].startsWith(".")) continue;
    const next = path4.join(path4.dirname(file), match[1]);
    if (results.has(next)) continue;
    results.add(next);
    for (const result of await imports(results)(next)) results.add(result);
  }
  return results;
};
var load = async (file) => {
  const raw = await fsp.readFile(file, "utf-8");
  const tmp = path4.join(os.tmpdir(), `${crypto.randomUUID()}${path4.extname(file)}`);
  await fsp.writeFile(tmp, raw.replaceAll(
    /(import\s+[^'"]+.)([^'"]+)(['"].*)/g,
    (_, p1, p2, p3) => {
      const require2 = createRequire(path4.resolve(file));
      const absolute = pathToFileURL(require2.resolve(p2)).href;
      if (p2.startsWith(".")) return `${p1}${absolute}?${crypto.randomUUID()}${p3}`;
      return `${p1}${absolute}${p3}`;
    }
  ));
  const module = await import(pathToFileURL(tmp).href);
  await fsp.rm(tmp);
  return module;
};

// src/lib/fn.ts
var maybe = (fn2) => (x) => {
  if (x === null || x === void 0) return null;
  return fn2(x);
};

// src/lib/loader.ts
var js = async (file) => {
  const [
    module,
    dependencies
  ] = await Promise.all([
    load(file).then((result) => object("default")(result.default)),
    imports(/* @__PURE__ */ new Set())(file)
  ]);
  return {
    dependencies,
    page: {
      title: string("title")(module.title),
      description: maybe(string("description"))(module.description),
      url: maybe(string("url"))(module.url),
      ext: maybe(string("ext"))(module.ext),
      created: maybe(date("created"))(module.created),
      updated: maybe(date("updated"))(module.updated),
      template: maybe(fn("template"))(module.template),
      body: maybe(fn("body"))(module.body)
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
    const pages = [];
    for (const document of this.#cache.documents.values()) pages.push(document.page);
    this.#cache.registry = registry_default(pages);
    this.#cache.dirty = false;
    return this.#cache.registry;
  }
  constructor(options) {
    this.#entryPoints = options.entryPoints;
    this.#exclude = options.exclude ?? [];
    this.#root = typeof options.root === "string" ? path5.normalize(options.root) : process.cwd();
    this.#outdir = options.outdir ?? null;
    this.#plugins = options.plugins ?? [];
    this.#loaders = /* @__PURE__ */ new Map();
    this.#loaders.set(".js", js);
    this.#loaders.set(".ts", js);
    if (options.loader) Object.entries(options.loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));
    this.#cache = {
      documents: /* @__PURE__ */ new Map(),
      registry: registry_default([]),
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
  /** Render document and write to `outdir` if `outdir` is set */
  async write() {
    const results = [];
    for (const document of this.#cache.documents.values()) {
      try {
        const html = await this.#plugins.reduce(async (acc, cur) => {
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
        if (typeof this.#outdir !== "string") {
          results.push({ file: document.file, html });
          continue;
        }
        const file = path5.join(this.#outdir, document.file);
        await fsp2.mkdir(path5.dirname(file), { recursive: true });
        await fsp2.writeFile(file, html);
      } catch (cause) {
        throw new Error(`Failed to write document "${document.file}"`, { cause });
      }
    }
    return results;
  }
  /** Find all files in `entryPoints`, loads and writes to `outdir` */
  async build() {
    try {
      for await (const file of fsp2.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file);
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
    const watcher = fsp2.watch(process.cwd(), {
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
  Spider as default,
  loader_exports as loader
};
