import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { WorkoutListSectionProps } from "@/types/workoutPage";
import { WorkoutListItem } from "./WorkoutListItem";

export function WorkoutListSection({
  item,
  selectedId,
  title,
  seeAllLabel,
  onToggleSeeAll,
  onSelect,
}: WorkoutListSectionProps) {
  return (
    <InfoPanel
      title={title}
      outerButton={{
        label: seeAllLabel,
        onClick: onToggleSeeAll,
      }}
    >
      {item.map((vm) => (
        <WorkoutListItem
          key={vm.id}
          item={vm}
          selected={vm.id === selectedId}
          onClick={() => onSelect(vm.id)}
        />
      ))}
    </InfoPanel>
  );
}
