import { HORIZONTAL, INLINE, MONOGRAM_PATHS, MONOGRAM_SMALL_PATHS, MONOGRAM_VIEWBOX, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "./paths";

type Props = { className?: string; title?: string };

/** The VA monogram. Colour follows `currentColor`. */
export function Monogram({ className, title = "VIOR ATELIER", small = false }: Props & { small?: boolean }) {
  const paths = small ? MONOGRAM_SMALL_PATHS : MONOGRAM_PATHS;
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

/** VIOR / ATELIER wordmark, stacked and centred. */
export function Wordmark({ className, title = "VIOR ATELIER" }: Props) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor">
      {WORDMARK_PATHS.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

/** Horizontal lockup: monogram left, wordmark right. */
export function LogoHorizontal({ className, title = "VIOR ATELIER" }: Props) {
  return (
    <svg viewBox={`0 -2 ${HORIZONTAL.width} 137`} className={className} role="img" aria-label={title} fill="currentColor">
      <g transform={`scale(${HORIZONTAL.monoScale}) translate(-40,-52)`}>
        {MONOGRAM_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g transform={`translate(${HORIZONTAL.monoWidth + HORIZONTAL.gap},2)`}>
        {WORDMARK_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

/** Primary lockup: monogram above the wordmark. */
export function LogoPrimary({ className, title = "VIOR ATELIER" }: Props) {
  const mh = 208; const sc = mh / 578; const mw = 806 * sc; const W = Math.max(282, mw);
  return (
    <svg viewBox={`0 0 ${W} ${mh + 46 + 135}`} className={className} role="img" aria-label={title} fill="currentColor">
      <g transform={`translate(${(W - mw) / 2},0) scale(${sc}) translate(-40,-52)`}>
        {MONOGRAM_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g transform={`translate(${(W - 282) / 2},${mh + 48})`}>
        {WORDMARK_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

/** Header lockup on one line, legible at small sizes. */
export function LogoInline({ className, title = "VIOR ATELIER" }: Props) {
  return (
    <svg viewBox={`0 0 ${INLINE.width} 100`} className={className} role="img" aria-label={title} fill="currentColor">
      <g transform={`scale(${INLINE.monoScale}) translate(-40,-52)`}>
        {MONOGRAM_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
      {INLINE.paths.map((d, i) => <path key={`t${i}`} d={d} />)}
    </svg>
  );
}
