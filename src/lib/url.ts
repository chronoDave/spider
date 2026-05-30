import path from 'path';

/** Get posix directory relative to root */
export const relative = (root: string) =>
  (file: string) => {
    const rel = file.replace(root, '').replaceAll(path.win32.sep, path.posix.sep);
    if (rel.length === 0) return '/';

    return `${path.dirname(rel)}/`;
  };
