import fsp from 'fs/promises';
import path from 'path';

export type Meta = {
  url: string;
  redirects?: string[];
};

export type WriteOptions = {
  file: string;
  dirout: string;
};

export type File = {
  path: string;
  redirects?: string[];
};

export default async (options: WriteOptions): Promise<File> => {
  const { meta, html }: { meta: Meta; html: string } = await import(`file://${options.file}`);

  const root = path.join(options.dirout, meta.url);
  const file = path.join(root, 'index.html');

  await fsp.mkdir(root, { recursive: true });
  await fsp.writeFile(file, html, 'utf-8');

  return {
    path: file,
    redirects: meta.redirects ?? []
  };
};
