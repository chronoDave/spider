import type { LoadOptions } from './load';

import path from 'path';

import * as is from './is';
import load from './load';

export type Page = {
  url: string;
  html: string;
  redirects?: string[];
};

export type BundleOptions = LoadOptions;

export type BundleResult = {
  redirects: string[];
  path: string;
  html: string;
};

const message = (file: string | Buffer) => (message: string) => {
  const source = typeof file === 'string' ?
    `${file}` :
    '<Buffer>';

  return `${message} at ${source}`;
};

export const bundle = async (file: string | Buffer, options?: BundleOptions): Promise<BundleResult | null> => {
  const page = await load(file, options);

  if (!page || page === '') return null;

  if (!is.record(page)) {
    throw new Error(message(file)('Invalid default export, expected `Page`'));
  }

  if (typeof page.url !== 'string') {
    throw new Error(message(file)('Invalid type `url`, expected `string`'));
  }

  if (!is.url(page.url)) {
    throw new Error(message(file)('Invalid `url`, expected valid url'));
  }

  if (typeof page.html !== 'string') {
    throw new Error(message(file)('Invalid type `html`, expected `string`'));
  }

  if (Array.isArray(page.redirects) && !page.redirects.every(is.string)) {
    throw new Error(message(file)('Invalid type `redirects`, expected `string[]`'));
  }

  return {
    redirects: (page.redirects as Page['redirects']) ?? [],
    path: page.url.length === 1 ?
      'index.html' :
      path.format({
        dir: page.url.split('/').slice(0, -1).join(path.sep),
        name: page.url.split('/').slice(-1)[0],
        ext: 'html'
      }),
    html: page.html
  };
};
