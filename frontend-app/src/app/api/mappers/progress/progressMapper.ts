import { ProgressDto } from "@/types/progress/progressDTO";
import { Progress } from "@/types/progress/progress";

export const mapProgressDTO = (dto: ProgressDto): Progress => ({
  streak: dto.streak,
  stats: dto.stats,
  prs: dto.prs,
});
