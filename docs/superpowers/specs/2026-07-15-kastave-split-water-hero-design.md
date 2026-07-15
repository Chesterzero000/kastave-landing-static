# Kastave Split-Water Hero Animation Design

Date: 2026-07-15

## Goal

Replace or augment the current Kastave homepage hero with a split-water scene that immediately explains the product: Kastave floats at the surface while sonar scanning reveals underwater terrain before the angler casts.

The chosen direction is a realistic background with a lightweight Canvas/CSS scan overlay. It should feel field-tested and premium, not like a sci-fi HUD demo.

## Success Criteria

- A first-time visitor understands within three seconds that Kastave scans underwater structure from the water surface.
- The hero keeps the current conversion goal visible: reserve access for $1.
- The effect runs smoothly on modern desktop and mobile browsers.
- The page still has a fast, nonblank first paint through a poster image and static fallback.
- Motion supports the product story instead of competing with it.

## Visual Concept

The hero uses a fixed camera split by the waterline:

- Upper half: real lake surface, shoreline, natural light, and Kastave floating or being placed into the water.
- Lower half: darker underwater view with depth haze, subtle particles, and a visible lakebed silhouette.
- At the product position, sonar pulses project downward and forward into the underwater half.
- As pulses pass, terrain features appear as contour lines, point traces, or low-opacity mesh strokes.
- The scene loops in eight to twelve seconds without a noticeable hard reset.

The brand tone should be "field-tested premium fishing tech": real water first, readable technology second, pre-order offer third.

## Content

Primary headline:

> Map the Water Before You Cast

Supporting line:

> Kastave scouts freshwater structure from the surface and turns sonar returns into casting decisions.

Primary CTA:

> Reserve for $1

Secondary CTA:

> See the scan workflow

The discount claim can remain in a compact offer strip below the hero or as a short line near the CTA, but it should not dominate the opening scene.

## Layout

Desktop:

- Full-bleed hero with a minimum height around 760px or 86vh.
- Product and waterline occupy the visual center/right.
- Text block sits left or lower-left with no card wrapper.
- CTA row appears directly under the supporting line.
- A small proof row can sit below the CTA: "20 m scan radius", "Freshwater scouting", "3D structure preview".

Mobile:

- Use a cropped poster or simplified background video.
- Keep the product and waterline visible in the first viewport.
- Text moves to the lower portion with enough dark gradient behind it for readability.
- Canvas scan overlay simplifies to fewer pulses and contour lines.
- Secondary CTA may collapse below the primary CTA.

## Motion Design

The animation has four repeating layers:

1. Water motion: subtle video movement or CSS shimmer at the waterline.
2. Sonar pulse: radial or fan-shaped waves from Kastave into the underwater half.
3. Terrain reveal: contour/point lines brighten briefly as the scan passes.
4. Data hint: two or three tiny labels fade in, then out, such as "drop edge", "hard bottom", and "cast zone".

Motion constraints:

- No constant neon clutter.
- No rapid flashing.
- Respect `prefers-reduced-motion` by showing the static poster plus one non-animated terrain overlay.
- Avoid scroll-jacking and heavy parallax.

## Technical Approach

Use the existing static-site architecture:

- HTML section for the hero structure and accessible copy.
- CSS for layout, responsive cropping, gradients, CTA styling, and reduced-motion fallback.
- Canvas for sonar pulses, contour lines, terrain reveal, and optional particle haze.
- Native JavaScript using `requestAnimationFrame`, paused when the hero is offscreen.
- Poster image shown before video/canvas readiness.

Preferred asset stack:

- Desktop poster: split-water hero still.
- Mobile poster: tighter crop with product and waterline.
- Optional background video: short muted loop for surface/water realism.
- Canvas overlay: generated scan lines and terrain; no large runtime dependency.

The existing 3D sonar reconstruction module should remain later in the page as deeper proof. The hero should tease the concept, not duplicate the full interactive demo.

## Performance

- Keep hero JS small and isolated.
- Do not load Three.js for this hero.
- Use `IntersectionObserver` to pause Canvas when not visible.
- Use DPR-capped Canvas rendering, such as `Math.min(devicePixelRatio, 2)`.
- Avoid layout shift by declaring stable hero dimensions and poster aspect ratios.
- Target a static poster first paint before scan animation initializes.

## Accessibility

- Canvas is decorative and marked with `aria-hidden="true"`.
- The hero section has text content in normal HTML.
- CTA links remain keyboard reachable.
- Reduced-motion users get a calm static version.
- Color contrast must remain high over the water background.

## Implementation Scope

Initial implementation should update the homepage hero only:

- Add split-water hero markup.
- Add CSS for desktop/mobile layout.
- Add a small `SplitWaterHero` JavaScript module or function.
- Reuse existing CTA tracking attributes where applicable.
- Keep the current reserve section and payment flow unchanged.

Out of scope for the first pass:

- Building a full 3D interactive underwater world.
- Reworking the entire page information architecture.
- Changing checkout/payment logic.
- Replacing all site photography.

## Verification

Before calling the work complete:

- Confirm the hero renders nonblank on desktop and mobile widths.
- Confirm the Canvas scan appears and loops.
- Confirm `prefers-reduced-motion` fallback works.
- Confirm CTA links still navigate correctly.
- Confirm no text overlaps product, waterline, or controls.
- Run existing tests if the project test runner is available.

