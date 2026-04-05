We will be building the notebook page in a series of phases. I will provide the figma screenshot as well where needed.

## Phase 1 — Lock the screen structure

Build the page as a **stable iPad-first 60/40 split layout**.

* The **left 60%** is the notebook area.
* The **right 40%** is the milestone board.
* Keep the layout in **normal document flow**, not with complex fixed-position shells.
* Use the project’s existing semantic classes from `index.css` first, and only add minimal new reusable classes if needed. Follow the iPad/WebKit-safe layout rules from the style guide.

* scheduler is always anchored at the bottom of the notebook section, but **collapsed by default** so the writing surface stays large. 

---

## Phase 2 — Build the notebook surface as the actual input

the editable input itself should visually be the notebook.

* Do **not** create a fake paper background with a separate overlaid input.
* Use a real editable text control so tapping it on iPad opens the keyboard naturally.
* All notebook text will be in --font-hand: "Shadows Into Light", "Comic Sans MS", cursive; defined in index.css: Default text as shown in the image says: **“what are you here to make today?”**
* When the user focuses the notebook, they should type in **black / primary ink text**.
* The notebook surface should visually include:

  * ruled paper lines
  * proper top and left padding
  * spacing such that typed text sits naturally above the horizontal lines with a small visual breathing gap
  * a clean paper-like surface with warm tones matching the design system

Important implementation rule:

* The prompt is just the initial/default visible text treatment.
* Once focused and typed into, the real note content should render in the normal readable writing color and stable text sizing.

---

## Phase 3 — Make the notebook input performant for typing

Optimize the text area so writing does **not** feel clunky.

* The notebook input must not cause heavy re-renders on every keystroke across the whole page.
* Keep the **input state local and lightweight** inside the notebook/input layer.
* Avoid pushing every character change through parent-level UI trees that would cause milestone board and scheduler to constantly re-render.
* Memoize surrounding presentational components where appropriate, but do not overcomplicate with premature micro-optimizations.
* Separate:

  * **live notebook typing state**
  * **API trigger logic**
  * **milestone board display state**
* The text input path should feel immediate even while milestone suggestion logic exists in the background.

The key rule for the agent:

* optimize for **fast text entry first**
* do not make the notebook lag because milestone suggestion effects are tied directly to raw keystroke rendering

---

## Phase 4 — Add the collapsible bottom scheduler shell

Create a **scheduler UI component** for the bottom of the notebook section, but keep it non-functional for now.

Behavior and structure:

* It should always exist at the bottom of the notebook area.
* It is **collapsed by default**.
* Visual: In collapsed form, show a **horizontal colored bar** with a centered **arrow-up icon**.
* When the user taps it, it expands upward to reveal the check-in schedule UI.

Expanded scheduler content:

* show pill options for:

  * `2 min`
  * `5 min`
  * `X min`
* `X min` should be an editable numeric entry UI
* when a pill is selected, it should visually show selected state
* for now, only build the UI and local selection behavior; no actual scheduling action yet

---

## Phase 5 — Create modular milestone board UI

Build the right-side milestone board as a separate presentational zone.

Board behavior:

* It displays milestone notes pinned on the board.
* Notes should look like small rectangular paper cards with:

  * a subtle background chosen from your existing palette
  * a slight random tilt
  * a centered pin/dot at the top
  * handwritten-style milestone text
  * soft shadow, minimal depth

Important styling rule:

* the random angle should be **small only**, just enough to feel organic
* choose from approved palette colors in index.css.

Architecture rule:

* create a **dedicated modular milestone card component**
* the card component should handle its own display styling
* page-level logic should remain separate from the card rendering logic

---

## Phase 6 — Create the editable milestone input area

Add a dedicated **milestone text box** area that is editable.

Behavior:

* When the AI returns a milestone suggestion, it should populate this editable milestone textbox.
* The user can:

  * accept it as-is
  * edit it before adding
  * ignore it
  * write their own milestone manually
* Only the milestones the user actually confirms/adds should be stored in the committed milestone list.

State model:

* `notesSoFar`: full notebook text
* `draftMilestone`: current editable milestone textbox content
* `milestones: string[]`: committed milestones only

Important rule:

* Only `milestones: string[]` is the committed list sent as `existingMilestones` to the API
* If that array is empty, omit `existingMilestones` from the request entirely

---

## Phase 7 — Implement milestone suggestion trigger logic safely

Add background logic to request AI milestone suggestions while the user writes.

Trigger rule:

* count words by splitting on spaces
* after each new **8-word threshold**, trigger a milestone suggestion request

Example idea:

* 8 words → eligible
* 16 words → eligible
* 24 words → eligible
* and so on

Request payload:

* always send the **full current notebook text** as `notesSoFar`
* send `existingMilestones` only if the committed milestone list is non-empty

Important guardrails:

* this should run in the background without hurting typing responsiveness
* if a user writes and then deletes and writes back, we will trigger again at 8-word intervals, but do not trigger multiple times for the same threshold. Write smart logic but don't make it too strict.

API target:

* use the project proxy style and call relative client paths like `/api/milestone-suggestions`
* do not hardcode `localhost:5000` in client code because the frontend conventions specify proxying through `/api/...`

---

## Phase 8 — Add request throttling and quota handling

Respect the constraint of **10 requests max per minute**.

Required behavior:

* if the user keeps writing and new thresholds are reached, only dispatch suggestions while under quota
* once 10 requests have been used in the current 60-second window, stop sending immediately
* once quota becomes available again, send the latest eligible suggestion request

Important implementation rule:

* keep only the latest useful pending state so the system stays current and avoids spammy stale requests

This means:

* if the user writes rapidly past several thresholds while quota is exhausted, do not send many old requests later
* instead, when quota opens again, send the most recent full `notesSoFar` and current committed milestones

This keeps the suggestion stream relevant and efficient.

---

## Phase 9 — Add milestone attention feedback

When a new AI milestone suggestion arrives:

* place it into the editable milestone textbox
* subtly highlight the milestone area to draw the user’s attention
* keep the highlight gentle, warm, and temporary
* do not use aggressive animation, bouncing, or bright flashing

Use conservative motion only:

* subtle background emphasis
* mild fade/glow/tint
* no layout-shifting animations

---
## Phase 10 — Expose shared state cleanly (lifted parent state)

Make notebook text and committed milestone state available across routes by **lifting state to a parent layout**.

The state that must be exportable:

* current notebook text (`notesSoFar`)
* committed milestones list (`milestones: string[]`)

### State strategy (no persistence, fresh on refresh)

* Store all shared state in a **parent route layout**
* Pass state and setters down via props (or a lightweight context if prop drilling becomes messy)
* When navigating between pages (e.g., notebook → thumbnails → canvas), the state remains available because the parent stays mounted
* On full page refresh, everything resets (desired behavior)

### Implementation rules

* Keep typing performance optimized:

  * notebook input manages fast local state
  * sync to parent state in a controlled way (e.g., debounced or on stable updates)
* Do not push every keystroke through the entire app tree unnecessarily
* Avoid over-globalizing — only lift what truly needs to be shared across routes

### Practical structure

* `SetupLayout` (parent route)

  * owns `notesSoFar`, `milestones`
  * renders `<Outlet />`
* Child pages (notebook, thumbnails, canvas):
  * consume and update shared state via props/context

---

## Phase 11 — Add navigation buttons

Wire buttons as follows:

* **Move to canvas** → route to canvas page
* **Continue to thumbnails** → route to thumbnail page

Use React Router v7 conventions already defined for the project:
* use`useNavigate`

---

## Phase 12 — Final polish and safety pass

Before finishing, do a cleanup pass focused on iPad/WebKit stability and design fidelity.

Verify all of the following:

* notebook is visually dominant with the 60/40 split
* collapsed scheduler preserves notebook space
* tapping the notebook opens keyboard naturally
* typing is smooth and not laggy
* ruled lines align well with text rhythm
* milestone cards tilt slightly and look modular/clean
* AI milestone suggestions populate editable milestone input correctly
* only committed milestones are stored in `string[]`
* request triggering respects 8-word thresholds
* quota never exceeds 10 requests per minute
* pending request behavior stays current, not stale
* no unnecessary `fixed`, giant transforms, or fragile overflow hacks were introduced
* all colors/fonts come from existing design tokens and semantic classes where possible 

---

## Recommended component structure

Use something close to this:

* `NotebookSetupPage`

  * owns page orchestration and routing logic
* `NotebookInputSurface`

  * owns notebook text input UI and local typing performance
* `SchedulerCollapse`

  * owns collapsed/expanded scheduler UI only
* `MilestoneBoard`

  * displays board layout and milestone collection
* `MilestoneCard`

  * modular visual note card with tilt/color/pin
* `MilestoneDraftInput`

  * editable textbox for AI/manual milestone drafting
* `useMilestoneSuggestions`

  * handles threshold tracking, quota management, and API requests
* shared state container/store/context

  * exposes notebook text and committed milestones where needed

---
throughout this, write your concise decisions and useful info for others in progress_notes.md in developer_notes.