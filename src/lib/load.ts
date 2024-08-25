import { absolute } from './path';

export type Page = {
  url: string;
  html: string;
  redirects?: string[];
};

export type LoadOptions = {
  showBufferError?: boolean;
};

export default async (file: string | Buffer, options?: LoadOptions): Promise<Page> => {
  try {
    const module = typeof file === 'string' ?
      await import(`file://${absolute(file)}`) :
      await import(`data:text/javascript;base64,${file.toString('base64')}`);

    return module.default;
  } catch (err) {
    if (options?.showBufferError) throw err;
    if (!Buffer.isBuffer(file)) throw err;
    throw new Error(`<Buffer>: ${(err as Error).message}`);
  }
};
