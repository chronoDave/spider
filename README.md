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

- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Example](#example)
- [API](#api)
  - [Registry](#registry)
  - [URL](#url)
  - [Path](#path)
  - [Loader](#loader)
  - [Plugins](#plugins)

## Features

- No dependencies
- No templating language, uses plain JS/TS
- Modular loaders, allowing any file type to be used
  - By default, loads `.ts`, `.js` and `.md` files
- Flexible API, every page has full access to the whole website allowing for the creation of RSS feeds, collection pages, etc.
- Sensible defaults
  - File URL's are generated based on folder structure and title (`/<folder>/<title>`)
  - Creation and update dates are truncated to days
  - Output files are HTML

## Getting Started

### Installation

```sh
npm i @chronocide/spider -D
```

### Example

A quick example of how `spider` can be used to create a website.

**src/about.ts**

```ts
import type { Draft } from '@chronocide/spider';

const page: Draft = {
  title: 'About',
  body: () => 'This is my page'
};

export default page;
```

**build.ts**

```ts
import Spider from '@chronocide/spark';

const spider = new Spider({
  entryPoints: ['src/**/*.ts']
  root: 'src',
  outdir: 'build',
});

spider.build();
```

Running the build script creates `build/about/index.html`:

```sh
node scripts/build.ts
```

## API

### Registry

The registry contains a list (flat and tree) of page nodes. A node contains a page and references to its children. This allows for easy generation of RSS feeds, breadcrumbs and other patterns that require site structure information.

Some examples:

```ts
import type { Draft } from '@chronocide/spider';

const page: Draft = {
  title: 'blogs',
  body: registry => `<ul>${registry.get('/blogs/')?.children.map(child => {
    const { url, title } = child.value;

    return `<li><a href="${url}">${title}</a></li>`;
  })}</ul>`
};

export default page;
```

```ts
import type { Draft, Node, Page } from '@chronocide/spider';

const page: Draft = {
  title: 'breadcrumbs',
  body: registry => {
    const breadcrumbs: Node<Page>[];
    let current = registry.get('/a/b/c/');

    while (current) {
      breadcrumbs.push(current);
      current = current.parent;
    }

    return `<nav aria-description="Breadcrumbs">
      <ol>
        ${breadcrumbs.reverse().map((node, i) => `<li>
          <a href=${node.value.url} ${i === breadcrumbs.length - 1 ? 'aria-current="page"' : ''}>${node.value.title}</a>
        </li>`)}
      </ol>
    </nav>`;
  }
};

export default page;
```

```TS
import type { Draft, Node, Page } from '@chronocide/spider';

const page: Draft = {
  title: 'sitemap',
  body: registry => {
    const render = (node: Node<Page>) => `<li>
      <a href="${node.value.url}">${node.value.title}</a>
      <ul>${node.children.map(render).join('')}</ul>
    </li>`;

    return `<ul>${render(registry.get('/')).join('')}</ul>`
  }
};

export default page;
```

### URL

If `url` is not set, `spider` will generate the URL based on directory (relative to root), name and extension

| `dir` | `name` | `ext` | `output` |
| - | - | - | - |
| `/` | `index` | - | `/` |
| `/` | `about` | - | `/about` |
| `/` | `about` | `.html` | `/about` |
| `/` | `about` | `.xml` | `/about.xml` |
| `/about` | `index` | - | `/about/` |
| `/about` | `me` | - | `/about/me/` |
| `/about` | `about` | - | `/about/` |
| `/about` | `about` | `.html` | `/about/about` |
| `/about` | `about` | `.xml` | `/about/about.xml` |

### Path

If `url` is not set, `spider` will generate the path based on directory (relative to root), name and extension.

| `dir` | `name` | `ext` | `output` |
| - | - | - | - |
| `/` | `index` | - | `/index.html` |
| `/` | `about` | - | `/about/index.html` |
| `/` | `about` | `.html` | `/about.html` |
| `/` | `about` | `.xml` | `/about.xml` |
| `/about` | `index` | - | `/about/index.html` |
| `/about` | `me` | - | `/about/me/index.html` |
| `/about` | `about` | - | `/about/index.html` |
| `/about` | `about` | `.html` | `/about/about.html` |
| `/about` | `about` | `.xml` | `/about/about.xml` |

### Loader

Loaders are used to load different file types. By default, `spider` supports loading `.js`, `.ts` and `.md` files. Loaders can be created or overwritten. An example loader for `.txt` files:

```ts
import type { Loader } from '@chronocide/spider';

import fsp from 'fs/promises';
import path from 'path';
import Spider from '@chronocide/spider';

const loader: Loader = async file => {
  const raw = await fsp.readFile(file, 'utf-8');
  const { name } = path.parse(file);

  return {
    title: name,
    description: null,
    url: null,
    ext: null,
    created: null,
    updated: null,
    template: null,
    body: () => raw
  }
};

const spider = new Spider({
  entryPoints: ['src/**/*.txt'],
  root: 'src',
  outdir: 'build',
  loader: {
    '.txt': loader
  }
});

spider.build();
```

### Plugins

Plugins can be used to transform data throughout the build process.

#### `write`

`plugin.write` is called after rendering and before writing the output file to disk (if `outdir` is enabled). Plugins are called in order, for example:

```ts
import type { Plugin } from '@chronocide/spider';

import Spider from '@chronocide/spider';

const a: Plugin = {
  name: 'a',
  write: html => `${html}a`
}

const b: Plugin = {
  name: 'b',
  write: html => `${html}b`
}

const spider = new Spider({
  entryPoints: ['src/**/*.ts'],
  root: 'src',
  plugins: [a, b]
});

const { outputFiles } = await spider.build();
```

will result in all files ending with `ab`. This can be useful for post-processing HTML, such as calculating and adding file size to the rendered HTML.
