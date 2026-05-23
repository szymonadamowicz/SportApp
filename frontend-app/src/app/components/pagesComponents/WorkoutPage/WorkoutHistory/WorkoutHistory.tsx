import { CheckCircle2 } from "lucide-react";
import { HistorySectionProps } from "@/types/pages/workoutPage";
import { WorkoutHistorySection } from "./sections/WorkoutHistorySection";
import { useWorkoutsHistoryVM } from "./WorkoutHistoryVM";

export const WorkoutHistory = ({
  onSelect,
  selectedId,
}: HistorySectionProps) => {
  const vm = useWorkoutsHistoryVM();

  return (
    <WorkoutHistorySection
      title={vm.seeAllHistory ? "All trainings" : "Missed trainings"}
      items={vm.items}
      outerButton={{
        label: vm.seeAllHistory ? "Show missed only" : "Show all",
        onClick: vm.toggle,
      }}
      empty={{
        icon: <CheckCircle2 size={28} />,
        title: "No missed trainings",
        description: "Nice work! You did not skip anything.",
      }}
      onSelect={onSelect}
      selectedId={selectedId}
    />
  );
};
