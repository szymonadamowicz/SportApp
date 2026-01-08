import { HistorySectionProps } from "@/types/pages/workoutPage";
import { WorkoutHistorySection } from "./sections/WorkoutHistorySection";
import { useWorkoutsHistoryVM } from "./WorkoutHistoryVM";

export const WorkoutHistory = ({ onSelect, selectedId }: HistorySectionProps) => {
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
        icon: "💯",
        title: "No missed trainings",
        description: "Nice work! You didn’t skip anything.",
      }}
      onSelect={onSelect}
      selectedId={selectedId}
    />
  );
};
