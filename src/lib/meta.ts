import * as json from './json';
import * as is from './is';

export type Meta = {
  url: string;
  redirects: string[] | null;
};

/**
 * Read and verify meta file
 * @param url - Absolute file path
 */
export const read = async (url: string): Promise<Meta> => {
  const raw = await json.read(url);

  if (Array.isArray(raw)) {
    throw new Error('Invalid meta file, expected `object`');
  }

  if (typeof raw.url !== 'string') {
    throw new Error('Invalid type `url`, expected `string`');
  }

  if (!is.url(raw.url)) {
    throw new Error('Invalid `url`, expected valid url');
  }

  if (Array.isArray(raw.redirects) && !raw.redirects.every(is.string)) {
    throw new Error('Invalid type `redirects`, expected `string[]`');
  }

  return {
    url: raw.url,
    redirects: Array.isArray(raw.redirects) && raw.redirects.every(is.string) ?
      raw.redirects :
      null
  };
};
