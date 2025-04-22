import * as load from './load.ts';

/** Export mapping */
export type ParseOptions = {
  /** Default `url` */
  url?: (raw: Record<string, unknown>) => string;
  /** Default `default` */
  html?: (raw: Record<string, unknown>) => string;
};

export type ParseResult = {
  url: string;
  html: string;
};

export default (options?: ParseOptions) =>
  async (input: string | Buffer): Promise<ParseResult> => {
    try {
      const raw = Buffer.isBuffer(input) ?
        await load.buffer(input) :
        await load.file(input);

      const url = options?.url?.(raw) ?? raw.url;
      if (typeof url !== 'string') throw new Error('Missing export: "url"');

      const html = options?.html?.(raw) ?? raw.default;
      if (typeof html !== 'string') throw new Error('Missing export: "html"');

      return { url, html };
    } catch (err) {
      if (Buffer.isBuffer(input)) throw new Error(`${(err as Error).message}\n\tat <buffer>`);
      throw err;
    }
  };
