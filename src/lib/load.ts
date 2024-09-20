import fsp from 'fs/promises';

import { absolute } from './path';

export type Metadata = {
  lastModified: Date;
};

export type LoadOptions = {
  /**
   * If `file` is a `Buffer`, `lastModified` cannot be determined.
   * `spider` will default to `new Date()`
  */
  lastModified?: Date;
  /** If true, show whole buffer in error stack trace */
  showBufferError?: boolean;
};

export type LoadResult = {
  metadata: Metadata;
  page: unknown;
};

export default async (file: string | Buffer, options?: LoadOptions): Promise<LoadResult> => {
  try {
    /**
     * Node caches ESM imports by default. Query params disable this behaviour
     * 
     * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
     */
    const module = Buffer.isBuffer(file) ?
      await import(`data:text/javascript;base64,${file.toString('base64')}?${Date.now()}`) :
      await import(`file://${absolute(file)}?${Date.now()}`);

    return {
      page: module.default,
      metadata: {
        lastModified: Buffer.isBuffer(file) ?
          options?.lastModified ?? new Date() :
          (await fsp.stat(file)).mtime
      }
    };
  } catch (err) {
    if (options?.showBufferError) throw err;
    if (!Buffer.isBuffer(file)) throw err;
    throw new Error(`${(err as Error).message}\n\tat <Buffer>`);
  }
};
