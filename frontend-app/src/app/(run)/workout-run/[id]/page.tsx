import WorkoutRunPage from "@/components/pagesComponents/WorkoutRunPage/WorkoutRunPage";

export default async function WorkoutRunRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WorkoutRunPage workoutId={id} />;
}
