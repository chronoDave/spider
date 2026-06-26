var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import path4 from "path";
import fsp2 from "fs/promises";

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
    const ext = result.ext ?? (maybe(path.parse)(result.url)?.ext || null);
    const name = maybe(path.parse)(result.url)?.name ?? slugify(result.title);
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
    let url = result.url ?? file;
    const { ext, dir, name } = path.parse(file);
    if (ext === ".html") url = path.join(dir, name === "index" ? "/" : name);
    return url;
  }
  constructor(root, result) {
    this.#template = result.template;
    this.file = _Document.file(root, result);
    this.page = {
      title: result.title,
      description: result.description,
      url: _Document.url(this.file, result),
      created: result.created,
      updated: result.updated,
      body: result.body
    };
  }
  render(registry) {
    return this.#template?.(registry)(this.page) ?? this.page.body(registry);
  }
};

// src/lib/loader.ts
var loader_exports = {};
__export(loader_exports, {
  js: () => js,
  md: () => md
});
import fsp from "fs/promises";
import path2 from "path";

// src/lib/date.ts
var truncateDay = (x) => {
  x.setUTCHours(0, 0, 0, 0);
  return x;
};
var fromString = (x) => {
  const date2 = new Date(x);
  if (Number.isNaN(date2.getTime())) throw new Error("Invalid date");
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

// src/lib/loader.ts
var js = async (file) => {
  try {
    const raw = await import(`file://${path2.resolve(file)}?${Date.now()}`);
    const module = object("default")(raw.default);
    return {
      title: string("title")(module.title),
      description: maybe(string("description"))(module.description),
      url: maybe(string("url"))(module.url),
      ext: maybe(string("ext"))(module.ext),
      created: maybe(truncateDay)(maybe(date("created"))(module.created)),
      updated: maybe(truncateDay)(maybe(date("updated"))(module.updated)),
      template: maybe(fn("template"))(module.template),
      body: fn("body")(module.body)
    };
  } catch (err2) {
    throw new Error(`Failed to load ${file}`, { cause: err2 });
  }
};
var md = async (file) => {
  try {
    const raw = await fsp.readFile(file, "utf-8");
    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== "string") throw new Error("Missing metadata");
    const metadata = Object.fromEntries(header.split(/\r?\n/).map((line) => line.split(":").map((x) => x.trim())));
    return {
      title: string("title")(metadata.title),
      description: maybe(string("description"))(metadata.description),
      url: maybe(string("url"))(metadata.url),
      ext: maybe(string("ext"))(metadata.ext),
      created: maybe(truncateDay)(maybe(fromString)(maybe(string("created"))(metadata.created))),
      updated: maybe(truncateDay)(maybe(fromString)(maybe(string("updated"))(metadata.updated))),
      template: null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, "")
    };
  } catch (err2) {
    throw new Error(`Failed to load ${file}`, { cause: err2 });
  }
};

// src/lib/url.ts
import path3 from "path";
var relative = (from) => (to) => {
  const rel = path3.posix.relative(
    from.replaceAll(path3.sep, path3.posix.sep),
    to.replaceAll(path3.sep, path3.posix.sep)
  );
  return `/${rel.length === 0 ? rel : path3.dirname(rel)}`;
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
    this.#root = typeof options.root === "string" ? path4.normalize(options.root) : process.cwd();
    this.#outdir = options.outdir ?? null;
    this.#loaders = /* @__PURE__ */ new Map();
    this.#loaders.set(".js", js);
    this.#loaders.set(".ts", js);
    this.#loaders.set(".md", md);
    if (options.loader) Object.entries(options.loader).forEach(([ext, loader]) => this.#loaders.set(ext, loader));
    this.#cache = {
      documents: /* @__PURE__ */ new Map(),
      registry: new Registry([]),
      dirty: false
    };
  }
  /** Load file */
  async load(file, force) {
    try {
      const draft = await this.#loaders.get(path4.extname(file))?.(file);
      if (!draft) throw new Error(`Unknown file type "${path4.extname(file)}"`);
      const document = new Document(relative(this.#root)(file), draft);
      if (!force && this.#cache.documents.has(document.page.url)) throw new Error(`Page already exists with url "${draft.url}"`);
      this.#cache.documents.set(document.page.url, document);
      this.#cache.dirty = true;
      return document;
    } catch (cause) {
      throw new Error(`Failed to load page "${file}"`, { cause });
    }
  }
  /** Write documents to `outdir` */
  async write() {
    if (typeof this.#outdir !== "string") return;
    for (const document of this.#cache.documents.values()) {
      try {
        const file = path4.join(this.#outdir, document.file);
        await fsp2.mkdir(path4.dirname(file), { recursive: true });
        await fsp2.writeFile(file, document.render(this.#registry));
      } catch (cause) {
        throw new Error(`Failed to write document "${document.file}"`, { cause });
      }
    }
  }
  async build() {
    try {
      for await (const file of fsp2.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file);
      await this.write();
      return this.#cache.documents;
    } catch (cause) {
      throw new Error("Failed to build", { cause });
    }
  }
  async watch() {
    await this.build();
    const ac = new AbortController();
    const watcher = fsp2.watch(this.#root, {
      recursive: true,
      ignore: this.#exclude,
      signal: ac.signal
    });
    (async () => {
      for await (const event of watcher) {
        if (typeof event.filename !== "string") continue;
        const file = path4.join(this.#root, event.filename);
        await this.load(file, true);
        await this.write();
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
