import path from 'path';

/**
 * Get posix directory relative to root:
 *
 * - `/Users`, `/Users` => `/`
 * - `/Users`, `/Users/a/b.html` => `/a`
 */
export const relative = (a: string) =>
  (b: string): string => {
    const rel = path.posix.relative(
      a.replaceAll(path.sep, path.posix.sep),
      b.replaceAll(path.sep, path.posix.sep)
    );

    return `/${rel.length === 0 ? rel : path.dirname(rel)}`;
  };
