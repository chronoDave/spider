<div align="center">
  <h1>@chronocide/spider</h1>
  <p>Tiny static site generator</p>
  <a href="/LICENSE">
    <img alt="License GPLv3" src="https://img.shields.io/badge/license-GPLv3-blue.svg" />
  </a>
  <img alt="Bundle size" src="https://deno.bundlejs.com/?q=@chronocide/spider&badge">
  <a href="https://www.npmjs.com/package/@chronocide/spider">
    <img alt="NPM" src="https://img.shields.io/npm/v/@chronocide/spider?label=npm">
  </a>
</div>

---

`spider` is a tiny static site generator (SSR) meant for small websites. It uses a modular plugin system for maximum flexibility.

## Features

- No dependencies
- No templating language, uses plain JS/TS
- Modular loaders, allowing any file type to be used
  - By default, loads `.ts`, `.js` and `.md` files
- Flexible API, every page has full access to the whole website allowing for the creation of RSS feeds, collection pages, etc.
- Sensible defaults
  - Markdown file URL's are generated based on folder structure and blog post title (`/<folder>/<title>`)
  - Creation and update dates are truncated to days
  - Output files are HTML

## Installation

```sh
npm i @chronocide/spider
```

### Usage

#### URL / path resolution

File paths and url's are automatically generated, but can be overwritten manually. `spider` uses the following rules:

##### Path

- `/` + `index` => `/index.html`
- `/` + `about` => `/about/index.html`
- `/` + `about.html` => `/about.html`
- `/` + `about.xml` => `/about.xml`
- `/about` + `index` => `/about/index.html`
- `/about` + `me` => `/about/me/index.html`
- `/about` + `about` => `/about/index.html`
- `/about` + `about.html` => `/about/about.html`
- `/about` + `about.xml` => `/about/about.xml`

##### URL

- `/` + `index` => `/`
- `/` + `about` => `/about/`
- `/` + `about.html` => `/about`
- `/` + `about.xml` => `/about.xml`
- `/about` + `index` => `/about/`
- `/about` + `me` => `/about/me/`
- `/about` + `about` => `/about/`
- `/about` + `about.html` => `/about/about`
- `/about` + `about.xml` => `/about/about.xml`

#### `spider`

Builds static site

```ts
import Spider from '@chronocide/spark';

const spider = new Spider({
  entryPoints: ['src/**/*.ts', 'src/**/*.md']
  exclude: ['**/*.spec.ts'],
  root: 'src',
  outdir: 'build',
});

spider.build();
```

```ts
import type { Template, Draft } from '@chronocide/spider';

import h from '@chronocide/spark';

const template: Template = registry =>
  document => {
    const template = h('html')({ lang: 'en-GB' })(
      h('head')()(h('title')()()),
      h('body')()(document.body(registry))
    );

    return `<!DOCTYPE html>${template}`;
  };

const page: Draft = {
  title: 'Home',
  url: '/',
  template,
  body: registry => h('main')()(
    h('p')()('This is a page'),
    h('a')({ href: registry.node('/about/')?.value.url })(registry.node('/about')?.value.title)
  )
};

export default page;
```

##### `SpiderOptions`

```ts
export type LoaderResult = {
  title: string;
  description: string | null;
  url: string | null;
  ext: string | null;
  created: Date | null;
  updated: Date | null;
  template: Template | null;
  body: Body;
};
```

```ts
export type Loader = (file: string) => Promise<LoaderResult>;
```

```ts
export type SpiderOptions = {
  /** Supports [Node globs](https://github.com/isaacs/minimatch#features) */
  entryPoints: string[];
  /** Supports [Node globs](https://github.com/isaacs/minimatch#features) */
  exclude?: string[];
  /** Output directory */
  outdir?: string;
  /** Base directory */
  root?: string;
  /** File loaders */
  loader?: Record<string, Loader>;
}
```

#### `Loaders`

Loaders are used to load different file types. By default, `spider` supports loading `.js`, `.ts` and `.md` files. Loaders can be created or overwritten.

```ts
import type { Loader } from '@chronocide/spider';

import Spider from '@chronocide/spider';

const loader: Loader = async context => ({
  title: 'loader',
  description: null,
  url: '/',
  ext: '.html',
  created: new Date(),
  updated: null,
  template: registry => document => document.body(registry),
  body: registry => `<a href="${registry.get('/')?.value.title}">Home</a>`
});

const spider = new Spider({
  entryPoints: ['src/**/*.ts', 'src/**/*.md'],
  exclude: ['**/*.spec.ts'],
  root: 'src',
  outdir: 'build',
  loader: {
    '.md': loader,
    '.ts': loader
  }
});

spider.build();
```
