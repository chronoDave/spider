export const truncateDay = (x: Date): Date => {
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

export const fromString = (x: string) => new Date(x);
