import path from 'path';

/** Get relative POSIX directory from root */
export const rel = (root: string) =>
  (file: string) => {
    const rel = file.replace(root, '').replaceAll(path.win32.sep, path.posix.sep);
    if (rel.length === 0) return '/';

    return rel;
  };
