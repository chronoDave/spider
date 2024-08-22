import fsp from 'fs/promises';
import path from 'path';

import { bundle } from './bundle';

export type BuildOptions = {
  /** Output directory */
  outdir?: string;
  /** Should file contents be written to disk, default `false` */
  write?: boolean;
  /** Page file name, defaults to `<meta.name>` */
  name?: string;
  loader?: {
    type: string;
    /** Output should default export an HTML string */
    transform: (raw: string) => string;
  };
};

export type BuildResult = {
  redirects: string[] | null;
  path: string;
  html: string;
};

export const build = async (url: string, options?: BuildOptions): Promise<BuildResult> => {
  const result = await bundle(url, {
    name: options?.name,
    ext: options?.loader?.type
  });

  const { default: html } = await import(options?.loader ?
    `data:text/javascript,${options.loader.transform(await fsp.readFile(result.in, 'utf-8'))}` :
    `file://${result.in}`
  );

  const dirout = options?.outdir ?
    path.isAbsolute(options.outdir) ?
      options.outdir :
      path.join(process.cwd(), options.outdir) :
    process.cwd();
  const file = path.join(dirout, result.out);

  if (options?.write) {
    await fsp.mkdir(dirout, { recursive: true });
    await fsp.writeFile(file, html);
  }

  return {
    redirects: result.redirects,
    path: file,
    html
  };
};
