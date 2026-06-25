import type { Draft } from './loader.ts';

import path from 'path';

import { maybe } from './fn.ts';
import { slugify } from './string.ts';

/** Get posix directory relative to root */
export const relative = (from: string) =>
  (to: string): string => path.posix.dirname(path.posix.relative(
    from.replaceAll(path.sep, path.posix.sep),
    to.replaceAll(path.sep, path.posix.sep)
  ));

/** Create path from draft */
export const create = (dir: string) =>
  (draft: Draft) => {
    const name = maybe(path.posix.parse)(draft.url)?.name ?? slugify(draft.title);
    const ext = draft.ext ?? maybe(path.posix.parse)(draft.url)?.ext ?? '.html';

    return path.posix.format({
      dir: name === 'index' ?
        dir :
        path.posix.join(dir, name),
      name: 'index',
      ext
    });
  };
