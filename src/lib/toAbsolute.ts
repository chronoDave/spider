import path from 'path';

export default (file: string, root?: string) => path.isAbsolute(file) ?
  file :
  path.join(root ?? process.cwd(), file);
