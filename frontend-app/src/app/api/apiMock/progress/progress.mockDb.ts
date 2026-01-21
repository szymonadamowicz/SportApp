import { ProgressDTO } from "@/types/progress/progressDTO";
import { progressMock } from "./progress.seed";

const db: ProgressDTO = {
  achievements: [...progressMock.achievements],
  streak: { ...progressMock.streak },
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const progressMockDb = {
  async fetchAll(): Promise<ProgressDTO> {
    await delay(150);
    return {
      achievements: [...db.achievements],
      streak: { ...db.streak },
    };
  },
};
