export const slugify = (x: string) => x
  .trim()
  .replace(/\s+/g, '-')
  .normalize('NFD') // Compress characters
  .replace(/(\p{Diacritic})|[^A-Za-z0-9-]/gu, '') // Replace diacritics
  .replace(/-+/g, '-') // Condense dashes
  .toLocaleLowerCase();

export const count = (c: string) =>
  (x: string) => {
    let n = 0;

    for (let i = 0; i < x.length; i += 1) {
      if (x.slice(i, i + c.length) === c) n += 1;
    }

    return n;
  };
