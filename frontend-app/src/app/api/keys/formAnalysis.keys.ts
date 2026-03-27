import { ExerciseFormAnalysisListFilters } from "@/types/formAnalysis";

export const formAnalysisKeys = {
  all: ["form-analyses"] as const,
  list: (filters?: ExerciseFormAnalysisListFilters) =>
    [
      ...formAnalysisKeys.all,
      "list",
      filters?.workoutRunId ?? null,
      filters?.workoutId ?? null,
    ] as const,
};
