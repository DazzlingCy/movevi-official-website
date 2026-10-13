# Mobile and TS3 photography update — 2026-10-13

- Mobile and tablet layouts now use the approved white / gray / blue desktop palette, rounded logo, current company positioning, and four-item navigation.
- Native vertical reading replaces desktop pinned scenes. Brand text and city images reveal as they enter view. The globe continues rotating and supports horizontal touch dragging while allowing vertical page scroll.
- Hero city windows and destination videos use existing mobile media variants. Offscreen/background pause, reduced-motion and save-data fallbacks remain.
- City cards keep horizontal pointer gestures and direct city selection. App steps use a horizontal strip on phones. Product details, galleries, complete specifications, comparison tables and consultation remain available.
- `mobile.css` and `mobile.js` isolate responsive presentation from desktop styles. `lifestyle.css` applies the supplied photography across device sizes.
- Six company photos were selected from TS3 / TS3 PRO folders. Each model has its own home, controls and storage photography; existing rendering angles and all eight products' specifications remain. Provenance is recorded in `lifestyle-sources.md`. No external model images or invented customer testimonials were added.

Validation: full `npm run check`; browser viewport checks at 320 × 740, 390 × 844, 768 × 1024 and desktop 1440 × 900. No page-level horizontal overflow at tested widths. Verified menu open/close and navigation, city selection with mobile video source, App step switching, TS3 PRO photo selection, TS6 parameter comparison including 1750 × 845 × 1525 mm, and consultation dialog. Browser viewport testing is not a physical-device Safari test.
