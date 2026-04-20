import fsp from 'fs/promises';
import path from 'path';

/** Return all files from directory recursively. */
export const files = async (src: string): Promise<string[]> => {
  const files = await fsp.readdir(src, { recursive: true, withFileTypes: true });

  return files.reduce<string[]>((acc, cur) => {
    if (cur.isFile()) acc.push(path.join(cur.parentPath, cur.name));

    return acc;
  }, []);
};
