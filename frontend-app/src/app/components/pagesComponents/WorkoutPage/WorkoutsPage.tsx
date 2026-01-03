"use client";

import EmptyState from "@/components/EmptyState/EmptyState";
import WorkoutForm from "./WokorutForm/WorkoutForm";
import { useWorkoutsPageVM } from "./WorkoutsPageVM";
import { WorkoutListSection } from "./sections/WorkoutListSection";

export default function WorkoutsPage() {
  const vm = useWorkoutsPageVM();
  return (
    <div className="space-y-6">
      {vm.listState === "hasData" ? (
        <WorkoutListSection
          title={`Trainings Left ${vm.seeAll ? "" : "This Week"}`}
          item={vm.list}
          selectedId={vm.selected?.id}
          seeAllLabel={
            vm.seeAll ? "See trainings left for this week" : "See all trainings"
          }
          onToggleSeeAll={vm.toggleSeeAll}
          onSelect={vm.selectWorkout}
        />
      ) : (
        <EmptyState
          icon="📆"
          title="No trainings this week"
          description="You're all caught up. Enjoy your free time!"
          actionLabel="See all trainings"
          onAction={vm.toggleSeeAll}
        />
      )}

      {vm.selected && <WorkoutForm workout={vm.selected} />}
    </div>
  );
}
