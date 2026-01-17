"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { WorkoutListState } from "@/types/pages/workoutPage";
import {
  getUpcomingWorkouts,
  sortAsc,
  getWorkoutsForWeek,
} from "@/helpers/utils/selectors/workout/workoutSelector";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useNow } from "@/hooks/helperHooks/useNow";

export const useWorkoutsPageVM = () => {
  const { allWorkouts: workouts } = useWorkouts();
  const now = useNow();

  const [selectedEditWorkoutId, setSelectedEditWorkoutId] = useState<
    string | undefined
  >(undefined);

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<
    string | undefined
  >(undefined);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedWorkout = useMemo(
    () => workouts.find((w) => w.id === selectedWorkoutId),
    [workouts, selectedWorkoutId],
  );

  const [seeAll, setSeeAll] = useLocalStorageState<boolean>(
    "workouts.seeAll",
    false,
  );

  const toggleSeeAll = () => {
    setSeeAll((v) => !v);
  };

  const openModal = () => setIsCreateModalOpen(true);
  const closeModal = () => {
    setSelectedEditWorkoutId(undefined);
    setIsCreateModalOpen(false);
  };

  const upcoming = getUpcomingWorkouts(workouts, now);
  const upcomingSorted = sortAsc(upcoming);
  const upcomingThisWeek = getWorkoutsForWeek(upcomingSorted, now);
  const visibleWorkouts = seeAll ? upcomingSorted : upcomingThisWeek;

  const listState: WorkoutListState =
    visibleWorkouts.length === 0 ? "empty" : "hasData";

  useEffect(() => {
    if (!selectedEditWorkoutId) return;
    setIsCreateModalOpen(true);
  }, [selectedEditWorkoutId]);

  return {
    now,

    visibleWorkouts,
    listState,

    selectedWorkout,
    selectedWorkoutId,

    seeAll,
    toggleSeeAll,

    setSelectWorkout: (id: string) => setSelectedWorkoutId(id),

    openModal,
    closeModal,
    isCreateModalOpen,

    selectedEditWorkoutId,
    setEditWorkoutId: (id: string) => setSelectedEditWorkoutId(id),
  };
};
