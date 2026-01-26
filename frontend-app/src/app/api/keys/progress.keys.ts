import { ProgressScope } from "@/types/progress/progressDTO";

export const progressKeys = {
  all: (scope: ProgressScope) => ["progress", scope] as const,
};
