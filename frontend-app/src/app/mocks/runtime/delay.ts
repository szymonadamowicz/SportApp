export const mockDelay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
