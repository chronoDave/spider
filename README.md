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

## API

### `spider`

```TS
(options?: SpiderOptions) =>
  (file: string | Buffer, stats?: fs.Stats) =>
    Promise<SpiderResult>
```

### `LoadOptions`

```TS
export type SpiderOptions = {
  write?: boolean;
  outdir?: string;
};
```

### `LoadResult`

```TS
export type SpiderResult = {
  file: string;
  html: string;
};
```