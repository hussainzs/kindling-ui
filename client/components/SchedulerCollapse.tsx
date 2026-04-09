import { CheckCheck, ChevronDown, ChevronUp, Clock3 } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useOutletContext } from 'react-router';
import type { WorkflowOutletContext } from './WorkflowLayout';

type SchedulerOption = '2' | '5' | 'custom';
// Duration in ms for the hint popup to display when user enters invalid input
const CUSTOM_HINT_MS = 5000;

export default function SchedulerCollapse() {
  const { isCheckInTimerRunning, startCheckInScheduler } =
    useOutletContext<WorkflowOutletContext>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SchedulerOption>('2');
  const [customMinutes, setCustomMinutes] = useState('10');
  // Controls visibility of the hint popup above custom input
  const [isCustomHintVisible, setIsCustomHintVisible] = useState(false);
  // Tracks re-renders to trigger fade animation on each invalid attempt
  const [customHintCycle, setCustomHintCycle] = useState(0);

  const toggleExpanded = () => {
    setIsExpanded((currentState) => !currentState);
  };

  // Shows the hint popup and increments cycle to restart fade animation
  const showInvalidCustomHint = () => {
    setIsCustomHintVisible(true);
    setCustomHintCycle((currentCycle) => currentCycle + 1);
  };

  // Auto-hide hint after 5 seconds; cycle dependency ensures new attempts restart timer
  useEffect(() => {
    if (!isCustomHintVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCustomHintVisible(false);
    }, CUSTOM_HINT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isCustomHintVisible, customHintCycle]);

  // Validate custom minutes input: only whole positive integers 1-99 are accepted
  // Invalid attempts do not render on screen and trigger the hint popup
  const onCustomMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.trim();

    // Allow empty string to clear field
    if (!nextValue) {
      setCustomMinutes('');
      return;
    }

    // Reject any non-digit characters (no decimals, negative signs, etc.)
    if (!/^\d+$/.test(nextValue)) {
      showInvalidCustomHint();
      return;
    }

    // Reject out-of-range values (must be 1-99)
    const parsedCustomMinutes = Number.parseInt(nextValue, 10);
    if (parsedCustomMinutes < 1 || parsedCustomMinutes > 99) {
      showInvalidCustomHint();
      return;
    }

    // Only update state with valid values
    setCustomMinutes(String(parsedCustomMinutes));
  };

  // Extract the minute value from current selection (2, 5, or custom input)
  // Includes failsafe clamping to ensure value is always valid
  const parseMinutes = () => {
    if (selectedOption === 'custom') {
      const parsedCustomMinutes = Number.parseInt(customMinutes, 10);
      if (!Number.isFinite(parsedCustomMinutes)) {
        return 10; // Fallback if parsing fails
      }

      // Clamp to 1-99 as final safety check
      return Math.max(1, Math.min(99, parsedCustomMinutes));
    }

    // Return preset value (2 or 5)
    return Number.parseInt(selectedOption, 10);
  };

  const onStartScheduler = () => {
    startCheckInScheduler(parseMinutes());
  };

  return (
    <section className="scheduler-shell" aria-label="Check-in scheduler">
      <button
        type="button"
        className="scheduler-toggle"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="scheduler-panel"
      >
        {isExpanded ? (
          <ChevronDown className="icon scheduler-chevron" />
        ) : (
          <ChevronUp className="icon scheduler-chevron" />
        )}
      </button>

      <div
        id="scheduler-panel"
        className={`scheduler-panel-wrap ${
          isExpanded
            ? 'scheduler-panel-wrap-expanded'
            : 'scheduler-panel-wrap-collapsed'
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="scheduler-panel">
          <h2 className="scheduler-title">check-in schedule (optional)</h2>
          <p className="scheduler-description">
            choose a gentle check-in rhythm while you work.
          </p>

          <div
            className="scheduler-pills"
            role="group"
            aria-label="Schedule options"
          >
            <button
              type="button"
              className={`scheduler-pill ${
                selectedOption === '2'
                  ? 'scheduler-pill-selected'
                  : 'scheduler-pill-idle'
              }`}
              onClick={() => setSelectedOption('2')}
            >
              2 min
            </button>

            <button
              type="button"
              className={`scheduler-pill ${
                selectedOption === '5'
                  ? 'scheduler-pill-selected'
                  : 'scheduler-pill-idle'
              }`}
              onClick={() => setSelectedOption('5')}
            >
              5 min
            </button>

            <label
              className={`scheduler-pill scheduler-custom-pill ${
                selectedOption === 'custom'
                  ? 'scheduler-pill-selected'
                  : 'scheduler-pill-idle'
              }`}
              htmlFor="custom-scheduler-minutes"
              onClick={() => setSelectedOption('custom')}
            >
              {isCustomHintVisible ? (
                <span
                  key={customHintCycle}
                  className="scheduler-custom-hint"
                  role="status"
                  aria-live="polite"
                >
                  enter whole number between 1-99
                </span>
              ) : null}
              <span className="scheduler-custom-label">custom</span>
              <input
                id="custom-scheduler-minutes"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                className="scheduler-custom-input"
                value={customMinutes}
                onFocus={() => setSelectedOption('custom')}
                onChange={onCustomMinutesChange}
                aria-label="Custom minutes"
              />
              <span className="text-label">min</span>
            </label>

            <button
              type="button"
              className={`btn scheduler-set-btn ${
                isCheckInTimerRunning ? 'btn-sage' : 'btn-primary'
              }`}
              onClick={onStartScheduler}
            >
              {isCheckInTimerRunning ? (
                <CheckCheck className="icon icon-sm" />
              ) : (
                <Clock3 className="icon icon-sm" />
              )}
              {isCheckInTimerRunning ? 'running' : 'start'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
