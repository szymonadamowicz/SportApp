export const parseCommaSeparatedList = (
  value: string
): string[] | undefined => {
  const list = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  return list.length ? list : undefined;
};
