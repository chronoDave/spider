import fs from 'fs';

/**
 * Read JSON file
 * @param url - Absolute file path
 */
export const read = (url: string): Promise<Record<string, unknown> | unknown[]> =>
  new Promise((resolve, reject) => {
    try {
      const raw = fs.readFileSync(url, 'utf-8');
      const json = JSON.parse(raw);

      if (typeof json !== 'object' || json === null) throw new Error('Invalid JSON');

      return resolve(json);
    } catch (err) {
      return reject(err);
    }
  });
