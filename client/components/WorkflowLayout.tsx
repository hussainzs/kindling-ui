import { useState, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router';
import FloatingWorkflowNav from './FloatingWorkflowNav';

export type WorkflowOutletContext = {
  // notesSoFar = most recent notes written in Notebook. Updated only by notebook. 
  notesSoFar: string;
  setNotesSoFar: Dispatch<SetStateAction<string>>;
  //  milestones = list of all milestones added so far that haven't been marked completed.
  milestones: string[];
  setMilestones: Dispatch<SetStateAction<string[]>>;
  // milestonesCompleted = list of milestones that have been marked completed.
  milestonesCompleted: string[];
  setMilestonesCompleted: Dispatch<SetStateAction<string[]>>;
  //  checkInReflection = most recent reflection written in Check-in. Updated only by check-in.
  checkInReflection: string;
  setCheckInReflection: Dispatch<SetStateAction<string>>;
};

export default function WorkflowLayout() {
  const [notesSoFar, setNotesSoFar] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [milestonesCompleted, setMilestonesCompleted] = useState<string[]>([]);
  const [checkInReflection, setCheckInReflection] = useState('');

  return (
    <div className="app-shell safe-area-pad main-scroll">
      <main className="workflow-main-frame">
        <FloatingWorkflowNav
          milestones={milestones}
          setMilestones={setMilestones}
          setMilestonesCompleted={setMilestonesCompleted}
        />
        <Outlet
          context={{
            notesSoFar,
            setNotesSoFar,
            milestones,
            setMilestones,
            milestonesCompleted,
            setMilestonesCompleted,
            checkInReflection,
            setCheckInReflection,
          }}
        />
      </main>
    </div>
  );
}
