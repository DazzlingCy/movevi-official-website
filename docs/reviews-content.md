# User review section

Added after hardware products and before values, inside chapter 08 (`#reviews`).

The owner explicitly approved clearly labelled example reviews on 2026-10-16, then requested a larger avatar-and-bubble comment wall. All twelve quotes, nicknames and role descriptions are fictional editorial examples, not collected customer statements. They must not be presented as verified reviews or used in review/rating structured data. Disclosure appears in the heading, each comment and the section footer. No ratings or customer counts are included.

Avatars are inline SVG illustrations, not portraits of actual customers. The wall has no additional image downloads or dependencies.

To replace examples, obtain actual customer quotes and permission to publish, then update the quote, attribution and any approved photo in `dist/index.html`. Remove example labels only for verified replacements; retain the section disclosure while any examples remain.

Presentation lives in `dist/reviews.css`. Desktop uses three masonry-style columns, tablets use two, and mobile uses one. DOM and visual reading order run down each column. Entrance uses the site's existing `data-reveal` behavior with reduced-motion support. Comments remain stationary for reading; there is no autoplay or forced scrolling.
