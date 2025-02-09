import path from 'path';

export type PathOptions = {
  /** Output root directory. Default `process.cwd()` */
  outdir?: string;
};

/**
 * `/` => `/index.html`
 * `/about` => `/about.html`
 * `/about/` => `/about/index.html`
 */
export default (options?: PathOptions) =>
  (url: string): string => {
    const chunks = url.split('/').filter(x => x.length > 0);
    const name = url.endsWith('/') ?
      'index' :
      chunks[chunks.length - 1];
    const ext = /\.(\w+[^\.])$/.exec(name)?.[0] ?? '.html';

    return path.format({
      name: name.replace(ext, ''),
      ext,
      dir: [options?.outdir, ...chunks.slice(0, name === 'index' ? undefined : -1)]
        .filter(x => x)
        .join(path.sep)
    });
  };
