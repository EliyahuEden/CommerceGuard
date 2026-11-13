# FORME imagery provenance

Created 2026-11-11 for the CommerceGuard demonstration storefront using the built-in `image_gen` tool. No external image API, API key, stock-photo service, or paid service integration was used. The tool did not return a model version; none is claimed.

These are original AI-generated visual illustrations for a fictional apparel shop. They are not photographs of physical inventory or evidence of material/manufacturing specifications. No logos, labels, or text were requested in the bitmap assets. The wordmark and UI remain code-native.

All selected PNGs are saved under `storefront/public/forme/`. Generator originals are preserved in Codex's generated-images location. The selected outputs were visually inspected for garment shape, composition, legibility, consistency, and unwanted text. No creative post-processing was applied. Web delivery format optimization may create derived copies without changing the image content.

Delivery derivatives were generated with `scripts/optimize-assets.mjs`, using Sharp
already installed with the pinned Next.js dependency graph: WebP quality 82, maximum
width 1664 px for the campaign and 1100 px for other images, without enlargement.
The seven `.webp` files total 494,066 bytes. PNG originals remain alongside them;
the application references WebP files. This is format/size optimization only.

The same campaign artwork is resized to 1200 px width and encoded as JPEG (quality 85) for the Open Graph and Twitter image file conventions. No creative edits are
made. The favicon is an original code-native SVG; the optimization script rasterizes
that vector into the standard PNG-in-ICO format for browser compatibility.

Local fonts are Manrope and DM Serif Display from the official Google Fonts
repository (`ofl/manrope` and `ofl/dmserifdisplay`). Their SIL Open Font License
notices are included under `public/forme/fonts/`.

## Prompts and intended use

### tee-white.png

Use: T-Shirt white-color variant lead image, so the gallery reflects the selected product option.

Use case: product-mockup. Asset type: square luxury e-commerce catalog image. Primary request: single unbranded white/off-white cotton crewneck T-shirt, full front flat lay, arms gently out, centered and completely visible with generous breathing room around every edge. Very pale warm grey/ivory studio background with enough subtle tonal contrast to clearly delineate the white garment. Soft diffuse daylight from upper left and delicate realistic shadow. Realistic heavy cotton texture, crisp neckline and seams, natural subtle folds, balanced symmetric relaxed silhouette. Elevated minimal studio catalog photography matching a premium minimalist everyday apparel shop's black tee, grey sweatshirt and charcoal trousers imagery. No human, mannequin, hanger, props, logos, labels, hang tags, words or watermark.

### campaign-hero.png

Use: homepage campaign hero.

Use case: photorealistic-natural. Asset type: website campaign hero, wide landscape 16:9. Primary request: an original luxury editorial photograph of an adult male fashion model in an unbranded relaxed black cotton crewneck T-shirt and relaxed light stone trousers, beside a sculptural pale limestone/concrete architectural wall. Cropped face so no recognizable identity, frame from nose or chin to ankles. Model occupies the right two thirds of frame, with uncluttered warm plaster space at left. Mediterranean modernist architecture, tactile wall grain, late afternoon soft directional sunlight, editorial shadow, calm confident pose, authentic cotton fabric drape. Clean restrained styling, premium fashion campaign, beautiful composition, realistic hands. High-end e-commerce fashion photography for a fictional premium minimalist everyday apparel demonstration store. Natural photorealistic materials and proportions, refined warm ivory/stone/charcoal palette, no words, no logos, no hang tags, no watermark.

### editorial-detail.png

Use: material/editorial story panel.

Use case: photorealistic-natural. Asset type: landscape editorial material detail, 4:3. Primary request: folded heavy cotton unbranded black and warm stone T-shirts on a pale travertine bench, near a sculptural warm ivory plaster wall. One black tee edge casually drapes over the bench. Close editorial view emphasizes cotton texture, seams and generous fabric weight. Warm sunlight from upper left, beautiful long soft shadows, quiet understated luxury, authentic fine fabric grain. No people. High-end e-commerce fashion photography for a fictional premium minimalist everyday apparel demonstration store. Natural photorealistic materials and proportions, refined warm ivory/stone/charcoal palette, no words, no logos, no hang tags, no watermark.

### tee.png

Use: product catalog lead image.

Use case: product-mockup. Asset type: square luxury e-commerce catalog image. Primary request: single unbranded black cotton crewneck T-shirt, full front flat lay, arms gently out, centered and completely visible with generous breathing room around every edge. Very pale warm grey/ivory studio background, consistent soft diffuse daylight from upper left and delicate realistic shadow, realistic heavy cotton texture, crisp neckline and seams, natural subtle folds. Elevated minimal studio catalog photography. No human, mannequin, hanger or props. High-end e-commerce fashion photography for a fictional premium minimalist everyday apparel demonstration store. Natural photorealistic materials and proportions, refined warm ivory/stone/charcoal palette, no words, no logos, no hang tags, no watermark.

### sweatshirt.png

Use: product catalog lead image.

Use case: product-mockup. Asset type: square luxury e-commerce catalog image. Primary request: single unbranded heather-grey heavyweight cotton crewneck sweatshirt, full front flat lay, sleeves gently angled down and fully visible, centered and completely visible with generous breathing room around every edge. Very pale warm grey/ivory studio background, consistent soft diffuse daylight from upper left and delicate realistic shadow, realistic heather cotton texture, ribbed cuffs and neckline, natural subtle folds. Elevated minimal studio catalog photography. No human, mannequin, hanger or props. High-end e-commerce fashion photography for a fictional premium minimalist everyday apparel demonstration store. Natural photorealistic materials and proportions, refined warm ivory/stone/charcoal palette, no words, no logos, no hang tags, no watermark.

### sweatpants.png

Use: product catalog lead image.

Use case: product-mockup. Asset type: square luxury e-commerce catalog image. Primary request: single pair of unbranded charcoal cotton relaxed sweatpants, full front flat lay with both legs straight and slightly separated, elastic waist and subtle drawcord, centered and completely visible with generous breathing room around every edge. Very pale warm grey/ivory studio background, consistent soft diffuse daylight from upper left and delicate realistic shadow, realistic cotton texture, clean cuffs and natural subtle folds. Elevated minimal studio catalog photography. No human, mannequin, hanger or props. High-end e-commerce fashion photography for a fictional premium minimalist everyday apparel demonstration store. Natural photorealistic materials and proportions, refined warm ivory/stone/charcoal palette, no words, no logos, no hang tags, no watermark.

### shorts.png

Use: product catalog lead image.

Use case: product-mockup. Asset type: square luxury e-commerce catalog image. Primary request: single pair of unbranded black cotton casual shorts, full front flat lay, relaxed cut just above knee with elastic waist and subtle drawcord, centered and completely visible with generous breathing room around every edge. Very pale warm grey/ivory studio background, consistent soft diffuse daylight from upper left and delicate realistic shadow, realistic cotton texture, natural subtle folds. Elevated minimal studio catalog photography. No human, mannequin, hanger or props. High-end e-commerce fashion photography for a fictional premium minimalist everyday apparel demonstration store. Natural photorealistic materials and proportions, refined warm ivory/stone/charcoal palette, no words, no logos, no hang tags, no watermark.

## Catalog expansion imagery — 2026-11-12

Six additional product illustrations were generated with the built-in `image_gen` tool, one independent call per image, with `transparent_background: false` and no reference images. No external API or paid-service integration was used. The tool returned no model version. Outputs were visually inspected before copying into the workspace: single full garments, natural silhouettes, warm neutral studio backgrounds, and no text/logos. No generation errors or discarded variants occurred. As above, these are fictional AI-generated demo visuals, not photographs of physical stock or proof of material specifications.

PNG originals were copied without creative editing. WebP derivatives use the existing pinned Next.js dependency graph's Sharp encoder: maximum width 1100 px, without enlargement, quality 82. This was applied only to these six new files; existing assets were left unchanged.

| Asset             | PNG dimensions | PNG bytes | WebP dimensions | WebP bytes |
| ----------------- | -------------- | --------: | --------------- | ---------: |
| `sage-tee`        | 1254 × 1254    |   2251190 | 1100 × 1100     |      60200 |
| `ivory-tank`      | 1254 × 1254    |   1778614 | 1100 × 1100     |      43600 |
| `navy-overshirt`  | 1254 × 1254    |   2401561 | 1100 × 1100     |      54606 |
| `sand-chinos`     | 1254 × 1254    |   2062831 | 1100 × 1100     |      45028 |
| `cream-knit`      | 1254 × 1254    |   2593975 | 1100 × 1100     |     142454 |
| `charcoal-hoodie` | 1254 × 1254    |   2280584 | 1100 × 1100     |      73152 |

Six-file totals: 13368755 bytes PNG; 419040 bytes WebP.

### sage-tee.png / sage-tee.webp

Use: standalone catalog/product-detail lead imagery for the expanded local FORME demo catalog.

Exact generation prompt:

```text
Use case: product-mockup. Asset type: standalone square premium e-commerce catalog photograph for the fictional minimalist FORME apparel demonstration shop. Scene/backdrop: very pale warm ivory/greige seamless studio surface, understated editorial catalog photography. Composition: single garment front flat lay, centered, completely visible with generous clean breathing room around every edge, balanced natural garment proportions, top-down camera. Lighting: soft diffuse daylight from upper left, delicate realistic soft shadow beneath garment, consistent warm neutral color balance. Materials: realistic tactile fabric and seams with gentle natural folds, carefully styled, no excessive wrinkles. Constraints: only one garment; no human, mannequin, hanger, props, logos, labels, hang tags, text or watermark. This is an original generated product illustration.
Subject: one unbranded muted sage green cotton crewneck T-shirt, relaxed fit, short sleeves gently angled outward, substantial soft cotton jersey, clean ribbed neckline, straight hem.
```

### ivory-tank.png / ivory-tank.webp

Use: standalone catalog/product-detail lead imagery for the expanded local FORME demo catalog.

Exact generation prompt:

```text
Use case: product-mockup. Asset type: standalone square premium e-commerce catalog photograph for the fictional minimalist FORME apparel demonstration shop. Scene/backdrop: very pale warm ivory/greige seamless studio surface, understated editorial catalog photography. Composition: single garment front flat lay, centered, completely visible with generous clean breathing room around every edge, balanced natural garment proportions, top-down camera. Lighting: soft diffuse daylight from upper left, delicate realistic soft shadow beneath garment, consistent warm neutral color balance. Materials: realistic tactile fabric and seams with gentle natural folds, carefully styled, no excessive wrinkles. Constraints: only one garment; no human, mannequin, hanger, props, logos, labels, hang tags, text or watermark. This is an original generated product illustration.
Subject: one unbranded ivory ribbed cotton tank top, neat scoop neckline, broad shoulder straps, fine vertical rib texture, fitted but natural silhouette, straight hem. Preserve subtle tonal separation between the cream garment and warm pale background.
```

### navy-overshirt.png / navy-overshirt.webp

Use: standalone catalog/product-detail lead imagery for the expanded local FORME demo catalog.

Exact generation prompt:

```text
Use case: product-mockup. Asset type: standalone square premium e-commerce catalog photograph for the fictional minimalist FORME apparel demonstration shop. Scene/backdrop: very pale warm ivory/greige seamless studio surface, understated editorial catalog photography. Composition: single garment front flat lay, centered, completely visible with generous clean breathing room around every edge, balanced natural garment proportions, top-down camera. Lighting: soft diffuse daylight from upper left, delicate realistic soft shadow beneath garment, consistent warm neutral color balance. Materials: realistic tactile fabric and seams with gentle natural folds, carefully styled, no excessive wrinkles. Constraints: only one garment; no human, mannequin, hanger, props, logos, labels, hang tags, text or watermark. This is an original generated product illustration.
Subject: one unbranded deep navy cotton twill overshirt, relaxed fit, full button front neatly closed, pointed collar, two chest patch pockets, long sleeves angled gently down and entirely visible, matte dark buttons, crisp but softly textured twill.
```

### sand-chinos.png / sand-chinos.webp

Use: standalone catalog/product-detail lead imagery for the expanded local FORME demo catalog.

Exact generation prompt:

```text
Use case: product-mockup. Asset type: standalone square premium e-commerce catalog photograph for the fictional minimalist FORME apparel demonstration shop. Scene/backdrop: very pale warm ivory/greige seamless studio surface, understated editorial catalog photography. Composition: single garment front flat lay, centered, completely visible with generous clean breathing room around every edge, balanced natural garment proportions, top-down camera. Lighting: soft diffuse daylight from upper left, delicate realistic soft shadow beneath garment, consistent warm neutral color balance. Materials: realistic tactile fabric and seams with gentle natural folds, carefully styled, no excessive wrinkles. Constraints: only one garment; no human, mannequin, hanger, props, logos, labels, hang tags, text or watermark. This is an original generated product illustration.
Subject: one pair of unbranded sand beige cotton twill chinos, straight relaxed tapered legs, full front view flat lay, both full legs visible and slightly separated, neat fixed waistband with belt loops and center button fly, discreet side pockets, no belt.
```

### cream-knit.png / cream-knit.webp

Use: standalone catalog/product-detail lead imagery for the expanded local FORME demo catalog.

Exact generation prompt:

```text
Use case: product-mockup. Asset type: standalone square premium e-commerce catalog photograph for the fictional minimalist FORME apparel demonstration shop. Scene/backdrop: very pale warm ivory/greige seamless studio surface, understated editorial catalog photography. Composition: single garment front flat lay, centered, completely visible with generous clean breathing room around every edge, balanced natural garment proportions, top-down camera. Lighting: soft diffuse daylight from upper left, delicate realistic soft shadow beneath garment, consistent warm neutral color balance. Materials: realistic tactile fabric and seams with gentle natural folds, carefully styled, no excessive wrinkles. Constraints: only one garment; no human, mannequin, hanger, props, logos, labels, hang tags, text or watermark. This is an original generated product illustration.
Subject: one unbranded warm cream knitted crewneck sweater, relaxed fit, fine visible textured knit, ribbed neckline cuffs and hem, long sleeves angled gently down and completely visible, soft natural cozy drape. Preserve subtle tonal separation between garment and pale background.
```

### charcoal-hoodie.png / charcoal-hoodie.webp

Use: standalone catalog/product-detail lead imagery for the expanded local FORME demo catalog.

Exact generation prompt:

```text
Use case: product-mockup. Asset type: standalone square premium e-commerce catalog photograph for the fictional minimalist FORME apparel demonstration shop. Scene/backdrop: very pale warm ivory/greige seamless studio surface, understated editorial catalog photography. Composition: single garment front flat lay, centered, completely visible with generous clean breathing room around every edge, balanced natural garment proportions, top-down camera. Lighting: soft diffuse daylight from upper left, delicate realistic soft shadow beneath garment, consistent warm neutral color balance. Materials: realistic tactile fabric and seams with gentle natural folds, carefully styled, no excessive wrinkles. Constraints: only one garment; no human, mannequin, hanger, props, logos, labels, hang tags, text or watermark. This is an original generated product illustration.
Subject: one unbranded charcoal grey cotton zip hoodie, full front view flat lay, center zipper neatly closed and anatomically continuous from hem to neckline, hood spread naturally behind neckline, two split kangaroo pockets, simple drawcord, ribbed hem and cuffs, long sleeves angled gently down and entirely visible.
```
