import path from 'path';

export const absolute = (x: string) => path.resolve(x) === path.normalize(x) ?
  x :
  path.join(process.cwd(), x);