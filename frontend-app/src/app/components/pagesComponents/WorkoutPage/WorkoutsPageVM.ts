"use client";

import { useState } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { useNow } from "@/hooks/helperHooks/useNow";
import { WorkoutListState } from "@/types/pages/workoutPage";
import {
  getUpcomingWorkouts,
  sortAsc,
  getWorkoutsForWeek,
} from "@/helpers/utils/selectors/workout/workoutSelector";
import { useRouter, useSearchParams } from "next/navigation";

export const useWorkoutsPageVM = () => {
  const { allWorkouts: workouts } = useWorkouts();
  const now = useNow();

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>();
  const router = useRouter();
  const params = useSearchParams();

  const seeAll = params.get("view") === "all";

  const toggleSeeAll = () => {
    const next = seeAll ? "week" : "all";
    router.replace(`?view=${next}`);
  };
  const isCreateModalOpen = params.get("modal") === "open";
  const editModalId = params.get("edit");

  const openModal = () => router.replace("?modal=open");
  const closeModal = () => router.replace("?modal=close");

  const upcoming = getUpcomingWorkouts(workouts, now);

  const upcomingSorted = sortAsc(upcoming);
  const upcomingThisWeek = getWorkoutsForWeek(upcomingSorted, now);
  const visibleWorkouts = seeAll ? upcomingSorted : upcomingThisWeek;

  const listState: WorkoutListState =
    visibleWorkouts.length === 0 ? "empty" : "hasData";

  const selected = workouts.find((w) => w.id === selectedWorkoutId);

  return {
    now,
    visibleWorkouts,
    listState,
    selected,
    seeAll,
    toggleSeeAll,
    selectWorkout: setSelectedWorkoutId,
    openModal,
    closeModal,
    isCreateModalOpen,
    editModalId,
  };
};
