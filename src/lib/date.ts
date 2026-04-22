export const truncateDay = (x: Date): Date => {
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

export const fromString = (x: string) => {
  const date = new Date(x);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  return date;
};
