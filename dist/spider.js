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
var Page = class {
  title;
  description;
  ext;
  url;
  created;
  updated;
  body;
  template;
  file;
  dir;
  constructor(options) {
    this.title = options.title;
    this.description = options.description;
    this.ext = options.ext;
    this.url = options.url;
    this.created = options.created;
    this.updated = options.updated;
    this.body = options.body;
    this.template = options.template;
    this.file = this.url;
    if (this.file.endsWith("/")) this.file = `${this.file}index`;
    this.file = `${this.file}${this.ext}`;
    this.dir = path.dirname(this.file);
  }
  render(registry) {
    return this.template(registry)(this);
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
  const date = new Date(x);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
};

// src/lib/path.ts
import path2 from "path";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();

// src/lib/path.ts
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

// src/lib/fn.ts
var maybe = (fn2) => (x) => {
  if (x === null || x === void 0) return null;
  return fn2(x);
};

// src/lib/loader.ts
var js = (root) => async (file) => {
  const [raw, stat] = await Promise.all([
    import(`file://${resolve(file)}?${Date.now()}`),
    fsp.stat(file)
  ]);
  const module = object("default")(raw.default);
  const title = string("title")(module.title);
  const description = maybe(string("description"))(module.description);
  const url2 = maybe(string("url"))(module.url);
  const ext = maybe(string("ext"))(module.ext);
  const created = truncateDay(maybe(fromString)(maybe(string("created"))(module.created)) ?? stat.birthtime);
  const updated = truncateDay(maybe(fromString)(maybe(string("updated"))(module.updated)) ?? stat.mtime);
  const template = fn("template")(module.template);
  const body = fn("body")(module.body);
  return {
    title,
    description,
    url: url2 ?? url(root)(file)(title),
    ext: ext ?? ".html",
    created,
    updated: updated.getTime() === created.getTime() ? null : updated,
    template,
    body
  };
};
var md = (root) => async (file) => {
  const [raw, stat] = await Promise.all([
    fsp.readFile(file, "utf-8"),
    fsp.stat(file)
  ]);
  const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
  if (typeof header !== "string") throw new Error("Missing metadata");
  const metadata = Object.fromEntries(header.split(/\r?\n/).map((line) => line.split(":").map((x) => x.trim())));
  const title = string("title")(metadata.title);
  const description = maybe(string("description"))(metadata.description);
  const url2 = maybe(string("url"))(metadata.url);
  const ext = maybe(string("ext"))(metadata.ext);
  const created = truncateDay(maybe(fromString)(maybe(string("created"))(metadata.created)) ?? stat.birthtime);
  const updated = truncateDay(maybe(fromString)(maybe(string("updated"))(metadata.updated)) ?? stat.mtime);
  return {
    title,
    description,
    url: url2 ?? url(root)(file)(title),
    ext: ext ?? ".html",
    created,
    updated: updated.getTime() === created.getTime() ? null : updated,
    template: (registry) => (document) => document.body(registry),
    body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, "")
  };
};

// src/spider.ts
var Spider = class {
  #files;
  #exclude;
  #dirout;
  #root;
  #loaders;
  #registry;
  constructor(options) {
    this.#files = options.files;
    this.#registry = /* @__PURE__ */ new Map();
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
    if (typeof this.#dirout !== "string") return this.#registry;
    for (const page of this.#registry.values()) {
      await fsp2.mkdir(path3.join(this.#dirout, page.dir), { recursive: true });
      await fsp2.writeFile(path3.join(this.#dirout, page.file), page.render(this.#registry));
    }
    return this.#registry;
  }
  /** Load file into registry */
  async load(file) {
    const err2 = (reason) => new Error(`Failed to load page "${file}"`, { cause: new Error(reason) });
    const draft = await this.#loaders.get(path3.extname(file))?.(file);
    if (!draft) throw err2(`Unknown file type "${path3.extname(file)}"`);
    if (this.#registry.has(draft.url)) throw err2(`Page already exists with url "${draft.url}"`);
    this.#registry.set(draft.url, new Page(draft));
  }
  /** Build project */
  async build() {
    for await (const file of fsp2.glob(this.#files, { exclude: this.#exclude })) this.load(file);
    return this.write();
  }
};
export {
  Page,
  Spider as default
};
