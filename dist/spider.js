var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import fsp2 from "fs/promises";
import path3 from "path";

// src/lib/page.ts
import path from "path";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();
var count = (c) => (x) => {
  let n = 0;
  for (let i = 0; i < x.length; i += 1) {
    if (x.slice(i, i + c.length) === c) n += 1;
  }
  return n;
};

// src/lib/page.ts
var Page = class {
  title;
  description;
  url;
  created;
  updated;
  body;
  template;
  file;
  dir;
  depth;
  constructor(options) {
    this.title = options.title;
    this.description = options.description;
    this.created = options.created;
    this.updated = options.updated;
    this.body = options.body;
    this.template = options.template;
    this.url = options.url;
    if (typeof options.ext === "string") {
      if (this.url.endsWith("/")) this.url = `${this.url}index`;
      this.url = `${this.url}${options.ext}`;
    }
    this.file = this.url;
    if (this.file.endsWith("/")) this.file = `${this.file}index`;
    if (!/\.\w+/.test(this.file)) this.file = `${this.file}${options.ext ?? ".html"}`;
    this.dir = path.dirname(this.file);
    this.depth = this.url === "/" ? 0 : count("/")(this.file);
  }
  render(registry) {
    return this.template?.(registry)(this) ?? "";
  }
};

// src/lib/registry.ts
var Registry = class {
  #map;
  nodes;
  tree;
  constructor(pages) {
    this.nodes = [];
    this.tree = [];
    const sort = (a, b) => {
      if (a.depth === b.depth) return a.url.localeCompare(b.url);
      return a.depth - b.depth;
    };
    for (const page of pages.sort(sort)) {
      const dirs = page.url.split("/").filter(Boolean);
      let current = null;
      for (let i = 0; i < dirs.length; i += 1) {
        const url2 = i === 0 ? "/" : `/${dirs.slice(0, i).join("/")}`;
        const parent = (current?.children ?? this.tree).find((node2) => node2.page.url === url2) ?? null;
        if (parent) current = parent;
      }
      const node = { page, parent: current, children: [] };
      this.nodes.push(node);
      if (current) {
        current.children.push(node);
      } else {
        this.tree.push(node);
      }
    }
    this.#map = new Map(this.nodes.map((node) => [node.page.url, node]));
  }
  node(url2) {
    return this.#map.get(url2) ?? null;
  }
};

// src/lib/loader.ts
var loader_exports = {};
__export(loader_exports, {
  js: () => js,
  md: () => md
});
import fsp from "fs/promises";
import { resolve } from "path";

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

// src/lib/path.ts
import path2 from "path";
var rel = (root) => (file) => {
  const rel2 = file.replace(root, "").replaceAll(path2.win32.sep, path2.posix.sep);
  if (rel2.length === 0) return "/";
  return rel2;
};
var url = (root) => (file) => (title) => path2.posix.join(rel(root)(path2.dirname(file)), slugify(title));

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
var js = (root) => async (file) => {
  try {
    const [raw, stat] = await Promise.all([
      import(`file://${resolve(file)}?${Date.now()}`),
      fsp.stat(file)
    ]);
    const module = object("default")(raw.default);
    const title = string("title")(module.title);
    const description = maybe(string("description"))(module.description);
    const url2 = maybe(string("url"))(module.url) ?? url(root)(file)(title);
    const ext = maybe(string("ext"))(module.ext);
    const created = truncateDay(maybe(date("created"))(module.created) ?? stat.birthtime);
    const updated = truncateDay(maybe(date("updated"))(module.updated) ?? stat.mtime);
    const template = maybe(fn("template"))(module.template);
    const body = maybe(fn("body"))(module.body);
    return {
      title,
      description,
      ext,
      url: url2,
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template,
      body
    };
  } catch (err2) {
    throw new Error(`Failed to load ${file}`, { cause: err2 });
  }
};
var md = (root) => async (file) => {
  try {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file, "utf-8"),
      fsp.stat(file)
    ]);
    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== "string") throw new Error("Missing metadata");
    const metadata = Object.fromEntries(header.split(/\r?\n/).map((line) => line.split(":").map((x) => x.trim())));
    const title = string("title")(metadata.title);
    const description = maybe(string("description"))(metadata.description);
    const url2 = maybe(string("url"))(metadata.url) ?? url(root)(file)(title);
    const ext = maybe(string("ext"))(metadata.ext);
    const created = truncateDay(maybe(fromString)(maybe(string("created"))(metadata.created)) ?? stat.birthtime);
    const updated = truncateDay(maybe(fromString)(maybe(string("updated"))(metadata.updated)) ?? stat.mtime);
    return {
      title,
      description,
      url: url2,
      ext,
      created,
      updated: updated.getTime() === created.getTime() ? null : updated,
      template: (registry) => (document) => document.body?.(registry) ?? null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, "")
    };
  } catch (err2) {
    throw new Error(`Failed to load ${file}`, { cause: err2 });
  }
};

// src/spider.ts
var Spider = class {
  #files;
  #pages;
  #exclude;
  #dirout;
  #root;
  #loaders;
  constructor(options) {
    this.#files = options.files;
    this.#pages = /* @__PURE__ */ new Map();
    this.#root = options.root ?? process.cwd();
    this.#exclude = options.exclude ?? [];
    this.#dirout = options.dirout ?? null;
    this.#loaders = /* @__PURE__ */ new Map();
    this.#loaders.set(".js", js(this.#root));
    this.#loaders.set(".ts", js(this.#root));
    this.#loaders.set(".md", md(this.#root));
    if (options.loader) Object.entries(loader_exports).forEach(([ext, loader]) => this.#loaders.set(ext, loader(this.#root)));
  }
  /** Write registry to `dirout` */
  async write() {
    if (typeof this.#dirout !== "string") throw new Error("Failed to write", { cause: new Error('Missing option "dirout"') });
    const registry = new Registry(Array.from(this.#pages.values()));
    for (const node of registry.nodes) {
      await fsp2.mkdir(path3.join(this.#dirout, node.page.dir), { recursive: true });
      await fsp2.writeFile(path3.join(this.#dirout, node.page.file), node.page.render(registry));
    }
    return registry;
  }
  /** Load file into registry */
  async load(file) {
    const err2 = (reason) => new Error(`Failed to load page "${file}"`, { cause: new Error(reason) });
    const draft = await this.#loaders.get(path3.extname(file))?.(file);
    if (!draft) throw err2(`Unknown file type "${path3.extname(file)}"`);
    const page = new Page(draft);
    if (this.#pages.has(page.url)) throw err2(`Page already exists with url "${page.url}"`);
    this.#pages.set(page.url, page);
  }
  /** Build project */
  async build() {
    for await (const file of fsp2.glob(this.#files, { exclude: this.#exclude })) await this.load(file);
    return this.write();
  }
};
export {
  Page,
  Registry,
  Spider as default
};
