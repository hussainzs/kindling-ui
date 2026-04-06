import { useState, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router';
import FloatingWorkflowNav from './FloatingWorkflowNav';

export type WorkflowOutletContext = {
  notesSoFar: string;
  setNotesSoFar: Dispatch<SetStateAction<string>>;
  milestones: string[];
  setMilestones: Dispatch<SetStateAction<string[]>>;
};

export default function WorkflowLayout() {
  const [notesSoFar, setNotesSoFar] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);

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
          }}
        />
      </main>
    </div>
  );
}
