/** Get property value through dot notation. Will throw on invalid path */
export default (obj: Record<string, unknown>) =>
  (path: string): unknown => {
    let x = obj;
    path.split('.').forEach(y => {
      // @ts-expect-error: TS2322, JS magic
      x = x[y];
    });

    return x;
  };
