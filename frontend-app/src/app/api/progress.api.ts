import { progressReal } from "./apiReal/progress.real";
import { progressMock } from "./apiMock/progress/progress.mock";
import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";
import { API_MODE } from "./env";

const impl = API_MODE === "mock" ? progressMock : progressReal;

export const fetchProgressApi = (
  scope: ProgressScope = "all",
): Promise<ProgressDto> => impl.fetchProgress(scope);
