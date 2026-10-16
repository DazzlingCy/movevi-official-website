# User review section

Added after hardware products and before values, inside chapter 08 (`#reviews`).

The owner explicitly approved clearly labelled example reviews on 2026-10-16, then requested a larger avatar-and-bubble comment wall. All twelve quotes, nicknames and role descriptions are fictional editorial examples, not collected customer statements. They must not be presented as verified reviews or used in review/rating structured data. Disclosure appears once below the wall. Repeated role and example badges are removed, while the single disclosure keeps fictional comments distinguishable from real testimony. No ratings or customer counts are included.

Avatars are inline SVG illustrations, not portraits of actual customers. The wall has no additional image downloads or dependencies.

Each comment includes an illustrative machine model (TS2, TS2 PRO, TS3 or TS3 PRO) and a sample review date under the nickname. These are layout examples, not evidence of ownership or actual submission dates. The footer disclosure explicitly covers both fields. Original comments and their loop copies carry identical metadata; dates use semantic `time` elements.

To replace examples, obtain actual customer quotes and permission to publish, then update the quote, attribution and any approved photo in `dist/index.html`. Remove example labels only for verified replacements; retain the section disclosure while any examples remain.

Presentation lives in `dist/reviews.css`. The section fits one ordinary desktop viewport with three horizontal rows. Each row contains four distinct comments plus an aria-hidden, inert duplicate for a seamless loop. Flow pauses on hover/focus, outside the viewport or in a hidden tab. Reduced-motion and no-JavaScript modes show manually scrollable rows. `dist/reviews.js` manages playback and lifecycle.

The visible pause button was removed at the owner’s request. Hover/focus pauses and reduced-motion support remain; keyboard arrows enable manual reading until focus leaves the wall. The heading emphasizes user reviews without claiming the examples are authenticated customer testimony.
