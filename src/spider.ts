import * as fs from './lib/fs.ts';
import * as load from './lib/load.ts';
import * as is from './lib/is.ts';

export type Options = {
  /** Can be file or directory. If directory, loads all files inside that directory. Accepts `*` as glob character. */
  entryPoints: string[];
  /** Output directory */
  outdir: string;
  /** If `false`, disables writing to `outdir`. Default `true` */
  write?: boolean;
};

export default async (options: Options) => {
  const pages = await Promise.all(options.entryPoints.map(fs.files))
    .then(files => files.flat())
    .then(async files => Promise.all(files.map(load.file)))
    .then(files => files.map(is.page));
};
