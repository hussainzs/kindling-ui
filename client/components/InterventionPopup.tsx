import React, { useState } from 'react';

const TIPS = [
  'Take a deliberate 5-minute breather, step away from your work, and return with a fresh set of eyes that might notice things you couldn’t see before.',
  'Gently remind yourself that this piece does not need to be perfect or even “good”—it just needs to exist for now.',
  'Instead of overthinking the whole composition, begin with a single small mark and allow the rest to grow naturally from that starting point.',
  'Consider switching to a completely different tool, brush style, or color palette to introduce an element of novelty and break your current pattern.',
  'Try to focus on the idea of progress rather than perfection, recognizing that every line, shape, or stroke contributes to your growth as an artist.',
  'Step back from your canvas, physically or digitally, and view it from a distance—or even flip it—to gain a new perspective on what’s working.',
  'Give yourself permission to intentionally create something messy, understanding that experimentation often leads to unexpected breakthroughs.',
  'Revisit a subject, theme, or style that you previously enjoyed, and use it as a comfortable entry point to get your creativity flowing again.',
  'Introduce a simple constraint—such as limiting yourself to one color, one brush, or a short time frame—and observe how it shapes your decisions.',
  'Take a moment to reconnect with why you started drawing in the first place, and create something that feels enjoyable and personally meaningful rather than impressive.',
];

export default function InterventionPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  if (!open) return null;
  return (
    <div className="intervention-modal-overlay">
      <div className="intervention-modal-card">
        <div className="intervention-modal-content">
          {/* Left column */}
          <div className="intervention-modal-left">
            <span className="intervention-label">✦ INTERVENTION</span>
            <h1 className="intervention-title intervention-title-gradient">
              this is the ugly middle...
            </h1>
            <p className="intervention-desc">
              but everyone goes through it.
              <br />
              <span className="intervention-desc-bold">
                that’s the{' '}
                <span className="intervention-desc-highlight">
                  process, not failure.
                </span>
              </span>
              <br />
              the struggle means you’re in something real. look how far you’ve
              already come.
            </p>
            <div className="intervention-progress-row">
              <div className="intervention-progress-group">
                <div className="intervention-progress-img intervention-progress-img-start" />
                <span className="intervention-progress-label">&nbsp;</span>
                <span className="intervention-progress-label">
                  where you started · 0/3 milestones
                </span>
              </div>
              <div className="intervention-progress-group">
                <div className="intervention-progress-img intervention-progress-img-current" />
                <span className="intervention-progress-label">&nbsp;</span>
                <span className="intervention-progress-label intervention-progress-label-current">
                  where you are right now · 0/3 milestones
                </span>
              </div>
            </div>
          </div>
          {/* Right column */}
          <div className="intervention-modal-right">
            <div className="intervention-tip-box">
              <span className="intervention-tip-title">now try this ✦</span>
              <span className="intervention-tip-text">{tip}</span>
            </div>
            <div className="intervention-modal-actions">
              <button
                className="intervention-modal-btn intervention-modal-btn-secondary"
                onClick={onClose}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5em',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.8335 15.8333V14.1667H11.7502C12.6252 14.1667 13.3856 13.8889 14.0314 13.3333C14.6772 12.7778 15.0002 12.0833 15.0002 11.25C15.0002 10.4167 14.6772 9.72223 14.0314 9.16668C13.3856 8.61112 12.6252 8.33334 11.7502 8.33334H6.50016L8.66683 10.5L7.50016 11.6667L3.3335 7.50001L7.50016 3.33334L8.66683 4.50001L6.50016 6.66668H11.7502C13.0974 6.66668 14.2536 7.10418 15.2189 7.97918C16.1842 8.85418 16.6668 9.94445 16.6668 11.25C16.6668 12.5556 16.1842 13.6458 15.2189 14.5208C14.2536 15.3958 13.0974 15.8333 11.7502 15.8333H5.8335Z"
                      fill="#6B5D52"
                    />
                  </svg>
                  keep going
                </span>
              </button>
              <button
                className="intervention-modal-btn intervention-modal-btn-primary"
                onClick={onClose}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5em',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.83317 10.8333H14.1665V9.16666H5.83317V10.8333ZM9.99984 18.3333C8.84706 18.3333 7.76373 18.1146 6.74984 17.6771C5.73595 17.2396 4.854 16.6458 4.104 15.8958C3.354 15.1458 2.76025 14.2639 2.32275 13.25C1.88525 12.2361 1.6665 11.1528 1.6665 9.99999C1.6665 8.84721 1.88525 7.76388 2.32275 6.74999C2.76025 5.7361 3.354 4.85416 4.104 4.10416C4.854 3.35416 5.73595 2.76041 6.74984 2.32291C7.76373 1.88541 8.84706 1.66666 9.99984 1.66666C11.1526 1.66666 12.2359 1.88541 13.2498 2.32291C14.2637 2.76041 15.1457 3.35416 15.8957 4.10416C16.6457 4.85416 17.2394 5.7361 17.6769 6.74999C18.1144 7.76388 18.3332 8.84721 18.3332 9.99999C18.3332 11.1528 18.1144 12.2361 17.6769 13.25C17.2394 14.2639 16.6457 15.1458 15.8957 15.8958C15.1457 16.6458 14.2637 17.2396 13.2498 17.6771C12.2359 18.1146 11.1526 18.3333 9.99984 18.3333ZM9.99984 16.6667C11.8609 16.6667 13.4373 16.0208 14.729 14.7292C16.0207 13.4375 16.6665 11.8611 16.6665 9.99999C16.6665 8.13888 16.0207 6.56249 14.729 5.27082C13.4373 3.97916 11.8609 3.33332 9.99984 3.33332C8.13873 3.33332 6.56234 3.97916 5.27067 5.27082C3.979 6.56249 3.33317 8.13888 3.33317 9.99999C3.33317 11.8611 3.979 13.4375 5.27067 14.7292C6.56234 16.0208 8.13873 16.6667 9.99984 16.6667Z"
                      fill="white"
                    />
                  </svg>
                  done for today
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="intervention-modal-backdrop" onClick={onClose} />
    </div>
  );
}
