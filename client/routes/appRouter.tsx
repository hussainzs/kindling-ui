import { createBrowserRouter } from 'react-router';
import WorkflowLayout from '../components/WorkflowLayout';
import GalleryPage from '../pages/GalleryPage';
import NotebookPage from '../pages/NotebookPage';
import ThumbnailPage from '../pages/ThumbnailPage';
import CanvasPage from '../pages/CanvasPage';
import CheckInPage from '../pages/CheckInPage';
import InterventionPage from '../pages/InterventionPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <WorkflowLayout />,
    children: [
      { index: true, element: <GalleryPage /> },
      { path: 'notebook', element: <NotebookPage /> },
      { path: 'thumbnail', element: <ThumbnailPage /> },
      { path: 'canvas', element: <CanvasPage /> },
      { path: 'check-in', element: <CheckInPage /> },
      { path: 'intervention', element: <InterventionPage /> },
      { path: "style", element: <StylePage /> },
      { path: "hello-world", element: <HelloAppPage /> },
    ],
  },

]);
