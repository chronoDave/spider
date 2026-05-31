import type Registry from './registry.ts';

export type Template = (registry: Registry) => (doc: Document) => string;

export type Body = (registry: Registry) => string;

export type Document = {
  readonly title: string;
  readonly description: string | null;
  readonly url: string;
  readonly created: Date;
  readonly updated: Date | null;
  readonly template: Template | null;
  readonly body: Body;
};

export const file = (url: string): string => {
  if (url.endsWith('/')) return `${url}index.html`;
  if (/\.\w+$/.test(url)) return url;
  return `${url}.html`;
};

export const render = (registry: Registry) =>
  (doc: Document): string =>
    doc.template?.(registry)(doc) ?? doc.body(registry);
