# Homepage world composition

The homepage presents the supplied TS3 product render without a model. Its white studio background blends into the page; the globe fades toward the product to form one composition. Other product photography is unchanged.

Paris, New York and Sydney thumbnails in `dist/assets/landmarks/` are 520-pixel WebP derivatives of the existing, documented site images in `dist/assets/`. No new external photography is introduced. Tokyo and Paris videos retain their existing sources and playback lifecycle; see `media-provenance.md`.

Globe city dots and thin connections rotate with the Earth. They illustrate MOVEVI's global ambition, and do not represent available routes, device connectivity or live customer activity. The scenic photographs likewise illustrate destinations.

Validation: desktop 1440×900 and 1366×768, phone 390×844 and tablet 768×1024; native scrolling, globe keyboard control, product anchor and offscreen playback pause. `npm run check` also verifies the city arc coordinates remain finite and just above the sphere, alongside existing animation lifecycle checks.
