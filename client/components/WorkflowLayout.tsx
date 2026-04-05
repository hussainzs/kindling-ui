import { Outlet } from 'react-router';
import FloatingWorkflowNav from './FloatingWorkflowNav';

export default function WorkflowLayout() {
  return (
    <div className="app-shell safe-area-pad main-scroll">
      <FloatingWorkflowNav />
      <main className="mx-auto mt-20 w-full max-w-3xl px-1">
        <Outlet />
      </main>
    </div>
  );
}
