import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { WorkoutListItem } from "../../sections/WorkoutListItem";
import { WorkoutHistorySectionProps } from "@/types/pages/workoutPage";

export function WorkoutHistorySection({
  title,
  items,
  empty,
  outerButton
}: WorkoutHistorySectionProps) {
  if (items.length === 0) {
    return empty ? (
      <EmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
      />
    ) : null;
  }

  return (
    <InfoPanel title={title} outerButton={outerButton}>
      {items.map((item) => (
        <WorkoutListItem key={item.id} item={item} />
      ))}
    </InfoPanel>
  );
}
