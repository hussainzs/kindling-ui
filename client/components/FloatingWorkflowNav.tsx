import { ArrowLeft, Heart, Home, Menu, Sparkle, X, NotebookPen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);

  const onBack = () => {
    if (location.pathname === '/') {
      return;
    }

    navigate(-1);
  };

  const onHome = () => {
    navigate('/');
    setIsOpen(false);
  };

  const onCheckIn = () => {
    navigate('/check-in');
    setIsOpen(false);
  };

    const onOpenNotebook = () => {
    navigate('/notebook');
    setIsOpen(false);
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
        <div className="relative flex items-center">
          <button
            type="button"
            className={`relative z-20 flex h-10 w-10 items-center justify-center rounded-full border outline-none ring-0 transition-all duration-200 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
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

          <div
            className={`surface-nav border-divider absolute left-0 z-10 flex items-center gap-2 overflow-hidden rounded-full border py-2 shadow-card transition-all duration-300 ${
              isOpen
                ? 'max-w-[44rem] pl-12 pr-6 opacity-100'
                : 'max-w-0 px-0 opacity-0'
            }`}
            aria-hidden={!isOpen}
          >
            <button
              type="button"
              className="btn btn-secondary btn-compact shrink-0 rounded-full"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="icon icon-sm" />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-compact shrink-0 rounded-full !p-0 w-8"
              onClick={onOpenMilestones}
              aria-label="Open quick milestones"
            >
              <Sparkle className="icon icon-gold" />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-compact shrink-0 rounded-full"
              onClick={onOpenNotebook}
              aria-label="Open notebook"
            >
              <NotebookPen className="icon icon-rust" />
            </button>

            <button
              type="button"
              className="btn btn-primary btn-compact shrink-0 rounded-full"
              onClick={onHome}
              aria-label="Go home"
            >
              <Home className="icon icon-sm" />
              Home
            </button>

            <button
              type="button"
              className="btn btn-sage btn-compact shrink-0 rounded-full"
              onClick={onCheckIn}
              aria-label="Go to check-in"
            >
              <Heart className="icon icon-sm" />
              Check in
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
