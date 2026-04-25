import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import ThumbnailGallery from '../components/ThumbnailGallery';
import DrawingCanvas from '../components/DrawingCanvas';
import type { Thumbnail, DrawingStroke } from '../types/drawing';
import type { WorkflowOutletContext } from '../components/WorkflowLayout';

type ThumbnailPageState = 'gallery' | 'creating';
const RESET_CANVAS_PROJECT_KEY = 'kindling_canvas_should_reset';

export default function ThumbnailPage() {
  const navigate = useNavigate();
  const {
    thumbnails,
    setThumbnails,
    selectedThumbnailId,
    setSelectedThumbnailId,
  } = useOutletContext<WorkflowOutletContext>();
  const [pageState, setPageState] = useState<ThumbnailPageState>('gallery');

  const handleThumbnailSlotClick = (slotIndex: number) => {
    // If slot is already filled, select it
    if (thumbnails[slotIndex]) {
      setSelectedThumbnailId(thumbnails[slotIndex].id);
    } else {
      // If slot is empty, start creating
      setPageState('creating');
    }
  };

  const handleSaveThumbnailSketch = (strokes: DrawingStroke[]) => {
    const newThumbnail: Thumbnail = {
      id: `thumb_${Date.now()}`,
      strokes,
      createdAt: Date.now(),
    };

    const updated = [...thumbnails, newThumbnail];
    setThumbnails(updated);
    sessionStorage.setItem(
      'kindling_thumbnails_session',
      JSON.stringify(updated)
    );
    setPageState('gallery');
    // Do NOT auto-select - user must click to select
  };

  const handleSelectThumbnail = (slotIndex: number) => {
    if (thumbnails[slotIndex]) {
      const thumbnail = thumbnails[slotIndex];
      // Toggle: if already selected, deselect; otherwise select
      if (selectedThumbnailId === thumbnail.id) {
        setSelectedThumbnailId(null);
      } else {
        setSelectedThumbnailId(thumbnail.id);
      }
    }
  };

  const handleContinueToCanvas = () => {
    if (selectedThumbnailId) {
      const selected = thumbnails.find((t) => t.id === selectedThumbnailId);
      if (selected) {
        sessionStorage.setItem(
          'kindling_selected_thumbnail_strokes',
          JSON.stringify(selected.strokes)
        );
      }
    }

    sessionStorage.setItem(RESET_CANVAS_PROJECT_KEY, '1');

    navigate('/canvas');
  };

  const handleContinueWithoutThumbnails = () => {
    sessionStorage.removeItem('kindling_selected_thumbnail_strokes');
    sessionStorage.setItem(RESET_CANVAS_PROJECT_KEY, '1');
    navigate('/canvas');
  };

  if (pageState === 'creating') {
    return (
      <section className="card space-y-4">
        <p className="text-mini-header">P3</p>
        <h1 className="text-section-header">thumbnail sketch</h1>
        <div className="mt-4">
          <DrawingCanvas
            onSave={handleSaveThumbnailSketch}
            showDoneButton={true}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="card space-y-4">
      <div className="space-y-1">
        <p className="text-mini-header">P3</p>
        <h1 className="text-section-header">thumbnail</h1>
      </div>

      <div className="space-y-2">
        <h2 className="text-body font-bold text-rust">thumbnail sketches ♦</h2>
        <p className="text-body text-ink-mid">
          tap a slot to sketch · tap back when done · select your favorite to
          continue
        </p>
      </div>

      <ThumbnailGallery
        thumbnails={thumbnails}
        selectedId={selectedThumbnailId}
        onSelectEmpty={handleThumbnailSlotClick}
        onSelectFilled={handleSelectThumbnail}
      />

      <div
        className="flex items-center justify-between pt-3"
        style={{
          borderTop: '1px solid var(--ui-divider)',
          paddingTop: '0.75rem',
          backgroundColor: '#ede5d8',
          marginLeft: '-1rem',
          marginRight: '-1rem',
          marginBottom: '-1rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: '1rem',
        }}
      >
        <button
          type="button"
          className="text-body text-muted hover:text-ink-mid transition-colors"
          onClick={handleContinueWithoutThumbnails}
        >
          clear canvas and continue without thumbnail →
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleContinueToCanvas}
          style={{
            opacity: selectedThumbnailId ? 1 : 0.5,
            pointerEvents: selectedThumbnailId ? 'auto' : 'none',
            cursor: selectedThumbnailId ? 'pointer' : 'default',
          }}
        >
          continue to canvas
        </button>
      </div>
    </section>
  );
}
