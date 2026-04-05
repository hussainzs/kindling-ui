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
- **Phase 1 (screen structure):** Added a stable 60/40 split shell using normal document flow (`grid-template-columns: 3fr 2fr`). Left side is notebook, right side is milestone board zone.
- **Phase 2 (real notebook input):** Added [client/components/NotebookInputSurface.tsx](client/components/NotebookInputSurface.tsx) using a real `<textarea>` as the notebook surface (no overlay input). Ruled lines and margin line are drawn via textarea background layers. Initial visible prompt text is `what are you here to make today?` in handwriting style, then switches to primary ink text during real writing.
- **Phase 3 (typing performance):** Kept notebook typing state local to `NotebookInputSurface` so keystrokes do not trigger parent/sibling re-renders. Scheduler and milestone board are isolated from live typing updates.
- **Phase 4 (scheduler shell):** Added [client/components/SchedulerCollapse.tsx](client/components/SchedulerCollapse.tsx), collapsed by default and anchored at the bottom of notebook column. Expanded panel contains local-only schedule UI for `2 min`, `5 min`, and `X min` with editable numeric input.

### Design and safety notes
- Did **not** add an extra back button to the notebook screen because workflow nav already handles back/home controls.
- Avoided fixed-position notebook/scheduler shells inside the page content; layout remains stable in normal flow with a single major page scroll context.
- Reused existing semantic classes first and added only minimal notebook/scheduler class group in `index.css` for reusability.
- Added a simple stacked fallback under narrow widths (`max-width: 56rem`) so layout still loads safely outside iPad dimensions.