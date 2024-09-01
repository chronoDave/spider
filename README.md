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

## Usage

### Installation

Install using [npm](npmjs.org):

```sh
npm i @chronocide/spider
```

### API

#### `Page`

```TS
type Page = {
  url: string; // Expected URL structure, e.g. /about/spider
  html: string; // HTML string
  redirects?: string[]; // List of old URL's
}
```

#### `bundle`

Creates a bundle if file or buffer contains a default exported `Page`. `spider` currently only supports JavaScript [esm](https://nodejs.org/api/esm.html) exports.

The relative output path of the page file is equal to the url defined in `Page`.

```JS
// src/about/spider/index.js
export default {
  url: '/',
  html: '<body></body>'
}
```

```JS
import fs from 'fs';
import { bundle } from '@chronocide/spider';

// File path
bundle('src/about/spider/index.js'));

// Buffer
const buffer = fs.readFileSync('src/about/spider/index.js');
bundle(buffer);

// Output
// {
//   redirects: [],
//   path: '/index.html',
//   html: '<body></body>'
// }
```

```TS
type BundleResult = {
  redirects: string[];
  path: string;
  html: string;
}

type BundleOptions = {
  /** If true, show whole buffer in error stack trace */
  showBufferError?: boolean
}
```
