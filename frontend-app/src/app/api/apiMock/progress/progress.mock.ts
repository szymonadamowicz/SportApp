import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";
import { progressMockDb } from "./progress.mockDb";

export const progressMock = {
  fetchProgress(scope: ProgressScope = "all"): Promise<ProgressDto> {
    return progressMockDb.fetch(scope);
  },
};
