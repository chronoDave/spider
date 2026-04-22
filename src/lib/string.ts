export const slugify = (x: string) => x
  .trim()
  .replace(/\s+/g, '-')
  .normalize('NFD') // Compress characters
  .replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, '') // Replace diacritics
  .replace(/-+/g, '-') // Condense dashes
  .toLocaleLowerCase();

export const count = (needle: string) =>
  (haystack: string): number =>
    haystack.match(new RegExp(RegExp.escape(needle), 'g'))?.length ?? 0;
