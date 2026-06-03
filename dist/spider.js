var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import path3 from "path";
import fsp2 from "fs/promises";

// src/lib/loader.ts
var loader_exports = {};
__export(loader_exports, {
  js: () => js,
  md: () => md
});
import fsp from "fs/promises";
import path from "path";

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

// src/lib/fn.ts
var maybe = (fn2) => (x) => {
  if (x === null || x === void 0) return null;
  return fn2(x);
};

// src/lib/loader.ts
var js = async (file2) => {
  try {
    const raw = await import(`file://${path.resolve(file2)}?${Date.now()}`);
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
    throw new Error(`Failed to load ${file2}`, { cause: err2 });
  }
};
var md = async (file2) => {
  try {
    const raw = await fsp.readFile(file2, "utf-8");
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
    throw new Error(`Failed to load ${file2}`, { cause: err2 });
  }
};

// src/lib/url.ts
import path2 from "path";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();
var count = (c) => (x) => {
  let n = 0;
  for (let i = 0; i < x.length; i += 1) {
    if (x.slice(i, i + c.length) === c) n += 1;
  }
  return n;
};

// src/lib/url.ts
var dirrel = (root) => (file2) => {
  const rel = file2.replace(root, "").replaceAll(path2.win32.sep, path2.posix.sep);
  if (rel.length === 0) return "/";
  const dir = path2.dirname(rel);
  if (dir.endsWith("/")) return dir;
  return `${dir}/`;
};
var create = (dir) => (title) => {
  const slug = slugify(title);
  if (slug === "index" || dir.slice(0, -1).endsWith(slug)) return dir;
  return `${dir}${slug}/`;
};
var ext = (url) => (ext2) => {
  if (/\.\w+$/.test(url)) return url.replace(/\.\w+$/, ext2);
  if (url.endsWith("/")) return `${url}index${ext2}`;
  return `${url}${ext2}`;
};

// src/lib/document.ts
var file = (url) => {
  if (url.endsWith("/")) return `${url}index.html`;
  if (/\.\w+$/.test(url)) return url;
  return `${url}.html`;
};
var render = (registry) => (doc) => doc.template?.(registry)(doc) ?? doc.body(registry);

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
  constructor(docs) {
    this.#tree = tree(docs)((doc, tree2) => {
      let current = null;
      const dirs = doc.url.split("/").filter(Boolean);
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
    const docs = Array.from(this.#cache.documents.values()).sort((a, b) => {
      if (depth(a.url) === depth(b.url)) return a.url.localeCompare(b.url);
      return depth(a.url) - depth(b.url);
    });
    this.#cache.registry = new Registry(docs);
    this.#cache.dirty = false;
    return this.#cache.registry;
  }
  constructor(options) {
    this.#entryPoints = options.entryPoints;
    this.#exclude = options.exclude ?? [];
    this.#root = typeof options.root === "string" ? path3.normalize(options.root) : process.cwd();
    this.#outdir = options.outdir ?? null;
    this.#loaders = /* @__PURE__ */ new Map();
    this.#loaders.set(".js", js);
    this.#loaders.set(".ts", js);
    this.#loaders.set(".md", md);
    if (options.loader) Object.entries(options.loader).forEach(([ext2, loader]) => this.#loaders.set(ext2, loader));
    this.#cache = {
      documents: /* @__PURE__ */ new Map(),
      registry: new Registry([]),
      dirty: false
    };
  }
  /** Load file */
  async load(file2) {
    try {
      const draft = await this.#loaders.get(path3.extname(file2))?.(file2);
      if (!draft) throw new Error(`Unknown file type "${path3.extname(file2)}"`);
      if (typeof draft.url !== "string") draft.url = create(dirrel(this.#root)(file2))(draft.title);
      if (typeof draft.ext === "string") draft.url = ext(draft.url)(draft.ext);
      if (this.#cache.documents.has(draft.url)) throw new Error(`Page already exists with url "${draft.url}"`);
      this.#cache.documents.set(draft.url, draft);
      this.#cache.dirty = true;
      return draft;
    } catch (cause) {
      throw new Error(`Failed to load page "${file2}"`, { cause });
    }
  }
  /** Write documents to `outdir` */
  async write() {
    if (typeof this.#outdir !== "string") return;
    for (const doc of this.#cache.documents.values()) {
      try {
        const file2 = path3.join(this.#outdir, file(doc.url));
        await fsp2.mkdir(path3.dirname(file2), { recursive: true });
        await fsp2.writeFile(file2, render(this.#registry)(doc));
      } catch (cause) {
        throw new Error(`Failed to write document "${doc.url}"`, { cause });
      }
    }
  }
  async build() {
    try {
      for await (const file2 of fsp2.glob(this.#entryPoints, { exclude: this.#exclude })) await this.load(file2);
      await this.write();
      return this.#cache.documents;
    } catch (cause) {
      throw new Error("Failed to build", { cause });
    }
  }
};
export {
  Registry,
  Spider as default,
  loader_exports as loader
};
