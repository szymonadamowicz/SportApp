import { ProgressDTO } from "@/types/progress/progressDTO";
import { Progress } from "@/types/progress/progress";

export const mapProgressDTO = (dto: ProgressDTO): Progress => ({
  streak: dto.streak,
  achievements: dto.achievements
});
