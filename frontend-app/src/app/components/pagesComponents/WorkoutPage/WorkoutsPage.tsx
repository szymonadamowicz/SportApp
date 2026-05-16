"use client";

import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { useWorkoutsPageVM } from "./WorkoutsPageVM";
import { WorkoutListSection } from "./sections/WorkoutListSection";
import WorkoutForm from "./WorkoutForm/WorkoutForm";
import { WorkoutHistory } from "./WorkoutHistory/WorkoutHistory";

import { CreateWorkout } from "./WorkoutCreate/CreateWorkout";
import { CreateWorkoutModal } from "./WorkoutCreate/sections/WorkoutCreateModal";

export default function WorkoutsPage() {
  const vm = useWorkoutsPageVM();

  if (vm.isLoading) {
    return <LoadingSpinner label="Loading workouts..." />;
  }

  return (
    <>
      <div className="space-y-6">
        {vm.selectedWorkout ? (
          <WorkoutForm
            workout={vm.selectedWorkout}
            onClose={vm.closeSelectedWorkout}
          />
        ) : (
          <CreateWorkout onCreate={vm.openModal} />
        )}

        <WorkoutListSection
          title={`Trainings Left ${vm.seeAll ? "" : "This Week"}`}
          item={vm.visibleWorkoutItems}
          listState={vm.listState}
          selectedId={vm.selectedWorkoutId}
          seeAllLabel={
            vm.seeAll ? "See trainings left for this week" : "See all trainings"
          }
          onToggleSeeAll={vm.toggleSeeAll}
          onSelect={vm.setSelectWorkout}
        />
      </div>

      <div className="space-y-6 mt-6">
        <WorkoutHistory
          onSelect={vm.setSelectWorkout}
          selectedId={vm.selectedWorkoutId}
        />
      </div>

      <CreateWorkoutModal
        open={vm.isCreateModalOpen}
        onClose={vm.closeModal}
        editModalId={vm.selectedEditWorkoutId}
      />
    </>
  );
}
