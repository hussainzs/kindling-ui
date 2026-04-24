import {
  ArrowLeft,
  Brush,
  Heart,
  Home,
  Images,
  Menu,
  Sparkle,
  X,
  NotebookPen,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import MilestoneQuickModal from './MilestoneQuickModal';

type FloatingWorkflowNavProps = {
  milestones: string[];
  setMilestones: Dispatch<SetStateAction<string[]>>;
  setMilestonesCompleted: Dispatch<SetStateAction<string[]>>;
};

export default function FloatingWorkflowNav({
  milestones,
  setMilestones,
  setMilestonesCompleted,
}: FloatingWorkflowNavProps) {
  const NAV_CLOSE_DELAY_MS = 90;
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const closeThen = (action: () => void) => {
    setIsOpen(false);

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      action();
      navigationTimeoutRef.current = null;
    }, NAV_CLOSE_DELAY_MS);
  };

  const onBack = () => {
    if (location.pathname === '/') {
      return;
    }

    closeThen(() => {
      navigate(-1);
    });
  };

  const onHome = () => {
    closeThen(() => {
      navigate('/');
    });
  };

  const onCheckIn = () => {
    closeThen(() => {
      navigate('/check-in');
    });
  };

  const onOpenNotebook = () => {
    closeThen(() => {
      navigate('/notebook');
    });
  };

  const onOpenThumbnails = () => {
    closeThen(() => {
      navigate('/thumbnail');
    });
  };

  const onOpenCanvas = () => {
    closeThen(() => {
      navigate('/canvas');
    });
  };

  const toggleNav = () => {
    setIsOpen((open) => !open);
  };

  const onOpenMilestones = () => {
    setIsMilestonesOpen(true);
    setIsOpen(false);
  };

  const onCloseMilestones = () => {
    setIsMilestonesOpen(false);
  };

  const onAddMilestone = (milestone: string) => {
    setMilestones((currentMilestones) => [...currentMilestones, milestone]);
  };

  const onCompleteMilestone = (indexToComplete: number) => {
    setMilestones((currentMilestones) => {
      const milestoneToComplete = currentMilestones[indexToComplete];
      if (!milestoneToComplete) {
        return currentMilestones;
      }

      setMilestonesCompleted((currentCompleted) => [
        ...currentCompleted,
        milestoneToComplete,
      ]);

      return currentMilestones.filter((_, index) => index !== indexToComplete);
    });
  };

  return (
    <>
      <div className="absolute left-2 top-2 z-50">
        <div className="relative">
          <div className="absolute left-0 top-0 z-20 flex h-12 items-center px-1">
            <button
              type="button"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border outline-none ring-0 transition-all duration-200 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isOpen
                  ? 'border-transparent bg-transparent shadow-none'
                  : 'surface-nav border-divider shadow-card'
              }`}
              onClick={toggleNav}
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
            >
              {isOpen ? (
                <X className="icon icon-rust" />
              ) : (
                <Menu className="icon icon-rust" />
              )}
            </button>
            {isOpen && (
              <span className="ml-2 font-bold text-ink">Kindling</span>
            )}
          </div>

          <div
            className={`surface-nav border-divider absolute left-0 top-0 z-10 flex flex-col gap-2 overflow-hidden rounded-2xl border shadow-card transition-all duration-150 ${
              isOpen
                ? 'w-[200px] px-3 pb-3 pt-[3.25rem] opacity-100'
                : 'h-12 w-12 p-0 opacity-0 pointer-events-none'
            }`}
            aria-hidden={!isOpen}
          >
            <button
              type="button"
              className="btn btn-secondary w-full justify-start"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="icon icon-sm" />
              Back
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full justify-start"
              onClick={onOpenMilestones}
              aria-label="Open milestones"
            >
              <Sparkle className="icon icon-gold" />
              Milestones
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full justify-start"
              onClick={onOpenNotebook}
              aria-label="Open notebook"
            >
              <NotebookPen className="icon icon-rust" />
              Notebook
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full justify-start"
              onClick={onOpenThumbnails}
              aria-label="Open thumbnails gallery"
            >
              <Images className="icon icon-sage" />
              Thumbnails
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full justify-start"
              onClick={onOpenCanvas}
              aria-label="Open canvas"
            >
              <Brush className="icon icon-muted" />
              Canvas
            </button>

            <div className="my-1 h-px w-full bg-divider" />

            <button
              type="button"
              className="btn btn-primary w-full justify-start"
              onClick={onHome}
              aria-label="Go home"
            >
              <Home className="icon icon-sm" />
              Home
            </button>

            <button
              type="button"
              className="btn btn-sage w-full justify-start"
              onClick={onCheckIn}
              aria-label="Go to check-in"
            >
              <Heart className="icon icon-sm" />
              Check-in
            </button>
          </div>
        </div>
      </div>

      <MilestoneQuickModal
        isOpen={isMilestonesOpen}
        milestones={milestones}
        onClose={onCloseMilestones}
        onAddMilestone={onAddMilestone}
        onCompleteMilestone={onCompleteMilestone}
      />
    </>
  );
}
