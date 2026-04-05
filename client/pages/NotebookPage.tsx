import NotebookInputSurface from '../components/NotebookInputSurface';
import SchedulerCollapse from '../components/SchedulerCollapse';

export default function NotebookPage() {
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

        <aside className="notebook-right-column" aria-label="Milestone board">
          <h2 className="text-caption notebook-milestone-title">
            your milestones
          </h2>

          <div className="notebook-milestone-actions">
            <button
              type="button"
              className="notebook-milestone-draft-btn"
              aria-label="Add milestone"
            >
              + add milestone
            </button>

            <button
              type="button"
              className="btn btn-primary notebook-continue-btn"
              aria-label="Continue to thumbnails"
            >
              continue to thumbnails
            </button>

            <button
              type="button"
              className="btn btn-ghost notebook-skip-btn"
              aria-label="Skip to canvas"
            >
              skip straight to canvas
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
