const err = (label: string) =>
  (expected: string) =>
    (actual: string) => new Error(`Failed to parse "${label}"`, {
      cause: new Error(`Expected "${expected}", got "${actual}"`)
    });

export const string = (label: string) => (x: unknown): string => {
  if (typeof x !== 'string') throw err(label)('string')(typeof x);
  return x;
};

export const fn = <T extends (x: unknown) => unknown>(label: string) => (x: unknown): T => {
  if (typeof x !== 'function') throw err(label)('function')(typeof x);
  return x as T;
};

export const object = (label: string) => (x: unknown): Record<string, unknown> => {
  const errObj = err(label)('object');

  if (typeof x !== 'object') throw errObj(typeof x);
  if (x === null) throw errObj('null');
  if (Array.isArray(x)) throw errObj('array');

  return x as Record<string, unknown>;
};
