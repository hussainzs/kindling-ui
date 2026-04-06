import { useState, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router';
import FloatingWorkflowNav from './FloatingWorkflowNav';

export type WorkflowOutletContext = {
  notesSoFar: string;
  setNotesSoFar: Dispatch<SetStateAction<string>>;
  milestones: string[];
  setMilestones: Dispatch<SetStateAction<string[]>>;
  milestonesCompleted: string[];
  setMilestonesCompleted: Dispatch<SetStateAction<string[]>>;
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
        <FloatingWorkflowNav />
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
