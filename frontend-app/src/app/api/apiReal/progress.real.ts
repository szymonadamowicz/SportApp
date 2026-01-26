import { httpClient } from "@/api/httpClient";
import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";

export const progressReal = {
  fetchProgress(scope: ProgressScope = "all"): Promise<ProgressDto> {
    const qs = scope === "week" ? "?prScope=week" : "";
    return httpClient<ProgressDto>(`/progress${qs}`);
  },
};
