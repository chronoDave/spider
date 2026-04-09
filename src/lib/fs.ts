import fsp from 'fs/promises';
import path from 'path';

/** Return all files from directory recursively. Returns `[src]` if `src` is not a directory. */
export const files = async (src: string): Promise<string[]> => {
  try {
    const files = await fsp.readdir(src, { recursive: true, withFileTypes: true });

    return files.reduce<string[]>((acc, cur) => {
      if (cur.isFile()) acc.push(path.join(cur.parentPath, cur.name));

      return acc;
    }, []);
  } catch (err) {
    return [src];
  }
};
