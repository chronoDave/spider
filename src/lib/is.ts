export const record = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' &&
  !Array.isArray(x) &&
  x !== null;

export const string = (x: unknown): x is string => typeof x === 'string';

export const url = (x: string) => /^(\/$|(\/\S+)+\w$)/u.test(x);
