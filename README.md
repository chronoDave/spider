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

Creates a bundle based on `Page`. `spider` currently only supports JavaScript [esm](https://nodejs.org/api/esm.html) exports.

```JS
import { bundle } from '@chronocide/spider';

const result = bundle('src/index.js'));
```

```TS
type BundleResult = {
  redirects: string[];
  path: string;
  html: string;
}
```
