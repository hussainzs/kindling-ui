# Kindling UI Implementation Progress

## Routing and Navigation Setup

### Workflow Pages (Placeholders)
The following 6 placeholder routes and pages have been implemented to allow parallel UI development:
- `P1`: Gallery (Home) - [client/pages/GalleryPage.tsx](client/pages/GalleryPage.tsx) at `/`
- `P2`: Notebook - [client/pages/NotebookPage.tsx](client/pages/NotebookPage.tsx) at `/notebook`
- `P3`: Thumbnail - [client/pages/ThumbnailPage.tsx](client/pages/ThumbnailPage.tsx) at `/thumbnail`
- `P4`: Canvas - [client/pages/CanvasPage.tsx](client/pages/CanvasPage.tsx) at `/canvas`
- `P5`: Check-in - [client/pages/CheckInPage.tsx](client/pages/CheckInPage.tsx) at `/check-in`
- `P6`: Intervention - [client/pages/InterventionPage.tsx](client/pages/InterventionPage.tsx) at `/intervention`

All routes are managed in [client/routes/appRouter.tsx](client/routes/appRouter.tsx) using the React Router v7 Data Router.

### Floating Workflow Navigation
The navigation system is implemented in [client/components/FloatingWorkflowNav.tsx](client/components/FloatingWorkflowNav.tsx).

**Specifications:**
- **Location:** Fixed at the top left (`left-4 top-4`), inside a flex container.
- **Trigger Size:** A circular button of `h-10 w-10` (40px x 40px) with a `Menu` icon.
- **Expansion Behavior:** Absolute positioning is used for the expanding oval (`absolute left-0`), which allows it to slide **over** the neighboring content without shifting it. The window uses `pl-12` to clear the trigger button and `z-10` relative to the trigger's `z-20`.
- **Z-Index:** The entire nav group is `z-50`. Neighboring buttons (like those at the same level) should use a lower z-index (e.g., `z-0` or `z-40`) to ensure the navigation window expands over them.
- **Touch Safety:** Consistent with iPad/WebKit rules, no `transform` is used on ancestors. Expansion relies on `max-width` and `opacity` for smooth, layout-stable transitions.
- **Pill Buttons:**
  - **Back:** Uses `navigate(-1)`. Disabled when on the Gallery (Home) page. Uses `h-9`, `px-3`, and `text-sm`.
  - **Home:** Navigates directly to `/`. Uses `h-9`, `px-3`, and `text-sm`.
- **Styling:** Uses semantic classes from `index.css` (`surface-nav`, `btn-primary`, `btn-secondary`). Includes vertical padding (`py-2`) and standard `gap-2` for a spacious, touch-friendly iPad feel.

### Layout
The [client/components/WorkflowLayout.tsx](client/components/WorkflowLayout.tsx) provides a shared shell for all workflow pages, ensuring the floating nav is persistent and content is centered with appropriate safe-area padding.

## Notebook Page: Phase 1 to Phase 4

Implemented initial notebook experience in [client/pages/NotebookPage.tsx](client/pages/NotebookPage.tsx) with modular components and semantic CSS in [client/src/index.css](client/src/index.css).

### What was built
- **screen structure:** Added a stable 60/40 split shell using normal document flow (`grid-template-columns: 3fr 2fr`). Left side is notebook, right side is milestone board zone.
- **real notebook input:** Added [client/components/NotebookInputSurface.tsx](client/components/NotebookInputSurface.tsx) using a real `<textarea>` as the notebook surface (no overlay input). Ruled lines and margin line are drawn via textarea background layers. Initial visible prompt text is `what are you here to make today?` in handwriting style, then switches to primary ink text during real writing.
- **typing performance:** Kept notebook typing state local to `NotebookInputSurface` so keystrokes do not trigger parent/sibling re-renders. Scheduler and milestone board are isolated from live typing updates.
- **scheduler shell:** Added [client/components/SchedulerCollapse.tsx](client/components/SchedulerCollapse.tsx), collapsed by default and anchored at the bottom of notebook column. Expanded panel contains local-only schedule UI for `2 min`, `5 min`, and `X min` with editable numeric input.

### Design notes
- Added a simple stacked fallback under narrow widths (`max-width: 56rem`) so layout still loads safely outside iPad dimensions.

## Notebook Page: Phase 5 to Phase 6

Implemented modular milestone board and editable milestone draft flow.

### What was built
- Added [client/components/MilestoneCard.tsx](client/components/MilestoneCard.tsx) as a dedicated sticky-note card component with small tilt, centered pin, handwriting text, and palette-based tone variants. Top-left delete button for iPad touch interaction.
- Added [client/components/MilestoneDraftInput.tsx](client/components/MilestoneDraftInput.tsx) as the editable draft milestone input area. Supports `Enter` key submission with automatic focus return for continuous milestone entry. Includes `add milestone` and `ignore` button actions.
- Added [client/components/MilestoneBoard.tsx](client/components/MilestoneBoard.tsx) as the right-side presentational board zone. It renders committed milestones as pinned cards and hosts the draft input module.
- Updated [client/pages/NotebookPage.tsx](client/pages/NotebookPage.tsx) to own state:
  - `draftMilestone: string`
  - `milestones: string[]` (committed milestones only)
  - `addMilestone()` commits only trimmed non-empty draft text
  - `ignoreDraft()` clears current draft

### Phase boundary notes
- Only committed `milestones: string[]` are shown as pinned notes; draft remains editable and separate until user confirms.

### WebKit follow-up refinements
- Replaced `min-height: 100%` on `html`, `body`, and `#root` with `100dvh` for proper rendering with dynamic iOS viewport. Removed custom overflow constraints from `.main-scroll` to restore native body scrolling and Safari momentum behavior.
- Removed `overflow: hidden` from the notebook shell to avoid high-level clipping behavior that can cause Safari interaction issues.
- Changed milestone draft textarea to `resize: none` for more stable iPad touch/input behavior.
- Removed complex pointer-event long-press tracking from `MilestoneCard` in favor of straightforward top-left delete button.

### Visual polish pass (milestone board)
- Tuned sticky-note composition to better match the reference board: cards now use a repeating staggered pattern (`left`, `right`, `left`) with subtle width variation and preserved small tilt.
- Updated draft placeholder copy to `+ add milestone` while keeping the editable phase-6 draft behavior intact.