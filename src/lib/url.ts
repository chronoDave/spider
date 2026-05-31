import path from 'path';

import { slugify } from './string.ts';

/** Get posix directory relative to root */
export const dirrel = (root: string) =>
  (file: string): string => {
    const rel = file.replace(root, '').replaceAll(path.win32.sep, path.posix.sep);
    if (rel.length === 0) return '/';

    const dir = path.dirname(rel);
    if (dir.endsWith('/')) return dir;

    return `${dir}/`;
  };

/**
 * Generate url from title and directory. Will always end with `/`
 *
 * - `/`, `about` => `/about/`
 * - `/`, `index` => `/`
 * - `/about/`, `me` => `/about/me/`
 * - `/about/`, `about` => `/about/`
 * - `/about`, `index` => `/about/`
 */
export const create = (dir: string) =>
  (title: string): string => {
    const slug = slugify(title);

    if (
      slug === 'index' ||
      dir.slice(0, -1).endsWith(slug)
    ) return dir;

    return `${dir}${slug}/`;
  };

/** Append file extension to url, replace if ext already exists */
export const ext = (url: string) =>
  (ext: string): string => {
    if (/\.\w+$/.test(url)) return url.replace(/\.\w+$/, ext);
    if (url.endsWith('/')) return `${url}index${ext}`;
    return `${url}${ext}`;
  };
