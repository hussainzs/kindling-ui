import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Outlet, useNavigate } from 'react-router';
import FloatingWorkflowNav from './FloatingWorkflowNav';
import SchedulerReminderModal from './SchedulerReminderModal';
import type { DrawingStroke, Thumbnail } from '../types/drawing';

const MINUTE_IN_MS = 60 * 1000;

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
  // canvasStrokes = the user's latest drawing, updated live as they draw
  canvasStrokes: DrawingStroke[];
  setCanvasStrokes: Dispatch<SetStateAction<DrawingStroke[]>>;
  // thumbnails = up to 3 quick sketches created in the thumbnail step.
  thumbnails: Thumbnail[];
  setThumbnails: Dispatch<SetStateAction<Thumbnail[]>>;
  // selectedThumbnailId = which thumbnail is currently chosen as starting point.
  selectedThumbnailId: string | null;
  setSelectedThumbnailId: Dispatch<SetStateAction<string | null>>;
  // check-in scheduler state/actions that should persist across page navigation.
  isCheckInTimerRunning: boolean;
  startCheckInScheduler: (minutes: number) => void;
  resetWorkflowSession: () => void;
};

export default function WorkflowLayout() {
  const navigate = useNavigate();
  const [notesSoFar, setNotesSoFar] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [milestonesCompleted, setMilestonesCompleted] = useState<string[]>([]);
  const [checkInReflection, setCheckInReflection] = useState('');
  const [canvasStrokes, setCanvasStrokes] = useState<DrawingStroke[]>([]);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumbnailId, setSelectedThumbnailId] = useState<string | null>(
    null
  );
  const [checkInReminderMinutes, setCheckInReminderMinutes] =
    useState<number>(0);
  const [checkInTimerEndsAt, setCheckInTimerEndsAt] = useState<number | null>(
    null
  );
  const [isCheckInReminderOpen, setIsCheckInReminderOpen] = useState(false);

  const isCheckInTimerRunning = checkInTimerEndsAt !== null;

  const resetWorkflowSession = () => {
    setNotesSoFar('');
    setMilestones([]);
    setMilestonesCompleted([]);
    setCheckInReflection('');
    setCanvasStrokes([]);
    setThumbnails([]);
    setSelectedThumbnailId(null);
    setCheckInReminderMinutes(0);
    setCheckInTimerEndsAt(null);
    setIsCheckInReminderOpen(false);
  };

  const startCheckInScheduler = (minutes: number) => {
    const safeMinutes = Math.max(1, Math.round(minutes));
    setCheckInReminderMinutes(safeMinutes);
    setCheckInTimerEndsAt(Date.now() + safeMinutes * MINUTE_IN_MS);
    setIsCheckInReminderOpen(false);
  };

  const closeCheckInReminder = () => {
    setIsCheckInReminderOpen(false);
  };

  const goToCheckIn = () => {
    setIsCheckInReminderOpen(false);
    navigate('/check-in');
  };

  // Monitor timer expiry: when the calculated wait time elapses, show the reminder modal
  // This effect survives page navigation because state is in parent layout
  useEffect(() => {
    if (checkInTimerEndsAt === null) {
      return;
    }

    // Calculate remaining time until expiry
    const timeoutMs = Math.max(0, checkInTimerEndsAt - Date.now());
    const timeoutId = window.setTimeout(() => {
      // Clear timer and open reminder modal when time expires
      setCheckInTimerEndsAt(null);
      setIsCheckInReminderOpen(true);
    }, timeoutMs);

    // Cleanup: cancel pending timeout if timer is reset or component unmounts
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [checkInTimerEndsAt]);

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
            canvasStrokes,
            setCanvasStrokes,
            thumbnails,
            setThumbnails,
            selectedThumbnailId,
            setSelectedThumbnailId,
            isCheckInTimerRunning,
            startCheckInScheduler,
            resetWorkflowSession,
          }}
        />
      </main>

      <SchedulerReminderModal
        isOpen={isCheckInReminderOpen}
        minutes={checkInReminderMinutes}
        onClose={closeCheckInReminder}
        onCheckIn={goToCheckIn}
      />
    </div>
  );
}
