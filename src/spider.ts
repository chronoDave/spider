import type { ParseOptions } from './lib/parse';

import path from './lib/path';
import parse from './lib/parse';

export type SpiderOptions = {
  /** Output root directory. Default `process.cwd()` */
  outdir?: string;
  /** Property mapping. Default `{ url: 'url', html: 'default' }` */
  properties?: ParseOptions;
};

export type SpiderResult = {
  path: string;
  html: string;
};

export default (options?: SpiderOptions) =>
  async (raw: string | Buffer): Promise<SpiderResult> => {
    const result = await parse(options?.properties)(raw);

    return {
      path: path(options)(result.url),
      html: result.html
    };
  };
