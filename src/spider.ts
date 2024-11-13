import fsp from 'fs/promises';
import path from 'path';

export type LoadOptions = {
  write?: boolean;
  outdir?: string;
};

export type LoadResult = {
  file: string;
  html: string;
};

export default (options?: LoadOptions) => async (file: string): Promise<LoadResult> => {
  const url = path.resolve(file) === path.normalize(file) ?
    file :
    path.join(process.cwd(), file);

  /**
   * Node caches ESM imports by default. Query parameters disable this behaviour
   * 
   * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
   */
  const [raw, stats] = await Promise.all([
    import(`file://${url}?${Date.now()}`),
    fsp.stat(url)
  ]);

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
      raw.default(stats)
  };

  if (options?.write) await fsp.writeFile(path.join(process.cwd(), result.file), result.html);

  return result;
};
