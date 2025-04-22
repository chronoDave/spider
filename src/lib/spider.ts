import type { ParseOptions } from './parse.ts';
import type { PathOptions } from './path.ts';

import path from './path.ts';
import parse from './parse.ts';

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
