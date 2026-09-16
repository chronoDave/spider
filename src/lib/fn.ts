export const maybe = <T, K>(fn: (x: T) => K) =>
  (x?: T | null): K | null => {
    if (x === null || x === undefined) return null;
    return fn(x);
  };

export const debounce = (n: number) =>
  <T, K>(fn: (x: T) => Promise<K>) => {
    let id: NodeJS.Timeout;

    return async (x: T) => new Promise<K>(resolve => {
      clearTimeout(id);
      id = setTimeout(() => {
        fn(x).then(resolve);
      }, n);
    });
  };
