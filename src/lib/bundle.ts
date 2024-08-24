import path from 'path';
import { absolute } from './path';

import * as is from './is';

export type Page = {
  url: string;
  html: string;
  redirects?: string[];
};

export type BundleResult = {
  redirects: string[];
  path: string;
  html: string;
};

export const bundle = async (file: string | Buffer): Promise<BundleResult> => {
  const { default: page } = (
    typeof file === 'string' ?
      await import(`file://${absolute(file)}`) :
      await import(`data:text/javascript;base64,${file.toString('base64')}`)
  ) as { default: Page };

  if (typeof page.url !== 'string') {
    throw new Error('Invalid type `url`, expected `string`');
  }

  if (!is.url(page.url)) {
    throw new Error('Invalid `url`, expected valid url');
  }

  if (typeof page.html !== 'string') {
    throw new Error('Invalid type `html`, expected `string`');
  }

  if (Array.isArray(page.redirects) && !page.redirects.every(is.string)) {
    throw new Error('Invalid type `redirects`, expected `string[]`');
  }

  return {
    redirects: page.redirects ?? [],
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
