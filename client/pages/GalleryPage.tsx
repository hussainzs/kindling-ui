import { useMemo, useState } from 'react';
import InterventionPopup from '../components/InterventionPopup';
import { useNavigate } from 'react-router';

type Folder = {
  id: string;
  name: string;
  count: number;
  date: string;
};

type FolderStyle = {
  color: string;
  badge: string;
  dot: string;
};

type Artwork = {
  id: string;
  title: string;
  description: string;
  folderId: string;
  tag: string;
  duration: string;
  progress: string;
  tone: 'light' | 'portrait' | 'abstract';
  date: string;
  image: string;
};

const folderStyles: Record<string, FolderStyle> = {
  all: { color: '#B24E2D', badge: 'rgba(178, 78, 45, 0.14)', dot: '#B24E2D' },
  light: { color: '#B36A1C', badge: 'rgba(179, 106, 28, 0.14)', dot: '#B36A1C' },
  portraits: { color: '#2C7A5A', badge: 'rgba(44, 122, 90, 0.14)', dot: '#2C7A5A' },
};

const initialFolders: Folder[] = [
  { id: 'all', name: 'all work', count: 0, date: 'March 2026' },
  { id: 'light', name: 'light', count: 0, date: 'February 2026' },
  { id: 'portraits', name: 'portraits', count: 0, date: 'January 2026' },
];

const initialArtworks: Artwork[] = [
  {
    id: 'art-1',
    title: 'Portrait series',
    description: 'Detailed study of faces and expressions across multiple frames.',
    folderId: 'light',
    tag: 'light',
    duration: '62 min',
    progress: '2/3 goals',
    tone: 'light',
    date: 'February 28, 2026',
    image: '/assets/Portrait%20series.JPG',
  },
  {
    id: 'art-2',
    title: 'Woman portrait',
    description: 'Experimental portrait with bold color treatment and atmosphere.',
    folderId: 'portraits',
    tag: 'portrait',
    duration: '45 min',
    progress: '1/2 goals',
    tone: 'portrait',
    date: 'March 5, 2026',
    image: '/assets/Woman%20portrait.JPG',
  },
  {
    id: 'art-3',
    title: 'Greyscale landscape',
    description: 'Monochromatic study of natural forms and spatial depth.',
    folderId: 'light',
    tag: 'light',
    duration: '38 min',
    progress: '1/2 goals',
    tone: 'abstract',
    date: 'March 10, 2026',
    image: '/assets/Greyscale%20landscape.JPG',
  },
  {
    id: 'art-4',
    title: 'Cliffs landscape',
    description: 'Painted landscape with vibrant atmosphere and geological forms.',
    folderId: 'light',
    tag: 'light',
    duration: '55 min',
    progress: '2/2 goals',
    tone: 'abstract',
    date: 'March 20, 2026',
    image: '/assets/Cliffs%20landscape.JPG',
  },
];

export default function GalleryPage() {
  const [showIntervention, setShowIntervention] = useState(false);
  const navigate = useNavigate();
  const [folders, setFolders] = useState(initialFolders);
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [draftNames, setDraftNames] = useState(
    Object.fromEntries(initialFolders.map((folder) => [folder.id, folder.name]))
  );

  // Load saved artworks from localStorage (written by CanvasPage on save)
  const [savedArtworks] = useState<Artwork[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('kindling_saved_artworks') ?? '[]');
    } catch {
      return [];
    }
  });

  // Saved artworks appear first so the most recent work is at the top
  const allArtworks = [...savedArtworks, ...initialArtworks];

  const filteredArtworks = useMemo(
    () =>
      selectedFolderId === 'all'
        ? allArtworks
        : allArtworks.filter((artwork) => artwork.folderId === selectedFolderId),
    [selectedFolderId, allArtworks]
  );

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allArtworks.length };
    folders.forEach((folder) => {
      if (folder.id !== 'all') {
        counts[folder.id] = allArtworks.filter((art) => art.folderId === folder.id).length;
      }
    });
    return counts;
  }, [folders, allArtworks]);

  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? folders[0];

  function handleDeleteFolder(folderId: string) {
    if (folderId === 'all') return;
    setFolders((current) => current.filter((folder) => folder.id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId('all');
    }
  }

  function handleNewKindling() {
    navigate('/notebook');
  }

  function toggleEditing() {
    if (isEditing) {
      setFolders((currentFolders) =>
        currentFolders.map((folder) => ({
          ...folder,
          name: draftNames[folder.id] ?? folder.name,
        }))
      );
    }
    setIsEditing((current) => !current);
  }

  function updateFolderName(folderId: string, name: string) {
    setDraftNames((current) => ({
      ...current,
      [folderId]: name,
    }));
  }

  function handleAddFolder() {
    const newFolderId = `folder-${Date.now()}`;
    setFolders((current) => [
      ...current,
      { id: newFolderId, name: 'new folder', count: 0, date: 'April 2026' },
    ]);
    setDraftNames((current) => ({
      ...current,
      [newFolderId]: 'new folder',
    }));
    setSelectedFolderId(newFolderId);
    setIsEditing(true);
  }

  return (
    <>
      <InterventionPopup open={showIntervention} onClose={() => setShowIntervention(false)} />
      <section className="gallery-page-shell">
        <div className="gallery-top-bar">
          <button style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }} onClick={() => setShowIntervention(true)}>
            Show Intervention Popup
          </button>
          <div className="gallery-logo-shell">
            <p className="gallery-logo">kindling ✦</p>
            <div className="gallery-sparkles-shell">
              <div className="gallery-sparkles">
                <span className="sparkle">✦</span>
                <span className="sparkle">✦</span>
                <span className="sparkle">✦</span>
                <span className="sparkle">✦</span>
                <span className="sparkle">✦</span>
                <span className="sparkle">✦</span>
                <span className="sparkle">✦</span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary gallery-new-kindling-button" type="button" onClick={handleNewKindling}>
            <span className="gallery-new-kindling-icon">
              <span className="gallery-new-kindling-star">★</span>
            </span>
            new kindling
          </button>
        </div>

        <div style={{ display: 'flex', width: '100%', marginTop: '32px', height: 'calc(100vh - 180px)', minHeight: 0 }}>
          <aside className="gallery-sidebar" style={{ marginTop: '-2px', width: '18rem', minWidth: 220, height: '100%', maxHeight: '100%', overflowY: 'auto' }}>
            <div className="gallery-sidebar-header">
              <p className="gallery-sidebar-title">folders</p>
            </div>

            <ul className="gallery-folder-list">
              {folders.map((folder) => {
                const isSelected = folder.id === selectedFolderId;
                const itemCount = folderCounts[folder.id] ?? 0;
                return (
                  <li
                    key={folder.id}
                    className={`gallery-folder-item${isSelected ? ' gallery-folder-item-selected' : ''}`}
                  >
                    {isEditing ? (
                      <div className="gallery-folder-edit-container">
                        <button
                          type="button"
                          className="gallery-folder-edit-button"
                          style={{ borderColor: folderStyles[folder.id]?.color ?? '#ccc' }}
                        >
                          <input
                            className="gallery-folder-edit-input"
                            value={draftNames[folder.id] ?? folder.name}
                            onChange={(event) => updateFolderName(folder.id, event.target.value)}
                            style={{ color: folderStyles[folder.id]?.color ?? 'inherit' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {folder.id !== 'all' && (
                            <button
                              type="button"
                              className="gallery-folder-delete-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }}
                              title="Delete folder"
                            >
                              ×
                            </button>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="gallery-folder-button"
                        onClick={() => setSelectedFolderId(folder.id)}
                      >
                        <div className="gallery-folder-content">
                          <div className="gallery-folder-header">
                            <span
                              className="gallery-folder-dot"
                              style={{ backgroundColor: folderStyles[folder.id]?.dot ?? '#ccc' }}
                            />
                            <span
                              className="gallery-folder-name"
                              style={{ color: folderStyles[folder.id]?.color ?? 'inherit' }}
                            >
                              {folder.name}
                            </span>
                          </div>
                          <span className="gallery-folder-date">{folder.date}</span>
                        </div>
                        <span
                          className="gallery-folder-count"
                          style={{
                            color: folderStyles[folder.id]?.color,
                            background: folderStyles[folder.id]?.badge,
                            borderColor: folderStyles[folder.id]?.color,
                          }}
                        >
                          {itemCount}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="gallery-folder-actions">
              <button className="btn btn-ghost" type="button" onClick={handleAddFolder}>
                + new folder
              </button>
              <button className="btn btn-ghost" type="button" onClick={toggleEditing}>
                {isEditing ? 'save folders' : 'edit folders'}
              </button>
            </div>
          </aside>

          <div style={{ width: '25px' }} />

          <div className="gallery-main" style={{ flex: 1, overflowY: 'auto', marginTop: '-150px' }}>
            <div className="gallery-main-heading">
              <div>
                <h1 className="text-section-header gallery-title">gallery</h1>
                <p className="gallery-title-meta">
                  {selectedFolder.date} · {filteredArtworks.length} {filteredArtworks.length === 1 ? 'piece' : 'pieces'}
                </p>
                <p className="text-body gallery-heading-copy">
                  A view of your previous work, organized into folders for easy browsing.
                </p>
              </div>
            </div>

            <div className="gallery-artwork-grid">
              {filteredArtworks.map((artwork) => (
                <article key={artwork.id} className="gallery-artwork-card gallery-artwork-small" tabIndex={0}>
                  {/* Image on top */}
                  <div
                    className={`gallery-artwork-cover gallery-artwork-cover-${artwork.tone}`}
                    style={{
                      backgroundImage: artwork.image ? `url('${artwork.image}')` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '1.25rem',
                      minHeight: 180,
                      width: '100%',
                    }}
                  />
                  {/* Title and tag row */}
                  <div className="gallery-artwork-header-row">
                    <h3 className="gallery-artwork-title" style={{ margin: 0 }}>{artwork.title}</h3>
                    <span
                      className="gallery-artwork-tag"
                      style={{
                        color: folderStyles[artwork.folderId]?.color,
                        borderColor: folderStyles[artwork.folderId]?.color,
                        background: folderStyles[artwork.folderId]?.badge,
                        fontSize: '0.95rem',
                        padding: '0 0.7rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        borderWidth: 1.5,
                        borderStyle: 'solid',
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: 28,
                        minWidth: 28,
                        justifyContent: 'center',
                      }}
                    >
                      {artwork.tag}
                    </span>
                  </div>
                  {/* Date, duration, progress row */}
                  <div className="gallery-artwork-details">
                    <span>{artwork.date}</span>
                    <span>{artwork.duration}</span>
                    <span>{artwork.progress}</span>
                  </div>
                  {/* Description at the bottom */}
                  <div className="gallery-artwork-description">
                    {artwork.description}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="gallery-layout">
          <aside className="gallery-sidebar">
            <div className="gallery-sidebar-header">
              <p className="gallery-sidebar-title">folders</p>
            </div>

            <ul className="gallery-folder-list">
              {folders.map((folder) => {
                const isSelected = folder.id === selectedFolderId;
                const itemCount = folderCounts[folder.id] ?? 0;
                return (
                  <li
                    key={folder.id}
                    className={`gallery-folder-item${isSelected ? ' gallery-folder-item-selected' : ''}`}
                  >
                    {isEditing ? (
                      <div className="gallery-folder-edit-container">
                        <button
                          type="button"
                          className="gallery-folder-edit-button"
                          style={{ borderColor: folderStyles[folder.id]?.color ?? '#ccc' }}
                        >
                          <input
                            className="gallery-folder-edit-input"
                            value={draftNames[folder.id] ?? folder.name}
                            onChange={(event) => updateFolderName(folder.id, event.target.value)}
                            style={{ color: folderStyles[folder.id]?.color ?? 'inherit' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {folder.id !== 'all' && (
                            <button
                              type="button"
                              className="gallery-folder-delete-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }}
                              title="Delete folder"
                            >
                              ×
                            </button>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="gallery-folder-button"
                        onClick={() => setSelectedFolderId(folder.id)}
                      >
                        <div className="gallery-folder-content">
                          <div className="gallery-folder-header">
                            <span
                              className="gallery-folder-dot"
                              style={{ backgroundColor: folderStyles[folder.id]?.dot ?? '#ccc' }}
                            />
                            <span
                              className="gallery-folder-name"
                              style={{ color: folderStyles[folder.id]?.color ?? 'inherit' }}
                            >
                              {folder.name}
                            </span>
                          </div>
                          <span className="gallery-folder-date">{folder.date}</span>
                        </div>
                        <span
                          className="gallery-folder-count"
                          style={{
                            color: folderStyles[folder.id]?.color,
                            background: folderStyles[folder.id]?.badge,
                            borderColor: folderStyles[folder.id]?.color,
                          }}
                        >
                          {itemCount}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="gallery-folder-actions">
              <button className="btn btn-ghost" type="button" onClick={handleAddFolder}>
                + new folder
              </button>
              <button className="btn btn-ghost" type="button" onClick={toggleEditing}>
                {isEditing ? 'save folders' : 'edit folders'}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
