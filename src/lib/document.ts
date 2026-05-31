import type Registry from './registry.ts';

import { slugify } from './string.ts';

export type Template = (registry: Registry) => (doc: Document) => string;

export type Body = (registry: Registry) => string;

export type Document = {
  readonly title: string;
  readonly description: string | null;
  readonly url: string;
  readonly ext: string;
  readonly created: Date;
  readonly updated: Date | null;
  readonly template: Template | null;
  readonly body: Body;
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
export const url = (ext: string) =>
  (dir: string) =>
    (title: string) => {
      const slug = slugify(title);

      if (ext !== '.html') {
        if (dir.slice(0, -1).endsWith(slug)) return `${dir.slice(0, -1)}${ext}`;
        return `${dir}${slug}${ext}`;
      }

      if (
        slug === 'index' ||
        dir.slice(0, -1).endsWith(slug)
      ) return dir;

      return `${dir}${slug}/`;
    };

export const file = (url: string) =>
  (ext: string): string => {
    let file = url;
    if (file.endsWith('/')) file = `${file}index`;
    if (!/\.\w+/.test(file)) file = `${file}${ext}`;

    return file;
  };

export const render = (registry: Registry) =>
  (doc: Document): string =>
    doc.template?.(registry)(doc) ?? doc.body(registry);
