# Globe assets and App reference

Verified on 2026-10-13. The globe is an exploration interface illustration, not an assertion that the displayed cities or routes have launched. No accounts, activity totals or completed journeys are implied.

## App visual reference

- App source: `C:/Users/14629/Documents/ChatGPT/木卫六APP2.0/src/components/journey/JourneyGlobe.tsx`.
- The current World page uses `WorldGlobe` with `appearance="night"` and `focusAltitude={2.16}`. Its visual elements are a blue night globe, a pale violet-gray atmosphere, country outlines, and selectable city markers.
- Shared renderer reference: `src/components/WorldGlobe.tsx`. The site's renderer is implemented independently in vanilla JavaScript; it does not distribute the App's React or Three.js stack.
- Website city coordinates match `src/journey/data.ts`: Tokyo 139.6503, 35.6762; Paris 2.3522, 48.8566; New York -74.0060, 40.7128; Sydney 151.2093, -33.8688 (longitude, latitude).

## Shipped static globe fallback

- Output: `dist/assets/globe/globe-fallback.svg`.
- Input: the App's `public/globe/countries-110m.json`, identical to its installed `world-atlas@2.0.2/countries-110m.json`.
- Input SHA-256: `2516c915867c7baf18ddec727aec46c315541a07cfb3d79a6559b05d5e94eee8`.
- Upstream: [World Atlas](https://github.com/topojson/world-atlas), a redistribution of Natural Earth 4.1.0 vector data. The geography is generalized at 1:110m scale.
- [Natural Earth terms of use](https://www.naturalearthdata.com/about/terms-of-use/) state that its map data are in the public domain and may be modified and used commercially.
- The World Atlas ISC notice is retained in `dist/assets/globe/world-atlas-LICENSE.txt`.
- The SVG was generated from the topology's real land geometry and internal boundary mesh with an orthographic projection centered at longitude 128°, latitude 25°, radius 235 in a 500 × 500 viewBox. Hemisphere clipping uses spherical geometry, not invented continent paths.
- Generation used the App's already installed `d3-geo@3.1.1` and `topojson-client@3.1.0` locally. Those libraries are not added to or shipped by the website.

## Existing App night texture investigation

- Candidate input: `public/globe/earth-night.webp`, 1024 × 512, 36,510 bytes, first present in the App's commit `8f68c102c61010965b4f6356e4493784dc655353`.
- The file has no source URL, credit, or derivation record in the App repository. It visually corresponds to `three-globe@2.45.2/example/img/earth-night.jpg`, with a brighter blue treatment. A resized pixel comparison strongly supports that relationship (green and blue channel correlations approximately 0.995 and 0.994), but does not establish an exact transformation or the original image's provenance.
- Three-Globe's software has an MIT license. A software package license alone is not treated here as conclusive provenance for the underlying satellite composite.
- Consequently this investigation does **not** copy the unverified App texture into the website as a cleared asset. The checked geography provides a faithful, independently traceable fallback.

## Shipped NASA night texture

- Output: `dist/assets/globe/earth-night.jpg`, copied byte-for-byte from the [official NASA SVS 1024 × 512 download](https://svs.gsfc.nasa.gov/vis/a030000/a030000/a030028/earthatnight2012_print.jpg), linked under “Flat map of the whole Earth” on [SVS record 30028](https://svs.gsfc.nasa.gov/30028/).
- Dimensions: 1024 × 512. Size: 66,281 bytes. No resizing, repainting, or AI image transformation was applied.
- SHA-256: `18ee3bd634967a2cacbe9513ba42ff56fe382b3b43604c4cb7e5935309a3ea5d`.
- This verified texture interprets the App's night-globe visual direction; it is not described as an exact copy of the App texture.
- Credit: NASA Earth Observatory image by Robert Simmon, using Suomi NPP VIIRS data provided courtesy of Chris Elvidge, NOAA National Geophysical Data Center.
- The data are a historical 2012 composite, not a live view or MOVEVI route imagery. Use only as an exploration globe surface. No NASA logo or endorsement is implied.
- [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) explain that NASA content generally is not subject to US copyright, require source acknowledgment, and prohibit explicit or implicit NASA endorsement in commercial uses. The asset contains no identifiable person, NASA emblem, or separate third-party copyright notice on its official source record.

## Additional verified source

- NASA publishes the [Earth at Night / Black Marble flat maps](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/), including the [2012 original-processing JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg).
- Checked source JPEG: 794,479 bytes; SHA-256 `373e5a08c9f378a2ce6320214a613148e4b1e3946b3f39a516c9093b76cb7124`.
- [NASA SVS record 30028](https://svs.gsfc.nasa.gov/30028/) describes the April and October 2012 Suomi NPP VIIRS composite, mapped over MODIS Blue Marble imagery. Credit: NASA Earth Observatory image by Robert Simmon, using Suomi NPP VIIRS data provided courtesy of Chris Elvidge, NOAA National Geophysical Data Center.
- The existing App texture is not asserted to be an exact derivative of this alternate NASA JPEG. The shipped file is the smaller SVS download identified above.
