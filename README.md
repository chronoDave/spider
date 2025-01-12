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

`spider` only supports **JS** **ESM** exports. If you wish to use TypeScript, JSX or anything else, code must be transpiled to JS ESM. See [@chronocide/esbuild-plugin-spider](https://github.com/chronoDave/esbuild-plugin-spider) for an example.

### Single page

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
// index.js
export const url = '/';

/** fs.Stats is exposed when loading files */
export default ({ ctime }) => `<body>${ctime}</body>`;
```

The default `.html` can be overwritten by providing an extension.

```TS
// rss.js
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

```TS
import fs from 'fs';
import spider from '@chronocide/spider';

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
 * path: '/index.html'
 * html: '<body>Mon, 10 Oct 2011 23:24:11 GMT</body>'
 */
await spider()('index.js');

/**
 * path: '/rss.xml'
 * html: '<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Example Feed</title><link href="http://example.org/"/><updated>2003-12-13T18:30:02Z</updated><author><name>John Doe</name></author><id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id><entry><title>Atom-Powered Robots Run Amok</title><link href="http://example.org/2003/12/13/atom03"/><id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id><updated>2003-12-13T18:30:02Z</updated><summary>Some text.</summary></entry></feed>'
 */
await spider()('rss.js');

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