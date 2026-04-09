export type Metadata = {
  created: Date;
  updated: Date | null;
};

export type Page = {
  url: string;
  html: (metadata: Metadata) => string;
};

/** Throws if `x` is not of type `Page` */
export const page = (x: Record<string, unknown>): Page => {
  if (typeof x.url !== 'string') throw new Error('Missing export: "url"');
  if (typeof x.html !== 'function') throw new Error('Missing export: "html"');

  return x as Page;
};
