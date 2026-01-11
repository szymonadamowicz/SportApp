import { ProgressDTO } from "@/types/progress/progressDTO";
import { progressMockDb } from "./progress.mockDb";

export const progressMock = {
  fetchProgress(): Promise<ProgressDTO> {
    return progressMockDb.fetchAll();
  },
};
