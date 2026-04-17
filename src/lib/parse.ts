const string = (label: string) => (x: unknown): string => {
  if (typeof x !== 'string') throw new Error(`"${label}" is not string`);
  if (x === '') throw new Error(`"${label}" cannot be empty`);
  return x;
};

export const title = string('title');

const stringOrNull = (label: string) => (x: unknown): string | null => {
  if (
    typeof x !== 'string' &&
    x !== undefined &&
    x !== null
  ) throw new Error(`"${label}" is not string, null or undefined`);

  if (x === '') return null;
  return x ?? null;
};

export const description = stringOrNull('description');
export const url = stringOrNull('url');

const dateOrNull = (label: string) => (x: unknown): Date | null => {
  if (
    typeof x !== 'string' &&
    typeof x !== 'number' &&
    x !== undefined &&
    x !== null
  ) throw new Error(`"${label}" is not string, number, undefined or null`);

  if (x === '') return null;
  if (typeof x === 'number' || typeof x === 'string') return new Date(x);
  return null;
};

export const created = dateOrNull('created');
export const updated = dateOrNull('updated');
