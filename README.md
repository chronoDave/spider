<div align="center">
  <h1>@chronocide/spider</h1>
  <p>Simple static HTML builder.</p>
</div>

<div align="center">
  <a href="/LICENSE">
    <img alt="License GPLv3" src="https://img.shields.io/badge/license-GPLv3-blue.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@chronocide/spider">
    <img alt="NPM" src="https://img.shields.io/npm/v/@chronocide/spider?label=npm">
  </a>
  <a href="https://packagephobia.com/result?p=@chronocide/spider">
    <img alt="Bundle size" src="https://packagephobia.com/badge?p=@chronocide/spider">
  </a>
</div>

## Install

Install using [npm](npmjs.org):

```sh
npm i @chronocide/spider
```

## Usage

`spider` only supports **JS** **ESM** exports. If you wish to use TypeScript, JSX or anything else, code must be transpiled to JS ESM. See [@chronocide/esbuild-plugin-spider](https://github.com/chronoDave/esbuild-plugin-spider) for an examples.

### Single page

```TS
// index.js
export const url = '/';

export default ({ ctime }) => `<body>${ctime}</body>`;
```

```TS
// about.js
export const url = '/about';

export default '<h1>About</h1>';
```

```TS
// about-spider.js
export const url = '/about/spider';

export default '<h1>About spider</h1>';
```

```TS
import fs from 'fs';
import spider from '@chronocide/spider';

/**
 * path: '/index.html'
 * html: '<body>Mon, 10 Oct 2011 23:24:11 GMT</body>'
 */
await spider()('index.js');

/**
 * path: '/about.html'
 * html: '<h1>About</h1>'
 */
await spider()('about.js');

/**
 * path: '/about/spider.html'
 * html: '<h1>About spider</h1>'
 */
await spider()('about-spider.js');

/**
 * path: 'www/about/spider.html'
 * html: '<h1>About spider</h1>'
 */
await spider({ outdir: 'www' })('about-spider.js');
```

### Multiple pages

```TS
// blogs.js
import fsp from 'fs/promises';
import path from 'path';

const files = await Promise.all(fsp.readdir(path.join(process.cwd(), 'src/blog/posts')));
const pages = await Promise.all(files.map(file => {
  const { name } = path.parse(file);
  const html = await fs.readFile(file, 'utf-8');

  return ({
    url: `/blog/${name}`,
    html
  });
}));

export default pages;
```

```TS
import fs from 'fs';
import spider from '@chronocide/spider';

/**
 * path: '/blog/<name>'
 * html: '<blog>'
 */
await spider()('blogs.js');
```