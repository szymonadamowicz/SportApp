import { ProgressDTO } from "@/types/progress/progressDTO";
import { progressReal } from "./apiReal/progress.real";
import { progressMock } from "./apiMock/progress/progress.mock";

const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? progressMock : progressReal;

export const fetchProgressApi = (): Promise<ProgressDTO> =>
  impl.fetchProgress();
