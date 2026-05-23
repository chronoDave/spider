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

`spider` is a tiny TypeScript static site generator (SSR) meant for small personal websites. It uses a modular plugin system for maximum flexibility.

## Features

- No dependencies
- No templating language, uses plain JS/TS
- Modular loaders, allowing any file type to be used
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

#### `spider`

Builds static site

```ts
import Spider from '@chronocide/spark';

const spider = new Spider({
  files: ['src/**/*.ts', 'src/**/*.md'],
  root: 'src',
  dirout: 'build',
  exclude: ['**/*.spec.ts']
});

spider.build();
```

```ts
import type { Template, Page } from '@chronocide/spider';

import h from '@chronocide/spark';

const template: Template = registry =>
  document => {
    const template = h('html')({ lang: 'en-GB' })(
      h('head')()(h('title')()()),
      h('body')()(document.body(registry))
    );

    return `<!DOCTYPE html>${template}`;
  };

const page: Page = {
  title: 'Home',
  url: '/',
  template,
  body: registry => h('main')()(
    h('p')()('This is a page'),
    h('a')({ href: registry.node('/about')?.url })(registry.node('/about')?.title)
  )
};

export default page;
```

##### `SpiderOptions`

```ts
export type PageOptions = {
  title: string;
  description: string | null;
  url: string;
  ext: string | null;
  created: Date;
  updated: Date | null;
  template: Template | null;
  body: Body | null;
};
```

```ts
export type Loader = (root: string) => (file: string) => Promise<PageOptions>;
```

```ts
type SpiderOptions = {
  files: string[];
  exclude?: string[];
  root?: string;
  dirout?: string;
  loader?: Record<string, Loader>;
}
```

- `files`, entry files. Supports [Node's glob pattern](https://nodejs.org/api/fs.html#fspromisesglobpattern-options).
- `exclude`, entry file filter. Supports [Node's glob pattern](https://nodejs.org/api/fs.html#fspromisesglobpattern-options).
- `root`, base directory relative to `files`.
- `dirout`, output directory. If empty, does not write files.
- `loader`, file loaders.

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
  body: registry => `<a href="${registry.node('/').title}">Home</a>`
});

const spider = new Spider({
  files: ['src/**/*.ts', 'src/**/*.md'],
  root: 'src',
  dirout: 'build',
  exclude: ['**/*.spec.ts'],
  loader: {
    '.md': loader,
    '.ts': loader
  }
});

spider.build();
```
