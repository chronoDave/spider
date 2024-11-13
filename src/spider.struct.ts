import fsp from 'fs/promises';
import path from 'path';

export type StructResult = {
  file: string;
  cleanup: () => Promise<void>;
};

export default async (x: string): Promise<StructResult> => {
  const file = path.resolve(process.cwd(), 'tmp/index.js');

  await fsp.mkdir(path.parse(file).dir, { recursive: true });
  await fsp.writeFile(file, x);

  return {
    file,
    cleanup: async () => fsp.rm(path.parse(file).dir, { recursive: true, force: true })
  };
};
