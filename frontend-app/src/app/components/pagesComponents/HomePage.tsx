import InfoPanel from "../InfoPanel";

export default function HomePage() {
  const trainingsLeft = [
    { title: "Session 1" },
    { title: "Session 2" },
    { title: "Session 3" },
    { title: "Session 4" },
  ];

  return (
    <InfoPanel
      title="Trainings left this week"
      desc="View plan"
      items={[
        { title: "Session 1", subtitle: "Upper • 60–75 min" },
        { title: "Session 2", subtitle: "Lower • 70–85 min" },
        { title: "Session 3", subtitle: "Push • 50–65 min" },
        { title: "Session 4", subtitle: "Pull • 55–70 min" },
      ]}
    />
  );
}
