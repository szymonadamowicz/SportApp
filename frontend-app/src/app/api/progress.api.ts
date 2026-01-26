import { progressReal } from "./apiReal/progress.real";
import { progressMock } from "./apiMock/progress/progress.mock";
import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";

const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? progressMock : progressReal;

export const fetchProgressApi = (
  scope: ProgressScope = "all",
): Promise<ProgressDto> => impl.fetchProgress(scope);
