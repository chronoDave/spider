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

#### `bundle`

`bundle` creates a page bundle based on a meta file. The meta file is expected to be in `json` format.

```JSON
{
  "url": "/about"
}
```

```TS
import { bundle } from '@chronocide/spider';

const result = bundle(path.join(process.cwd(), 'src/index.json'));
```

```TS
type BundleOptions = {
  /** Page file name, defaults to `<meta.name>` */
  name?: string;
  /** Page file extension, defaults to `js` */
  ext?: string;
};
```

```TS
type BundleResult = {
  redirects: string[] | null;
  in: string; // Absolute page path
  out: string; // Relative output path
}
```

```TS
type Meta = {
  url: string;
  redirects: string[] | null;
}
```

#### `build`

`build` transforms a JavaScript file into an HTML file. The JavaScript file must default export a `string`.

```TS
export default '<!doctype html><html lang="en"><title>.</title></html>';
```

```TS
import { build } from '@chronocide/spider';

const result = build(path.join(process.cwd(), 'src/index.json'));
```

```TS
type BuildOptions = {
  /** Output directory */
  outdir?: string;
  /** Should file contents be written to disk, default `false` */
  write?: boolean;
  /** Page file name, defaults to `<meta.name>` */
  name?: string;
  loader?: {
    type: string;
    /** Output should default export an HTML string */
    transform: (raw: string) => string;
  };
};
```

```TS
type BuildResult = {
  redirects: string[] | null;
  path: string;
  html: string;
};
```