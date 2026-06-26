import path from 'path';

/** Get posix directory relative to root */
export const relative = (from: string) =>
  (to: string): string => {
    const rel = path.posix.relative(
      from.replaceAll(path.sep, path.posix.sep),
      to.replaceAll(path.sep, path.posix.sep)
    );

    return `/${rel.length === 0 ? rel : path.dirname(rel)}`;
  };
