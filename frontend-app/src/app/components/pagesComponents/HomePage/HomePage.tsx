"use client";

import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import InfoPanel from "../../InfoPanel/InfoPanel";
import { WorkoutListItem } from "../WorkoutPage/sections/WorkoutListItem";
import { useHomePageVM } from "./HomePageVM";
import Hero from "./sections/HeroSection";
import HighlightItem from "./sections/HighlightItem";
import TipItem from "./sections/TipItem";
import WeeklyProgressItem from "./sections/WeeklyProgressItem";
import EmptyState from "@/components/EmptyState/EmptyState";

export default function HomePage() {
  const vm = useHomePageVM();

  return (
    <>
      <Hero
        hero={vm.hero}
        completedCount={vm.statsWeekly.completedCount}
        upcomingCount={vm.statsWeekly.PlannedCount}
        onPrimaryAction={() => vm.goTo("/workouts?modal=open")}
      />

      <div className="mt-6 flex flex-col md:flex-row md:items-start md:gap-6">
        <div className="flex-1 flex flex-col gap-6">
          {vm.today.hasItems ? (
            <InfoPanel
              title="Trainings Today"
              outerButton={{
                label: "See All",
                onClick: () => vm.goTo("/workouts"),
              }}
            >
              {vm.today.items.map((item) => (
                <WorkoutListItem
                  key={item.id}
                  item={mapWorkoutToListItemVM(item, vm.now)}
                  onClick={() => vm.goTo(`/workouts/${item.id}`)}
                />
              ))}
            </InfoPanel>
          ) : (
            <EmptyState
              icon="🎉"
              title="No upcoming workouts"
              description="Nothing scheduled for now."
              missed={vm.today.missedItems.length > 0}
              missedItems={vm.today.missedItems}
            />
          )}

          <InfoPanel title="Tips for the day">
            {vm.info.tips.map((tip, idx) => (
              <TipItem key={idx} title={tip.title} />
            ))}
          </InfoPanel>
        </div>

        <div className="flex-1 flex flex-col gap-6 mt-6 md:mt-0">
          <InfoPanel
            title="Week progress"
            desc={`sessions ${vm.statsWeekly.completedCount}/${vm.statsWeekly.PlannedCount}`}
            progress={
              vm.statsWeekly.completedCount / vm.statsWeekly.PlannedCount
            }
            layout="row"
            maxPerRow={3}
          >
            {vm.info.progress.map((item, idx) => (
              <WeeklyProgressItem
                key={idx}
                id={item.id}
                title={item.title}
                value={item.value}
                context={item.context}
                subLabel={item.subLabel}
              />
            ))}
          </InfoPanel>

          <InfoPanel
            title="Recent highlights"
            outerButton={{
              label: "See All",
              onClick: () => vm.goTo("/highlights"),
            }}
          >
            {vm.info.highlights.map((h, idx) => (
              <HighlightItem key={idx} highlight={h} />
            ))}
          </InfoPanel>
        </div>
      </div>
    </>
  );
}
