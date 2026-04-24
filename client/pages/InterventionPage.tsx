import { useNavigate, useOutletContext } from 'react-router';
import InterventionPopup from '../components/InterventionPopup';
import type { WorkflowOutletContext } from '../components/WorkflowLayout';

export default function InterventionPage() {
  const navigate = useNavigate();
  const { thumbnails, selectedThumbnailId, canvasStrokes } =
    useOutletContext<WorkflowOutletContext>();

  const selectedThumbnail = thumbnails.find(
    (thumbnail) => thumbnail.id === selectedThumbnailId
  );

  return (
    <InterventionPopup
      open
      startedStrokes={selectedThumbnail?.strokes ?? []}
      currentStrokes={canvasStrokes}
      onKeepGoing={() => navigate('/canvas')}
      onDoneForToday={() => navigate('/')}
    />
  );
}
