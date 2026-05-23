"use client";

import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { useWorkoutsPageVM } from "./WorkoutsPageVM";
import { WorkoutListSection } from "./sections/WorkoutListSection";
import WorkoutForm from "./WorkoutForm/WorkoutForm";
import { WorkoutHistory } from "./WorkoutHistory/WorkoutHistory";

import { CreateWorkout } from "./WorkoutCreate/CreateWorkout";
import { CreateWorkoutModal } from "./WorkoutCreate/sections/WorkoutCreateModal";
import { AnimatePresence, motion } from "framer-motion";

const sectionTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;

export default function WorkoutsPage() {
  const vm = useWorkoutsPageVM();

  if (vm.isLoading) {
    return <LoadingSpinner label="Loading workouts..." />;
  }

  return (
    <>
      <div className="space-y-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {vm.selectedWorkout ? (
            <motion.div
              key={`workout-${vm.selectedWorkout.id}`}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={sectionTransition}
            >
              <WorkoutForm
                workout={vm.selectedWorkout}
                onClose={vm.closeSelectedWorkout}
              />
            </motion.div>
          ) : (
            <motion.div
              key="create-workout"
              layout
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={sectionTransition}
            >
              <CreateWorkout onCreate={vm.openModal} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout transition={sectionTransition}>
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
        </motion.div>
      </div>

      <motion.div
        className="space-y-6 mt-6"
        layout
        transition={sectionTransition}
      >
        <WorkoutHistory
          onSelect={vm.setSelectWorkout}
          selectedId={vm.selectedWorkoutId}
        />
      </motion.div>

      <CreateWorkoutModal
        open={vm.isCreateModalOpen}
        onClose={vm.closeModal}
        editModalId={vm.selectedEditWorkoutId}
      />
    </>
  );
}
