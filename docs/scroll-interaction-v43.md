# Scroll interaction restoration

The viewport-fit layout had disabled the solution timeline and completed the brand reveal before its scene reached the viewport. Motion was also disabled below the desktop breakpoint.

- The brand scene now occupies one viewport inside 175svh of native scroll travel. Its title, city imagery, supporting copy and next-destination card reveal in sequence.
- The solution scene uses 240svh of native scroll travel: city window expands, folds into the actual App route screen, then joins the TS3 render. Both directions follow the same timeline.
- Remaining chapters retain their viewport-fit desktop layout and staggered entrances.
- Narrow screens use normal document flow with scroll-driven arrivals, rather than a pinned desktop scene.
- Reduced-motion preferences retain complete static content. No wheel interception or mandatory snapping is used.
- Transparent navigation and the full-viewport, muted looping promotional film remain in place.

Validation: npm run check; real browser scroll checks of brand reveal, reverse traversal, city/App/hardware phases and a 390px mobile viewport. Styles and scripts use version 43 URLs to invalidate older browser caches.
