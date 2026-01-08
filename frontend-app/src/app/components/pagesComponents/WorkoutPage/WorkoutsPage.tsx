"use client";

import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import { WorkoutListSection } from "./sections/WorkoutListSection";
import WorkoutForm from "./WokorutForm/WorkoutForm";
import { WorkoutHistory } from "./WokoutHistory/WorkoutHistory";
import { useWorkoutsPageVM } from "./WorkoutsPageVM";

import { CreateWorkout } from "./WorkoutCreate/CreateWorkout";
import { useCreateWorkoutModalVM } from "@/helpers/viewModels/CreateWorkoutModalVM";
import { CreateWorkoutModal } from "./WorkoutCreate/sections/WorkoutCreateModal";

export default function WorkoutsPage() {
  const vm = useWorkoutsPageVM();
  const createModal = useCreateWorkoutModalVM();

  return (
    <>
      <div className="space-y-6">
        <CreateWorkout onCreate={createModal.openModal} />

        <WorkoutListSection
          title={`Trainings Left ${vm.seeAll ? "" : "This Week"}`}
          item={vm.visibleWorkouts.map((w) =>
            mapWorkoutToListItemVM(w, vm.now)
          )}
          listState={vm.listState}
          selectedId={vm.selected?.id}
          seeAllLabel={
            vm.seeAll ? "See trainings left for this week" : "See all trainings"
          }
          onToggleSeeAll={vm.toggleSeeAll}
          onSelect={vm.selectWorkout}
        />

        {vm.selected && <WorkoutForm workout={vm.selected} />}
      </div>

      <div className="space-y-6 mt-6">
        <WorkoutHistory onSelect={vm.selectWorkout} selectedId={vm.selected?.id}/>
      </div>

      <CreateWorkoutModal
        open={createModal.open}
        onClose={createModal.closeModal}
      />
    </>
  );
}
