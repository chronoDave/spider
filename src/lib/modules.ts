import path from 'path';
import fsp from 'fs/promises';

/** Find all static ESM imports */
export const imports = (root: string) =>
  (raw: string): string[] => Array.from(raw.matchAll(/import\s+[^'"]+.(.+)['"]/g))
    .filter(match => match[1].startsWith('.'))
    .map(match => path.join(path.dirname(root), match[1]));

export default (root: string) =>
  async (raw: string) => {
    const stack = imports(root)(raw);
    const cache = new Set<string>(stack);

    while (stack.length > 0) {
      const file = stack.pop();
      if (typeof file !== 'string') throw new Error('Empty stack');

      const raw = await fsp.readFile(file, 'utf-8');
      for (const result of imports(file)(raw)) {
        cache.add(result);
        if (!cache.has(result)) stack.push(result);
      }
    }

    return cache;
  };
