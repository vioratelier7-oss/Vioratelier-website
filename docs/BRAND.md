# Brand assets

Every logo file is generated from the approved round-3 VIOR ATELIER vector, the VA ligature monogram:
- a thick V stem with its top serif;
- a shared hairline diagonal;
- a curved crossbar swoop;
- the A stem with its foot serif.

The wordmark is **VIOR** in Bodoni Moda with 0.10 em tracking, and **ATELIER** in Jost Light with wide tracking. All text is outlined to paths, so the logo renders identically everywhere and is never typeset as live text.

| File | Use |
|---|---|
| `public/brand/logo-primary-navy.svg` / `-ivory.svg` / `-champagne.svg` | Primary lockup: monogram above the wordmark (light and dark backgrounds) |
| `public/brand/logo-inline-*.svg` | One-line header lockup: monogram · VIOR │ ATELIER. Same fonts, with ATELIER sized up so it stays legible in a navigation bar |
| `public/brand/logo-horizontal-*.svg` | Monogram left, stacked wordmark right |
| `public/brand/monogram-*.svg`, `wordmark-*.svg` | Standalone marks |
| `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `public/brand/favicon.svg` | Favicon set: the **heavier favicon cut** of the monogram (thicker hairlines so it reads at 16–32 px), champagne on navy |
| `public/brand/logo-primary-navy.png` | Raster logo for structured data (JSON-LD) |
| `components/brand/paths.ts` + `Logo.tsx` | The same geometry as React components (`Monogram`, `Wordmark`, `LogoPrimary`, `LogoHorizontal`, `LogoInline`), coloured with `currentColor` |

Colours used on the site:

| Name | Hex | Share of the site |
|---|---|---|
| Warm Ivory | #F6F4EF | ~70%, with Pure White #FFFFFF |
| Midnight Navy | #1B2438 | ~20% |
| Champagne Gold | #C9B78F | ~10%, with Soft Stone #D8D3C9 |
| Body text | #343631 | |

A deeper champagne, #7E6B45, is used for small champagne-coloured text on ivory and white. It gives 4.7–5.2:1 contrast there (WCAG AA), and large display italics use #988457 (3.3:1, AA for large text), where the brand champagne gives only about 1.8:1. Brand champagne #C9B78F is used for lines, icons and text on navy, where it reaches 7.9:1.
