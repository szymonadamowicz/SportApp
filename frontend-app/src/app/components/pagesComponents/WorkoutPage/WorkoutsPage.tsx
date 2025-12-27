"use client";


import InfoPanel from "@/components/InfoPanelComponents/InfoPanel";
import WorkoutForm from "./WorkoutComponents/WorkoutForm";
import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";

const WorkoutsPage = () => {  
  const { upcoming } =
    useWorkouts();
    
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | undefined>(undefined);
  return (
    <div className="space-y-6">
      <InfoPanel 
        title="Trainings Left This Week" 
        items={upcoming}
        dimOthers={selectedWorkoutId}
        showButton={{onClick: (workoutId)=> setSelectedWorkoutId(workoutId), label:"View details"}}
      />
      {selectedWorkoutId && (
        <div className="mt-8">
          <WorkoutForm workout={upcoming.find(w => w.id === selectedWorkoutId)!}/>
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;
