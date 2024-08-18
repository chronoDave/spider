import fsp from 'fs/promises';
import path from 'path';

export type Meta = {
  url: string;
  redirects?: string[];
};

export default async (file: string, outdir: string): Promise<{ file: string; redirects: string[] }> => {
  const { meta, html }: { meta: Meta; html: string } = await import(`file://${file}`);

  const root = path.join(outdir, meta.url);
  const out = path.join(root, 'index.html');

  await fsp.mkdir(root, { recursive: true });
  await fsp.writeFile(out, html, 'utf-8');

  return {
    file: out,
    redirects: meta.redirects ?? []
  };
};
