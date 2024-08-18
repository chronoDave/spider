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
  <a href="https://bundlephobia.com/result?p=@chronocide/spider@latest">
    <img alt="Bundle size" src="https://img.shields.io/bundlephobia/minzip/@chronocide/spider@latest.svg">
  </a>
</div>

## Getting Started

### Installation

```sh
npm i @chronocide/spider
```

### Example

```TS
import { bundle } from '@chronocide/spider';

const { redirects } = await bundle({
  root: 'src',
  pattern: '**/*.js',
  dirout: 'dist'
});
```