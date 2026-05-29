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
      <div className="space-y-5 md:space-y-6">
        {vm.errorMessage && (
          <div className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
            {vm.errorMessage}
          </div>
        )}

        <div>
          {vm.selectedWorkout ? (
            <WorkoutForm
              workout={vm.selectedWorkout}
              onClose={vm.closeSelectedWorkout}
            />
          ) : (
            <CreateWorkout onCreate={vm.openModal} />
          )}
        </div>

        <div>
          <WorkoutListSection
            title={`Trainings Left ${vm.seeAll ? "" : "This Week"}`}
            item={vm.visibleWorkoutItems}
            listState={vm.listState}
            selectedId={vm.selectedWorkoutId}
            seeAllLabel={
              vm.seeAll
                ? "See trainings left for this week"
                : "See all trainings left"
            }
            onToggleSeeAll={vm.toggleSeeAll}
            onSelect={vm.setSelectWorkout}
          />
        </div>
      </div>

      <div className="mt-5 space-y-5 md:mt-6 md:space-y-6">
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
