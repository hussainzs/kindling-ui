import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import type { WorkflowOutletContext } from '../components/WorkflowLayout';
import MilestoneBoard from '../components/MilestoneBoard';
import NotebookErrorToast from '../components/NotebookErrorToast';
import NotebookInputSurface from '../components/NotebookInputSurface';
import SchedulerCollapse from '../components/SchedulerCollapse';
import useMilestoneSuggestions from '../hooks/useMilestoneSuggestions.ts';

const DRAFT_ATTENTION_MS = 1400;
const ERROR_TOAST_MS = 3000;

export default function NotebookPage() {
  const navigate = useNavigate();
  const { notesSoFar, setNotesSoFar, milestones, setMilestones } =
    useOutletContext<WorkflowOutletContext>();
  const [draftMilestone, setDraftMilestone] = useState('');
  const [isDraftAttentionActive, setIsDraftAttentionActive] = useState(false);
  const [activeToastMessage, setActiveToastMessage] = useState<string | null>(
    null
  );

  const { suggestionError, isRateLimited } = useMilestoneSuggestions({
    notesSoFar,
    existingMilestones: milestones,
    onSuggestion: (milestone: string) => {
      setDraftMilestone(milestone);
      setIsDraftAttentionActive(true);
    },
  });

  useEffect(() => {
    if (!isDraftAttentionActive) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsDraftAttentionActive(false);
    }, DRAFT_ATTENTION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isDraftAttentionActive]);

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

  const draftStatusMessage = suggestionError
    ? suggestionError
    : isRateLimited
      ? 'milestone suggestions are pausing briefly to stay under the request limit.'
      : null;

  useEffect(() => {
    if (!draftStatusMessage) {
      return;
    }

    setActiveToastMessage(draftStatusMessage);

    const timeoutId = window.setTimeout(() => {
      setActiveToastMessage((currentMessage) =>
        currentMessage === draftStatusMessage ? null : currentMessage
      );
    }, ERROR_TOAST_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftStatusMessage]);

  const deleteMilestone = (indexToDelete: number) => {
    setMilestones((currentMilestones) =>
      currentMilestones.filter((_, index) => index !== indexToDelete)
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
          <NotebookInputSurface
            initialText={notesSoFar}
            onStableTextChange={setNotesSoFar}
          />
          <SchedulerCollapse />
        </section>

        <MilestoneBoard
          milestones={milestones}
          draftMilestone={draftMilestone}
          onDraftChange={setDraftMilestone}
          onAddMilestone={addMilestone}
          onIgnoreDraft={ignoreDraft}
          onDeleteMilestone={deleteMilestone}
          isDraftAttentionActive={isDraftAttentionActive}
          draftStatusMessage={null}
          onContinueToThumbnails={() => navigate('/thumbnail')}
          onMoveToCanvas={() => navigate('/canvas')}
        />
      </div>

      {activeToastMessage ? (
        <NotebookErrorToast message={activeToastMessage} />
      ) : null}
    </section>
  );
}
