var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import fsp2 from "fs/promises";
import path3 from "path";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();
var count = (c) => (x) => {
  let n = 0;
  for (let i = 0; i < x.length; i += 1) {
    if (x.slice(i, i + c.length) === c) n += 1;
  }
  return n;
};

// src/lib/registry.ts
var Registry = class {
  #map;
  nodes;
  tree;
  constructor(docs) {
    this.nodes = [];
    this.tree = [];
    const depth = count("/");
    docs.sort((a, b) => {
      const aDepth = depth(a.url);
      const bDepth = depth(b.url);
      if (aDepth === bDepth) return a.url.localeCompare(b.url);
      return aDepth - bDepth;
    }).forEach((doc) => {
      const dirs = doc.url.split("/").filter(Boolean);
      let current = null;
      for (let i = 0; i < dirs.length; i += 1) {
        const url = i === 0 ? "/" : `/${dirs.slice(0, i).join("/")}/`;
        const parent = (current?.children ?? this.tree).find((node2) => node2.url === url) ?? null;
        if (parent) current = parent;
      }
      const node = Object.assign({ parent: current, children: [] }, doc);
      this.nodes.push(node);
      if (current) {
        current.children.push(node);
      } else {
        this.tree.push(node);
      }
    });
    this.#map = new Map(this.nodes.map((node) => [node.url, node]));
  }
  node(url) {
    return this.#map.get(url) ?? null;
  }
};

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
    const [raw, stat] = await Promise.all([
      import(`file://${path.resolve(file2)}?${Date.now()}`),
      fsp.stat(file2)
    ]);
    const module = object("default")(raw.default);
    const created = truncateDay(maybe(date("created"))(module.created) ?? stat.birthtime);
    const updated = truncateDay(maybe(date("updated"))(module.updated) ?? stat.mtime);
    return {
      title: string("title")(module.title),
      description: maybe(string("description"))(module.description),
      url: maybe(string("url"))(module.url),
      ext: maybe(string("ext"))(module.ext),
      created,
      updated: updated.getTime() !== created.getTime() ? updated : null,
      template: maybe(fn("template"))(module.template),
      body: fn("body")(module.body)
    };
  } catch (err2) {
    throw new Error(`Failed to load ${file2}`, { cause: err2 });
  }
};
var md = async (file2) => {
  try {
    const [raw, stat] = await Promise.all([
      fsp.readFile(file2, "utf-8"),
      fsp.stat(file2)
    ]);
    const header = /^-{3,}(.+)-{3,}/gs.exec(raw)?.[1];
    if (typeof header !== "string") throw new Error("Missing metadata");
    const metadata = Object.fromEntries(header.split(/\r?\n/).map((line) => line.split(":").map((x) => x.trim())));
    const created = truncateDay(maybe(fromString)(maybe(string("created"))(metadata.created)) ?? stat.birthtime);
    const updated = truncateDay(maybe(fromString)(maybe(string("updated"))(metadata.updated)) ?? stat.mtime);
    return {
      title: string("title")(metadata.title),
      description: maybe(string("description"))(metadata.description),
      url: maybe(string("url"))(metadata.url),
      ext: maybe(string("ext"))(metadata.ext),
      created,
      updated: updated.getTime() !== created.getTime() ? updated : null,
      template: null,
      body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, "")
    };
  } catch (err2) {
    throw new Error(`Failed to load ${file2}`, { cause: err2 });
  }
};

// src/lib/document.ts
var file = (url) => {
  if (url.endsWith("/")) return `${url}index.html`;
  if (/\.\w+$/.test(url)) return url;
  return `${url}.html`;
};
var render = (registry) => (doc) => doc.template?.(registry)(doc) ?? doc.body(registry);

// src/lib/url.ts
import path2 from "path";
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

// src/spider.ts
var Spider = class {
  #files;
  #documents;
  #exclude;
  #dirout;
  #root;
  #loaders;
  constructor(options) {
    this.#files = options.files;
    this.#documents = /* @__PURE__ */ new Map();
    this.#root = typeof options.root === "string" ? path3.normalize(options.root) : process.cwd();
    this.#exclude = options.exclude ?? [];
    this.#dirout = options.dirout ?? null;
    this.#loaders = /* @__PURE__ */ new Map();
    this.#loaders.set(".js", js);
    this.#loaders.set(".ts", js);
    this.#loaders.set(".md", md);
    if (options.loader) Object.entries(options.loader).forEach(([ext2, loader]) => this.#loaders.set(ext2, loader));
  }
  /** Write registry to `dirout` */
  async write() {
    try {
      if (typeof this.#dirout !== "string") throw new Error('Missing option "dirout"');
      const registry = new Registry(Array.from(this.#documents.values()));
      for (const node of registry.nodes) {
        const file2 = file(node.url);
        await fsp2.mkdir(path3.dirname(path3.join(this.#dirout, file2)), { recursive: true });
        await fsp2.writeFile(path3.join(this.#dirout, file2), render(registry)(node));
      }
      return registry;
    } catch (cause) {
      throw new Error("Failed to write", { cause });
    }
  }
  /** Load file into registry */
  async load(file2) {
    try {
      const draft = await this.#loaders.get(path3.extname(file2))?.(file2);
      if (!draft) throw new Error(`Unknown file type "${path3.extname(file2)}"`);
      if (typeof draft.url !== "string") draft.url = create(dirrel(this.#root)(file2))(draft.title);
      if (typeof draft.ext === "string") draft.url = ext(draft.url)(draft.ext);
      if (this.#documents.has(draft.url)) throw new Error(`Page already exists with url "${draft.url}"`);
      this.#documents.set(draft.url, draft);
    } catch (cause) {
      throw new Error(`Failed to load page "${file2}"`, { cause });
    }
  }
  /** Build project */
  async build() {
    try {
      for await (const file2 of fsp2.glob(this.#files, { exclude: this.#exclude })) await this.load(file2);
      return await this.write();
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
