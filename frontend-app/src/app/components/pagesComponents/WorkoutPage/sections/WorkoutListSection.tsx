import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { WorkoutListSectionProps } from "@/types/pages/workoutPage";
import { WorkoutListItem } from "./WorkoutListItem";
import EmptyState from "@/components/EmptyState/EmptyState";

export function WorkoutListSection({
  item,
  listState,
  selectedId,
  title,
  seeAllLabel,
  onToggleSeeAll,
  onSelect,
}: WorkoutListSectionProps) {
  return (
    <>
      {listState === "hasData" ? (
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
      ) : (
        <EmptyState
          icon="📆"
          title="No trainings this week"
          description="You're all caught up. Enjoy your free time!"
          actionLabel="See all trainings"
          onAction={onToggleSeeAll}
        />
      )}
    </>
  );
}
