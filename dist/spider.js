var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/spider.ts
import fsp2 from "fs/promises";
import path2 from "path";

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
import path from "path";

// src/lib/string.ts
var slugify = (x) => x.trim().replace(/\s+/g, "-").normalize("NFD").replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, "").replace(/-+/g, "-").toLocaleLowerCase();

// src/lib/path.ts
var rel = (root) => (file) => {
  const rel2 = file.replace(root, "").replaceAll(path.win32.sep, path.posix.sep);
  if (rel2.length === 0) return "/";
  return rel2;
};
var url = (root) => (file) => (title) => path.posix.join(rel(root)(path.dirname(file)), slugify(title));

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
var js = async (context) => {
  const [raw, stat] = await Promise.all([
    import(`file://${resolve(context.file)}?${Date.now()}`),
    fsp.stat(context.file)
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
    url: url2 ?? url(context.root)(context.file)(title),
    ext: ext ?? ".html",
    created,
    updated: updated.getTime() === created.getTime() ? null : updated,
    template,
    body
  };
};
var md = async (context) => {
  const [raw, stat] = await Promise.all([
    fsp.readFile(context.file, "utf-8"),
    fsp.stat(context.file)
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
    url: url2 ?? url(context.root)(context.file)(title),
    ext: ext ?? ".html",
    created,
    updated: updated.getTime() === created.getTime() ? null : updated,
    template: (registry) => (document) => document.body(registry),
    body: () => raw.replace(/^-{3,}.+-{3,}(\r?\n)*/gs, "")
  };
};

// src/spider.ts
var spider_default = async (options) => {
  const registry = /* @__PURE__ */ new Map();
  const root = options.root ?? process.cwd();
  const loaders = /* @__PURE__ */ new Map();
  loaders.set(".md", md);
  loaders.set(".js", js);
  loaders.set(".ts", js);
  if (options.loader) Object.entries(loader_exports).forEach(([ext, loader]) => loaders.set(ext, loader));
  for await (const file of fsp2.glob(options.files, { exclude: options.exclude })) {
    const err2 = (reason) => new Error(`Failed to load page "${file}"`, { cause: new Error(reason) });
    const result = await loaders.get(path2.extname(file))?.({ root, file });
    if (!result) throw err2(`Unknown file type "${path2.extname(file)}"`);
    if (registry.has(result.url)) throw err2(`Page already exists with url "${result.url}"`);
    registry.set(result.url, result);
  }
  if (typeof options.dirout === "string") {
    for (const result of registry.values()) {
      let url2 = result.url;
      if (url2.endsWith("/")) url2 = `${url2}index`;
      await fsp2.mkdir(path2.join(options.dirout, path2.dirname(result.url)), { recursive: true });
      await fsp2.writeFile(path2.join(options.dirout, `${url2}${result.ext}`), result.template(registry)(result));
    }
  }
  return registry;
};
export {
  spider_default as default
};
