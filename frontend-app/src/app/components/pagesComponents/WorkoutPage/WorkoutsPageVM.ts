"use client";

import { useMemo, useState } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { WorkoutListState } from "@/types/pages/workoutPage";
import {
  getUpcomingWorkouts,
  sortAsc,
  getWorkoutsForWeek,
} from "@/helpers/utils/selectors/workout/workoutSelector";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useNow } from "@/hooks/helperHooks/useNow";
import { useRouter, useSearchParams } from "next/navigation";

export const useWorkoutsPageVM = () => {
  const { allWorkouts: workouts } = useWorkouts();
  const now = useNow();

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<
    string | undefined
  >(undefined);

  const searchParams = useSearchParams();
  const router = useRouter();

  const isCreateModalOpen = searchParams.get("modal") === "open";
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

  const openModal = () => {
    router.push("/workouts?modal=open", { scroll: false });
  };

  const closeModal = () => {
    router.push("/workouts", { scroll: false });
  };

  const upcoming = getUpcomingWorkouts(workouts, now);
  const upcomingSorted = sortAsc(upcoming);
  const upcomingThisWeek = getWorkoutsForWeek(upcomingSorted, now);
  const visibleWorkouts = seeAll ? upcomingSorted : upcomingThisWeek;

  const listState: WorkoutListState =
    visibleWorkouts.length === 0 ? "empty" : "hasData";

  const editWorkoutId = searchParams.get("edit");

  const selectedEditWorkoutId = editWorkoutId ?? undefined;

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
  };
};
