import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";
import { mockProgressService } from "@/mocks/services/mockProgress.service";

export const progressMock = {
  fetchProgress(scope: ProgressScope = "all"): Promise<ProgressDto> {
    return mockProgressService.fetchProgress(scope);
  },
};
