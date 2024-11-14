import type { Stats } from 'fs';

import fsp from 'fs/promises';
import path from 'path';

export type SpiderOptions = {
  write?: boolean;
  outdir?: string;
};

export type SpiderResult = {
  file: string;
  html: string;
};

const absolute = (file: string): string => path.resolve(file) === path.normalize(file) ?
  file :
  path.join(process.cwd(), file);

export default (options?: SpiderOptions) => async (file: string | Buffer, stats?: Stats): Promise<SpiderResult> => {
  try {
    /**
     * Node caches ESM imports by default. Query parameters disable this behaviour
     * 
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const raw = Buffer.isBuffer(file) ?
      await import(`data:text/javascript;base64,${file.toString('base64')}?${Date.now()}`) :
      await import(`file://${absolute(file)}?${Date.now()}`);

    if (typeof raw.url !== 'string' && !/^(\/$|(\/\S+)+\w$)/.test(raw.url)) throw new Error('Invalid export: url');
    if (
      typeof raw.default !== 'string' &&
      typeof raw.default !== 'function'
    ) throw new Error('Invalid default export');

    const result = {
      file: path.format({
        dir: [options?.outdir, ...raw.url.split('/').slice(1, -1)]
          .filter(x => x)
          .join(path.sep),
        name: /\/([^\/]+)$/.exec(raw.url)?.[1] ?? 'index',
        ext: '.html'
      }),
      html: typeof raw.default === 'string' ?
        raw.default :
        raw.default(stats ?? (typeof file === 'string' ? await fsp.stat(file) : null))
    };

    if (options?.write) {
      await fsp.mkdir(path.parse(result.file).dir, { recursive: true });
      await fsp.writeFile(path.join(process.cwd(), result.file), result.html);
    }

    return result;
  } catch (err) {
    if (Buffer.isBuffer(file)) throw new Error(`${(err as Error).message}\n\tat <buffer>`);
    throw err;
  }
};
