import * as load from './load';
import get from './get';

/** Export mapping */
export type ParseOptions = {
  /** Default `url` */
  url?: string;
  /** Default `default` */
  html?: string;
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
      const prop = get(raw);

      const url = prop(options?.url ?? 'url');
      if (typeof url !== 'string') throw new Error('Missing export: "url"');

      const html = prop(options?.html ?? 'default');
      if (typeof html !== 'string') throw new Error('Missing export: "html"');

      return { url, html };
    } catch (err) {
      if (Buffer.isBuffer(input)) throw new Error(`${(err as Error).message}\n\tat <buffer>`);
      throw err;
    }
  };
