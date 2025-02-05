<div align="center">
  <h1>@chronocide/spider</h1>
  <p>A tiny static HTML builder</p>
  <a href="/LICENSE">
    <img alt="License GPLv3" src="https://img.shields.io/badge/license-GPLv3-blue.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@chronocide/spider">
    <img alt="NPM" src="https://img.shields.io/npm/v/@chronocide/spider?label=npm">
  </a>
  <img src="https://img.badgesize.com/nevware21/badgesize/main/README.md" alt="" />
</div>

## Install

Install using [npm](npmjs.org):

```sh
npm i @chronocide/spider
```

## API

 - `outdir`: Output root directory. Default `process.cwd()`
 - `properties`: Property mapping, accepts dot notation. Default `{ url: 'url', html: 'default' }`

## Usage

`spider` only supports JavaScript ESM exports. If you wish to use TypeScript, JSX or anything else, your code must be transpiled to JS ESM.

See [@chronocide/esbuild-plugin-spider](https://github.com/chronoDave/esbuild-plugin-spider) for an example.

### Simple

```JS
// src/index.js
export const url = '/';

export default '<h1>Hello world!</h1>';
```

```JS
// build.js
import fsp from 'fs/promises';
import spider from '@chronocide/spider';

const page = await spider({ outdir: 'dist' })('/src/index.js');

await fsp.writeFile(page.path, page.html);
```

### Advanced

```JS
// src/index.js
export const meta = {
  title: 'Home',
  url: '/'
}

export default `<h1>${meta.title}</h1>`;
```

```JS
// build.js
import fsp from 'fs/promises';
import spider from '@chronocide/spider';

const page = await spider({
  outdir: 'dist',
  properties: { url: 'meta.url' }
})('/src/index.js');

await fsp.writeFile(page.path, page.html);
```

### RSS

```JS
// src/rss.js
export const url = 'rss.xml';

export default `
  <?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>Example Feed</title>
    <link href="http://example.org/"/>
    <updated>2003-12-13T18:30:02Z</updated>
    <author>
      <name>John Doe</name>
    </author>
    <id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>

    <entry>
      <title>Atom-Powered Robots Run Amok</title>
      <link href="http://example.org/2003/12/13/atom03"/>
      <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
      <updated>2003-12-13T18:30:02Z</updated>
      <summary>Some text.</summary>
    </entry>
  </feed>
`;
```

```JS
// build.js
import fsp from 'fs/promises';
import spider from '@chronocide/spider';

const page = await spider({ outdir: 'dist' })('/src/rss.js');

await fsp.writeFile(page.path, page.html);
```
