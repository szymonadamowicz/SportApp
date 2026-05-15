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
              selected={selectedId === vm.id}
              onClick={() => onSelect(vm.id)}
            />
          ))}
        </InfoPanel>
      ) : (
        <EmptyState
          icon="📆"
          title="No trainings left"
          description="You're all caught up. Enjoy your free time!"
          actionLabel={seeAllLabel}
          onAction={onToggleSeeAll}
        />
      )}
    </>
  );
}
