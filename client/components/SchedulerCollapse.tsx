import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type SchedulerOption = '2' | '5' | 'x';

export default function SchedulerCollapse() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SchedulerOption>('2');
  const [customMinutes, setCustomMinutes] = useState('10');

  const toggleExpanded = () => {
    setIsExpanded((currentState) => !currentState);
  };

  return (
    <section
      className="scheduler-shell surface-rust-soft"
      aria-label="Check-in scheduler"
    >
      <button
        type="button"
        className="scheduler-toggle"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="scheduler-panel"
      >
        {isExpanded ? (
          <ChevronDown className="icon" />
        ) : (
          <ChevronUp className="icon" />
        )}
      </button>

      {isExpanded ? (
        <div id="scheduler-panel" className="scheduler-panel">
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

            <button
              type="button"
              className={`scheduler-pill ${
                selectedOption === 'x'
                  ? 'scheduler-pill-selected'
                  : 'scheduler-pill-idle'
              }`}
              onClick={() => setSelectedOption('x')}
            >
              X min
            </button>

            <label
              className="scheduler-custom-input-wrap"
              htmlFor="custom-scheduler-minutes"
            >
              <input
                id="custom-scheduler-minutes"
                type="number"
                min={1}
                className="scheduler-custom-input"
                value={customMinutes}
                onFocus={() => setSelectedOption('x')}
                onChange={(event) => setCustomMinutes(event.target.value)}
                aria-label="Custom minutes"
              />
              <span className="text-label">min</span>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
