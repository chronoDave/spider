import path from 'path';

const absolute = (file: string): string => path.resolve(file) === path.normalize(file) ?
  file :
  path.join(process.cwd(), file);

/**
 * Node caches ESM imports by default. Query parameters disable this behaviour
 * 
 * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
 */
export const file = async <T extends Record<string, unknown>>(file: string): Promise<T> =>
  import(`file://${absolute(file)}?${Date.now()}`);

export const buffer = async <T extends Record<string, unknown>>(buffer: Buffer): Promise<T> =>
  import(`data:text/javascript;base64,${buffer.toString('base64')}`);
