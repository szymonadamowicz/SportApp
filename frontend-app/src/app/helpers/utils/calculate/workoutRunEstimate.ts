export const estimateSetSeconds = (
  reps: number,
  weight?: number | null,
): number => {
  const safeReps = Math.max(1, reps || 1);
  const safeWeight = Math.max(0, weight || 0);
  const secondsPerRep = safeReps <= 5 ? 5 : safeReps <= 10 ? 4 : 3;
  const loadAdjustment =
    safeWeight <= 0 ? 0 : safeWeight < 40 ? 4 : safeWeight < 80 ? 8 : 12;

  return Math.max(
    20,
    Math.min(180, 10 + safeReps * secondsPerRep + loadAdjustment),
  );
};
