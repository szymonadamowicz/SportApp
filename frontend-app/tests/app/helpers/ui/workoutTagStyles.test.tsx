import { getWorkoutTags } from "@/helpers/ui/workoutTagStyles";
import { WorkoutListItemVM } from "@/types/pages/workoutPage";

describe("getWorkoutTags", () => {
  it("returns one missed badge and does not duplicate missed state on time tag", () => {
    const vm: WorkoutListItemVM = {
      id: "w1",
      title: "Test",
      status: "missed",
      timeLabel: "09:14",
      dayLabel: "03 Apr 2026",
    };

    const tags = getWorkoutTags(vm);
    const missedTags = tags.filter((t) => t.id === "missed");
    const timeTag = tags.find((t) => t.id === "time");

    expect(missedTags).toHaveLength(1);
    expect(timeTag?.state).toBeUndefined();
  });
});
