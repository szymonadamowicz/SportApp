"use client";

import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { useWorkoutsPageVM } from "./WorkoutsPageVM";
import { WorkoutListSection } from "./sections/WorkoutListSection";
import WorkoutForm from "./WorkoutForm/WorkoutForm";
import { WorkoutHistory } from "./WorkoutHistory/WorkoutHistory";

import { CreateWorkout } from "./WorkoutCreate/CreateWorkout";
import { CreateWorkoutModal } from "./WorkoutCreate/sections/WorkoutCreateModal";
import { useEffect, useState } from "react";

export default function WorkoutsPage() {
  const vm = useWorkoutsPageVM();
  const [lastSelectedWorkout, setLastSelectedWorkout] = useState<
    NonNullable<typeof vm.selectedWorkout> | null
  >(null);

  useEffect(() => {
    if (vm.selectedWorkout) {
      setLastSelectedWorkout(vm.selectedWorkout);
    }
  }, [vm.selectedWorkout]);

  if (vm.isLoading) {
    return <LoadingSpinner label="Loading workouts..." />;
  }

  return (
    <>
      <div className="rf-workouts-stable">
        <div className="space-y-5 md:space-y-6">
          {vm.errorMessage && (
            <div className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
              {vm.errorMessage}
            </div>
          )}

          <div className="grid min-h-[13.5rem] sm:min-h-[13.75rem] lg:min-h-[13.25rem]">
            <div
              className={`rf-workout-panel-slot col-start-1 row-start-1 flex min-h-full transition-opacity duration-150 ${
                vm.selectedWorkout
                  ? "pointer-events-none invisible opacity-0"
                  : "opacity-100"
              }`}
              aria-hidden={Boolean(vm.selectedWorkout)}
            >
              <CreateWorkout onCreate={vm.openModal} />
            </div>

            {lastSelectedWorkout && (
              <div
                className={`rf-workout-panel-slot col-start-1 row-start-1 min-h-full transition-opacity duration-150 ${
                  vm.selectedWorkout
                    ? "opacity-100"
                    : "pointer-events-none invisible opacity-0"
                }`}
                aria-hidden={!vm.selectedWorkout}
              >
                <WorkoutForm
                  workout={vm.selectedWorkout ?? lastSelectedWorkout}
                  onClose={vm.closeSelectedWorkout}
                />
              </div>
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
      </div>

      <CreateWorkoutModal
        open={vm.isCreateModalOpen}
        onClose={vm.closeModal}
        editModalId={vm.selectedEditWorkoutId}
      />
    </>
  );
}
