import type { ParseOptions } from './parse';
import type { PathOptions } from './path';

import path from './path';
import parse from './parse';

export type SpiderOptions = {
  parser?: ParseOptions;
  path?: PathOptions;
};

export type SpiderResult = {
  path: string;
  html: string;
};

export default (options?: SpiderOptions) =>
  async (raw: string | Buffer): Promise<SpiderResult> => {
    const result = await parse(options?.parser)(raw);

    return {
      path: path(options?.path)(result.url),
      html: result.html
    };
  };
