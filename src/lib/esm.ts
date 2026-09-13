import path from 'path';
import fsp from 'fs/promises';
import os from 'os';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

/**
 * Get all static ESM imports recursively
 */
export const imports = (results: Set<string>) =>
  async (file: string): Promise<Set<string>> => {
    const raw = await fsp.readFile(file, 'utf-8');

    for (const match of raw.matchAll(/import\s+[^'"]+.([^'"]+)['"].*/g)) {
      if (!match[1].startsWith('.')) continue;

      const next = path.join(path.dirname(file), match[1]);
      if (results.has(next)) continue;

      results.add(next);
      for (const result of await imports(results)(next)) results.add(result);
    }

    return results;
  };

/**
 * Load uncached ESM file
 */
export const load = async (file: string): Promise<Record<string, unknown>> => {
  const raw = await fsp.readFile(file, 'utf-8');

  /**
   * Node caches all ESM imports, which makes cache busting
   * incredibly difficult. Even if the main file is busted using
   * query parameters, its dependencies will remained cached.
   *
   * @see https://github.com/nodejs/node/issues/49442#issuecomment-1894620232
   *
   * It is not possible to bypass this behaviour using Worker threads
   * or child processes as both of these do not allow sharing functions
   * between threads.
   *
   * @see https://nodejs.org/api/worker_threads.html#worker_threadsworkerdata
   * @see https://nodejs.org/api/child_process.html#advanced-serialization
   *
   * An alternative would be to manually resolve and cache all imports
   * using `node:vm`, but this would require reimplementing ESM module resolver,
   * which is a daunting task.
   *
   * @see https://nodejs.org/api/vm.html#new-vmsourcetextmodulecode-options
   *
   * Instead, we rewrite the imported dependencies in the source file by
   * using indirection. The source file is copied to a temporary directory,
   * rewritten and returned. This allows imports to be cache broken.
   */
  const tmp = path.join(os.tmpdir(), `${crypto.randomUUID()}${path.extname(file)}`);
  await fsp.writeFile(tmp, raw.replaceAll(
    /(import\s+[^'"]+.)([^'"]+)(['"].*)/g,
    (_, p1, p2, p3) => {
      const require = createRequire(path.resolve(file));
      const absolute = pathToFileURL(require.resolve(p2)).href;

      if (p2.startsWith('.')) return `${p1}${absolute}?${crypto.randomUUID()}${p3}`;
      return `${p1}${absolute}${p3}`; // Do not cache node_modules
    }
  ));

  const module = await import(pathToFileURL(tmp).href);
  await fsp.rm(tmp);

  return module;
};
