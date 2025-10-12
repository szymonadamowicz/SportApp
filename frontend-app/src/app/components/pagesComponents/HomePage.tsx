import {
  recentHighlights,
  tipForTheDay,
  trainings,
  weeklyProgress,
} from "@/mocks/HomePageMocks";
import InfoPanel from "../InfoPanel";

export default function HomePage() {
  return (
    <>
      <InfoPanel
        title="Trainings left this week"
        anchorDesc={{
          label: "View Plan",
          href: "/workouts",
        }}
        items={trainings}
        dimOthers={true}
      />
      <InfoPanel title="Tip for the day" items={tipForTheDay.tip} />
      <InfoPanel
        title="Week progress"
        desc={`sessions ${
          trainings.filter((i) => i.workout?.completed).length
        }/${trainings.length}`}
        progress={
          trainings.filter((i) => i.workout?.completed).length /
          Math.max(1, trainings.length)
        }
        items={weeklyProgress}
        layout="row"
        maxPerRow={3}
      />
      <InfoPanel
        title="Recent highlights"
        anchorDesc={{ label: "See all", href:"/profile" }}
        items={recentHighlights}
        layout="row"
        maxPerRow={3}
      />
    </>
  );
}
