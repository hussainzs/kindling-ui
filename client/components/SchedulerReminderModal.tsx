import { HeartHandshake } from 'lucide-react';

type SchedulerReminderModalProps = {
  isOpen: boolean;
  minutes: number;
  onClose: () => void;
  onCheckIn: () => void;
};

export default function SchedulerReminderModal({
  isOpen,
  minutes,
  onClose,
  onCheckIn,
}: SchedulerReminderModalProps) {
  if (!isOpen) {
    return null;
  }

  const minuteLabel = minutes === 1 ? 'minute' : 'minutes';

  return (
    <div
      className="scheduler-reminder-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheduler-reminder-title"
    >
      <button
        type="button"
        className="scheduler-reminder-backdrop"
        onClick={onClose}
        aria-label="Close reminder"
      />
      <section className="scheduler-reminder-card surface-sheet">
        <span className="scheduler-reminder-chip text-mini-header">
          gentle reminder
        </span>
        <div className="scheduler-reminder-icon-wrap" aria-hidden="true">
          <HeartHandshake className="icon scheduler-reminder-icon" />
        </div>
        <h2 id="scheduler-reminder-title" className="scheduler-reminder-title">
          hey, it has been {minutes} {minuteLabel}. how are you doing?
        </h2>
        <p className="scheduler-reminder-copy text-caption">
          you can pause for a quick reflection now or close this and keep
          creating.
        </p>

        <div className="scheduler-reminder-actions">
          <button
            type="button"
            className="btn btn-primary scheduler-reminder-action"
            onClick={onCheckIn}
          >
            i want to check-in
          </button>
          <button
            type="button"
            className="btn btn-secondary scheduler-reminder-action"
            onClick={onClose}
          >
            close
          </button>
        </div>
      </section>
    </div>
  );
}
