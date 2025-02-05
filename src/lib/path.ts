import path from 'path';

export type PathOptions = {
  outdir?: string;
};

export default (options?: PathOptions) =>
  (url: string): string => {
    const chunks = url.split('/').filter(x => x.length > 0);
    const file = chunks[Math.max(0, chunks.length - 1)] ?? 'index';
    const ext = /\.(\w+[^\.])$/.exec(file)?.[0];

    return path.format({
      dir: [options?.outdir, ...chunks.slice(0, -1)]
        .filter(x => x)
        .join(path.sep),
      name: typeof ext === 'string' ?
        file.replace(ext, '') :
        file,
      ext: ext ?? '.html'
    });
  };
