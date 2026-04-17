export const slugify = (x: string) => x.toLocaleLowerCase()
  .trim()
  .replaceAll(/\s+/g, '-')
  .replaceAll(/[^a-z0-9-]/g, '')
  .replaceAll(/-+/g, '-');
