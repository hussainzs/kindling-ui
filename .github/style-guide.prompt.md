---
description: "Apply the strict UI style guide to the current implementation. Use when writing new React components to ensure CSS and design fidelity."
name: "Kindling Style Guide"
---

Please reference this style guide alongside the provided Figma design to ensure exact match and iPad compatibility.

# platform assumptions

* This app is **iPad-first and iPad-only**. You should **not optimize for desktop aesthetics**, Android behavior, or cross-browser edge cases unless they also improve iPad Safari behavior. Testing on Windows Chrome device emulation is only a rough proxy; the real constraint is **WebKit on iPad**. 
* The drawing canvas is **not** the product focus. The priority is **stable touch interactions**, UI flows, sheets, panels, cards, navigation, and predictable layout behavior on iPad Safari. 
* Use index.css where we have our colors and fonts. If you need to add classes, add to index.css minimally and use it from there so they are reusable. We MUST write modular clean code.
* **Default layout baseline is iPad landscape**. Size and spacing decisions should target roughly **1180px width x 820px height** first, then provide graceful fallback for narrower widths.

# Typography and design tokens

## Fonts
* Fonts have been integrated through google fonts in index.html.
* Use **Inter** for all primary UI text.
* Use **Shadows Into Light** only for handwritten note areas, sticky notes, or notebook-style surfaces.
* Do not mix extra fonts.
* Keep text rendering simple. Avoid strange transform-based scaling tricks on text because transformed ancestors can interact badly with fixed-position logic and containing blocks. MDN notes that transformed ancestors affect positioning behavior for descendants, especially `position: fixed`. 

## Text style usage

* Section headers: lowercase.
* Mini section headers: uppercase.
* Buttons and labels: bold.
* Prefer stable text sizes over responsive fluid gimmicks. This is an iPad-only target.
* Avoid tiny text. Touch UIs on iPad should bias toward readable, calm spacing.

---

# Color usage rules

Use only the following semantic assignments.

## Background and surface

* `cream #F5EFE4`: primary app background, full-screen background, most screens.
* `parchment #EDE5D8`: sidebars, setup left panels, HUD-like panels.
* `warm-white #FAF6F0`: cards, sheets, nav bars, elevated surfaces.

## Text

* `ink #1C1510`: primary text and headings.
* `ink-mid #3A2E24`: body text and form labels.
* `ink-soft #6B5D52`: secondary text and captions.
* `muted #8C8078`: placeholders, timestamps, metadata.
* `dust #BFB4A6`: borders, empty-state accents, low-emphasis dividers.

## Rust

* `rust #B8431F`: primary CTA fill, active states, key actions.
* `rust-light #D97B5A`: borders on rust surfaces, hover/pressed variation.
* `rust-pale #F2DDD5`: rust tags, rust-tinted cards, soft attention backgrounds.

## Gold

* `gold #C9973A`: streak card accents, milestone borders, special progress.
* `gold-light #E8C06A`: highlight numbers, decorative emphasis.
* `gold-pale #F8EDD4`: special positive cards, milestone backgrounds.

## Sage

* `sage #5E8060`: positive state, calm success, flow state.
* `sage-pale #D8EADA`: positive tags or pale success surfaces.

## UI elements

* `divider #E8E0D4`: separators, card borders, row dividers.
* `shadow`: use sparingly, soft, warm shadow language only.

## Color behavior rules

* Do not introduce raw arbitrary colors in components.
* Do not use overly cool grays or pure white/black.
* Match the figma screenshot colors using the provided palette.

---

# Layout rules for iPad WebKit

## 1- Prefer stable viewport sizing; avoid blind `100vh`

* On mobile Safari/WebKit, classic `100vh` can behave badly. New viewport units like `svh`, `lvh`, and `dvh` exist specifically to address this problem. Use them intentionally rather than defaulting everything to `h-screen`.
* For shells, full-height panels, sheets, and app containers:

  * Prefer `min-h-[100svh]` for “must always fit visible space safely on load.”
  * Prefer `h-[100dvh]` only when you truly want dynamic adaptation to browser chrome changes.
  * Be cautious with Tailwind `h-screen`, `min-h-screen`, `max-h-screen`, because these are historically tied to `100vh` semantics and may not be what you want on iPad Safari.

## 2- Be conservative with `position: fixed`

* `position: fixed` is a recurring trouble spot in iOS/Safari, especially around browser chrome, keyboard/focus transitions, and transformed ancestors. MDN also notes that `fixed` elements stop being viewport-relative if an ancestor has `transform`, `perspective`, or `filter`.
* Rule:

  * Use `fixed` only for truly global overlays: full-screen modal backdrops, emergency floating controls, maybe bottom sheets.
  * Prefer `sticky` or normal document flow when possible.
  * Never place a `fixed` element inside a parent with `transform`, `filter`, `backdrop-filter`, or `perspective`.
  * Avoid nesting fixed overlays inside animated/transformed app shells.
* For headers/toolbars:

  * Prefer `sticky top-0` over `fixed top-0` unless there is a strong reason otherwise.

## 3- Sticky elements break easily when ancestors have overflow

* Sticky positioning depends on ancestor layout and scrolling context. If an ancestor has incompatible overflow, sticky often stops working as expected. MDN’s positioning/containing-block docs support the importance of ancestor layout context here, and this is a common real-world pitfall. 
* Rule:

  * If using `sticky`, audit all ancestors for `overflow-hidden`, `overflow-x-hidden`, `overflow-auto`, transforms, and filters.
  * Do not casually put `overflow-hidden` on app-level wrappers.
  * Avoid `overflow-x-hidden` on `body`, root wrappers, or major layout parents if sticky content lives inside them.

## 4- Prefer one obvious scrolling container

* Multiple nested scroll regions are risky on iPad Safari, especially with touch interactions.
* Rule:
  * Make the page shell or one major content column the main scroller.
  * Avoid deeply nested `overflow-y-auto` regions unless required for a sheet or drawer.
  * If you need internal scrolling, make it deliberate and isolated.
* Use `overflow-y-auto` only where the user clearly expects a panel to scroll.
* Avoid accidental horizontal overflow. Keep widths explicit.

## 5- Safe-area readiness

* WebKit provides safe-area env vars for edge-to-edge layouts. Even though iPad safe-area issues are less dramatic than some iPhones, overlays and bottom controls should still be written safely if they can touch screen edges.
* Rule:
  * For bottom bars, sheets, or fixed controls near edges, allow padding that can incorporate safe-area insets.
  * Keep this logic in global utilities or CSS variables if possible.
  * Do not hard-pin important tap targets flush to the very bottom edge.

---

# Tailwind usage rules for WebKit safety

## 6- Avoid transform-heavy layout hacks

* Tailwind makes transforms easy, but transforms are not free on Safari. More importantly, transformed ancestors can change containing-block behavior for descendants, especially `fixed` children.
* Rule:
  * Do not use `transform` on page-level wrappers, app shells, or ancestors of fixed/sticky UI.
  * Use transforms only for isolated micro-animations on leaf nodes.
  * Avoid patterns like `translate-x-*` on giant container wrappers if those wrappers also contain overlays/toolbars.
  * Do not use `scale-*` for layout corrections.

## 7- Be careful with `filter` and `backdrop-filter`

* MDN notes that `backdrop-filter` requires transparency to be visible. Safari has had practical issues around backdrop blur in some contexts, and Tailwind users have reported Safari-specific regressions. Treat blur as decorative, not structural.
* Rule:
  * Do not rely on `backdrop-blur-*` for critical readability or interaction.
  * If using backdrop blur, also provide a real semi-opaque background color.
  * Test blurred layers on real iPad before making them a core visual motif.
  * Avoid using blur on moving, sticky, or complex nested overlays unless absolutely necessary.

## 8- Avoid arbitrary CSS for clever viewport tricks unless necessary

* Tailwind arbitrary values are useful, but don’t turn the prototype into a bag of one-off hacks.
* Rule:
  * Prefer semantic utilities and reusable classes.
  * Use arbitrary values only for:
    * `svh/dvh`
    * precise iPad spacing
    * custom shadows/radii matching Figma
  * Avoid weird calc chains in markup unless there is no cleaner utility strategy.

## 9- Avoid `h-screen` as a default shell primitive
* Tailwind `h-screen` is easy, but on mobile WebKit that often maps to the wrong mental model. Prefer explicit viewport units that match actual intent. 

## 10-  Keep shadow/radius language simple

* Safari can render big layered effects fine, but excessive compositing plus touch interaction plus blur is not where you want fragility.
* Rule:
  * Use one soft shadow system.
  * Avoid stacking giant shadows, blur, masks, filters, and transforms on the same component.
  * Prefer warm surfaces and borders over “glassmorphism pileups.”

---

# Touch interaction rules

## 11- Design for touch first, not click first

* The app’s real interaction model is finger input on iPad.
* All primary tap targets should be comfortably large.
* Rule:
  * Use large buttons, roomy list rows, and obvious spacing.
  * Avoid dense nav clusters.
  * Do not hide key actions behind hover-only states.

## 12- Use `touch-action` intentionally

* MDN documents `touch-action` as the way to define what touch gestures the browser should handle versus the app. This matters for preventing conflict between browser panning/zooming and your touch surfaces.
* Rule:
  * On normal buttons/cards: leave behavior simple unless there is a reason to restrict gestures.
  * On the minimal drawing surface: use touch rules intentionally so the canvas interaction does not fight page scrolling.
  * Do not globally disable all native gestures unless the screen truly demands it.
* Translation for agent behavior:
  * Never slap `touch-none` everywhere.
  * Use targeted `touch-action` behavior on gesture-sensitive surfaces only.

## 13- Avoid hover-dependent UX

* iPad may emulate hover in odd ways depending on input mode and accessories, but your product should assume **touch-first interaction**.

---

# Forms, sheets, inputs, and keyboard behavior

## 16- Input focus can disturb layout on iOS/WebKit

* Input focus and the on-screen keyboard historically interact badly with fixed-position UI on iOS Safari. This is one reason to keep input-heavy screens structurally simple.
* Rule:
  * Avoid placing critical form content inside complex fixed shells.
  * Prefer normal document flow or a simple sheet layout for input areas.
  * When an input receives focus, do not assume fixed headers/footers will remain visually perfect.
* If a screen has real text entry:
  * keep the hierarchy shallow. Avoid fancy animated container moves on focus

## 17- Avoid custom form controls unless needed
* Native controls are often safer on Safari, If customizing selects/inputs, keep it visually light.

---

# Scrolling and overflow rules

## 18- Avoid body-scroll hacks unless you truly need them

* iOS Safari has a long history of awkward body scroll locking and nested scroll behavior. Even though modern support has improved, this remains an area where complexity breeds bugs.
* Rule:
  * Use one main scrolling surface.
  * For modals/sheets, use the least invasive scroll lock strategy possible.
  * Avoid complicated “body fixed / restore scroll / fake wrapper” systems unless necessary.

## 19- Be cautious with `overflow-hidden`

* `overflow-hidden` is tempting for visual cleanup, but it can break sticky behavior, clip shadows, and create interaction weirdness.
* Rule:
  * Only apply it to components that truly need clipping.
  * Do not put it on high-level layout wrappers casually.
  * Audit any parent of sticky or dropdown elements.

## 20- Do not hide horizontal overflow globally as a band-aid

* `overflow-x-hidden` on app shells can mask layout bugs while breaking positioning/sticky behavior.
* Fix the width bug instead of globally clipping it. ([Stack Overflow][11])

---

# Animation and motion rules

## 21- Favor opacity and small transforms only

* For WebKit stability, use conservative animation patterns.
* Rule:
  * Preferred: `opacity`, tiny `translateY`, tiny `scale` on isolated elements.
  * Avoid animating layout-heavy containers.
  * Avoid animating height from `0` to massive values when you can use conditional rendering or simpler transitions.
* Do not animate app-level wrappers that contain sticky/fixed descendants.

---
## index.css organization guide

The `index.css` file is organized into 22 semantic sections, each marked with grep-friendly headers for fast discovery.

### Quick Workflow for Adding Classes
1. **Consult the TOC**: Read the Table of Contents at the top of `client/src/index.css` to understand all sections and keywords.
2. **Grep for similar classes**: Use `grep "keyword" client/src/index.css` to find existing classes that might fit your need.
   - Example: `grep "btn-" client/src/index.css` to find all button variants
   - Example: `grep "text-" client/src/index.css` to find all typography classes
3. **Reuse existing classes**: Prefer composition of existing classes over creating one-off classes.
4. **Add minimally**: Only add a new class if no existing class fits.
5. **Place correctly**: Use section markers (`/* SECTION: Name */`) to find the right location in the file.

### Section Markers Format
Each major section uses the format: `/* SECTION: Name | keyword1, keyword2 */`

Examples:
- `/* SECTION: Typography Semantics | text-section-header, text-mini-header, text-body, text-caption, text-metadata, text-label, text-button, text-note-hand */`
- `/* SECTION: Buttons | btn, btn-primary, btn-secondary, btn-ghost, btn-gold, btn-sage */`
- `/* SECTION: Utility Classes | bg-*, text-*, shadow-card, touch-pan-y, touch-pan-x, touch-manipulation */`

---

Final reminder: Most importantly, your job is to implement your design as well as you can. The designs were already made for iPad screen only. If you find yourself needing to make a judgment call between “following the design” and “following the style guide,” default to following the design but call out any conflict in your summary to me after you finish.