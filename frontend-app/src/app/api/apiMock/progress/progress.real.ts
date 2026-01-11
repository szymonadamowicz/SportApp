import { httpClient } from "@/api/httpClient";
import { ProgressDTO } from "@/types/progress/progressDTO";

export const progressReal = {
  fetchProgress(): Promise<ProgressDTO> {
    return httpClient<ProgressDTO>("/progress");
  },
};
