import { Outlet } from 'react-router';
import FloatingWorkflowNav from './FloatingWorkflowNav';

export default function WorkflowLayout() {
  return (
    <div className="app-shell safe-area-pad main-scroll">
      <main className="workflow-main-frame">
        <FloatingWorkflowNav />
        <Outlet />
      </main>
    </div>
  );
}
