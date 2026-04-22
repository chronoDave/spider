import path from 'path';

import { slugify } from './string.ts';

/** Get posix path relative to root */
export const rel = (root: string) =>
  (file: string) => {
    const rel = file.replace(root, '').replaceAll(path.win32.sep, path.posix.sep);
    if (rel.length === 0) return '/';

    return rel;
  };

/** Generate url */
export const url = (root: string) =>
  (file: string) =>
    (title: string) =>
      path.posix.join(rel(root)(path.dirname(file)), slugify(title));
