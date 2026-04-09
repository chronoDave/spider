import path from 'path';

export const file = async (file: string): Promise<Record<string, unknown>> => {
  /**
   * Force cache-busting as Node caches ESM imports by default.
   *
   * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
   */
  return import(`file://${path.resolve(file)}?${Date.now()}`);
};
