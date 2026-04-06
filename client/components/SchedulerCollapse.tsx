import { ChevronDown, ChevronUp, Clock3 } from 'lucide-react';
import { useState } from 'react';

type SchedulerOption = '2' | '5' | 'custom';

export default function SchedulerCollapse() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SchedulerOption>('2');
  const [customMinutes, setCustomMinutes] = useState('10');

  const toggleExpanded = () => {
    setIsExpanded((currentState) => !currentState);
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
              <span className="scheduler-custom-label">custom</span>
              <input
                id="custom-scheduler-minutes"
                type="number"
                min={1}
                className="scheduler-custom-input"
                value={customMinutes}
                onFocus={() => setSelectedOption('custom')}
                onChange={(event) => setCustomMinutes(event.target.value)}
                aria-label="Custom minutes"
              />
              <span className="text-label">min</span>
            </label>

            <button type="button" className="btn btn-primary scheduler-set-btn">
              <Clock3 className="icon icon-sm" />
              start
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
