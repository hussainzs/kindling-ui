import { useState } from 'react';
import MilestoneBoard from '../components/MilestoneBoard';
import NotebookInputSurface from '../components/NotebookInputSurface';
import SchedulerCollapse from '../components/SchedulerCollapse';

export default function NotebookPage() {
  const [draftMilestone, setDraftMilestone] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);

  const addMilestone = () => {
    const normalizedMilestone = draftMilestone.trim();
    if (!normalizedMilestone) {
      return;
    }

    setMilestones((currentMilestones) => [
      ...currentMilestones,
      normalizedMilestone,
    ]);
    setDraftMilestone('');
  };

  const ignoreDraft = () => {
    setDraftMilestone('');
  };

  const deleteMilestone = (indexToDelete: number) => {
    setMilestones((currentMilestones) =>
      currentMilestones.filter((_, index) => index !== indexToDelete),
    );
  };

  return (
    <section
      className="notebook-page-shell"
      aria-label="Notebook planning setup"
    >
      <div className="notebook-layout-split">
        <section
          className="notebook-left-column"
          aria-label="Notebook writing column"
        >
          <NotebookInputSurface />
          <SchedulerCollapse />
        </section>

        <MilestoneBoard
          milestones={milestones}
          draftMilestone={draftMilestone}
          onDraftChange={setDraftMilestone}
          onAddMilestone={addMilestone}
          onIgnoreDraft={ignoreDraft}
          onDeleteMilestone={deleteMilestone}
        />
      </div>
    </section>
  );
}
