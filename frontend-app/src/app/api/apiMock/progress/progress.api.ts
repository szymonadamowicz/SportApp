import { ProgressDTO } from "@/types/progress/progressDTO";
import { progressMock } from "./progress.mock";
import { progressReal } from "./progress.real";

const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? progressMock : progressReal;

export const fetchProgressApi = (): Promise<ProgressDTO> =>
  impl.fetchProgress();
