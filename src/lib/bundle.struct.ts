import fsp from 'fs/promises';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async () => {
  const tmp = path.join(process.cwd(), 'tmp');

  const invalid = {
    html: path.join(tmp, 'html.js'),
    url: path.join(tmp, 'url.js'),
    redirects: path.join(tmp, 'redirects.js')
  } as const;
  const empty = path.join(tmp, 'empty.js');
  const valid = path.join(tmp, 'valid.js');
  const nested = path.join(tmp, 'nested.js');

  await fsp.mkdir(tmp);
  await Promise.all([
    fsp.writeFile(invalid.url, 'export default { html: "", url: "", redirects: [] }'),
    fsp.writeFile(invalid.html, 'export default { html: 1, url: "/", redirects: [] }'),
    fsp.writeFile(invalid.redirects, 'export default { html: "", url: "/", redirects: [1] }'),
    fsp.writeFile(valid, 'export default { html: () => "<!doctype html><html lang=`en`><title>.</title></html>", url: "/", redirects: [] }'),
    fsp.writeFile(nested, 'export default { html: () => "<!doctype html><html lang=`en`><title>.</title></html>", url: "/chronocide/spider", redirects: [] }'),
    fsp.writeFile(empty, '')
  ]);

  return {
    valid,
    invalid,
    nested,
    empty,
    cleanup: async () => fsp.rm(tmp, { recursive: true, force: true })
  };
};