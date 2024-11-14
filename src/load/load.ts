import type { Stats } from 'fs';

import path from 'path';

type Html = string | ((stats: Stats | null) => string);

type Raw = {
  url: string;
  default: Html;
} | {
  default: Array<{
    url: string;
    html: string;
  }>;
};

export type Page = {
  url: string;
  html: Html;
};

const absolute = (file: string): string => path.resolve(file) === path.normalize(file) ?
  file :
  path.join(process.cwd(), file);

export default async (file: string | Buffer): Promise<Page[]> => {
  try {
    /**
     * Node caches ESM imports by default. Query parameters disable this behaviour
     * 
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const raw: Raw = Buffer.isBuffer(file) ?
      await import(`data:text/javascript;base64,${file.toString('base64')}`) :
      await import(`file://${absolute(file)}?${Date.now()}`);

    if (Array.isArray(raw.default)) return raw.default;
    if (!('url' in raw)) throw new Error('Missing export: url');
    return [{ url: raw.url, html: raw.default }];
  } catch (err) {
    if (Buffer.isBuffer(file)) throw new Error(`${(err as Error).message}\n\tat <buffer>`);
    throw err;
  }
};
