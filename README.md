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

`spider` is a tiny TypeScript static site generator meant for small personal websites. It uses a modular plugin system for maximum flexibility.

## Features

- No dependencies
- No templating language, uses plain JS/TS
- Modular loaders, allowing any file type to be used
- Flexible API, every page has full access to the whole website allowing for the creation of RSS feeds, collection pages, etc.

## Installation

```sh
npm i @chronocide/spider
```

### Usage

#### `spider`

Builds static site

```ts
import spider from '@chronocide/spark';

await spider({
  files: ['src/**/*.ts', 'src/**/*.md'],
  root: 'src',
  dirout: 'build',
  exclude: ['**/*.spec.ts']
});
```

##### `SpiderOptions`

```ts
export type LoadContext = {
  root: string;
  file: string;
};
```

```ts
export type LoadResult = DocumentOptions;
```

```ts
export type Loader = (context: LoadContext) => Promise<LoadResult>;
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

import spider from '@chronocide/spider';

const loader: Loader = async context => ({
  title: 'loader',
  description: null,
  url: '/',
  ext: '.html',
  created: new Date(),
  updated: null,
  template: () => () => '',
  body: () => 'body'
});

await spider({
  files: ['src/**/*.ts', 'src/**/*.md'],
  root: 'src',
  dirout: 'build',
  exclude: ['**/*.spec.ts'],
  loader: {
    '.md': loader,
    '.ts': loader
  }
});
```