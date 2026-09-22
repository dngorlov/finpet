/** Type scale and spacing; body and button ≥16 sp (UX constraints). */
export const type = {
  title: 28,
  section: 20,
  body: 16,
  button: 16,
} as const;

export const spacing = {
  s: 8,
  m: 16,
  l: 24,
} as const;

/**
 * Andrei's Material 3 light scheme (seed export from the team chat, 2026-09-20).
 * Each token names its M3 source so a re-export maps one-to-one.
 * Text-on-fill pairs are checked for WCAG AA: onRaised on raisedFace 4.6:1,
 * accentText on background 6.1:1, text on background 16:1.
 */
export const colors = {
  /** surface */
  background: "#FFF8F4",
  /** on-surface */
  text: "#221A12",
  /** on-surface-variant */
  subtle: "#534434",
  /** surface-container-lowest */
  card: "#FFFFFF",
  /** primary-container — fills, borders, selected beads (not text) */
  accent: "#F7A115",
  /** primary — link-style text on background */
  accentText: "#855400",
  /** primary-container — raised button face */
  raisedFace: "#F7A115",
  /** primary — raised button edge */
  raisedEdge: "#855400",
  /** on-primary-container — label on raisedFace */
  onRaised: "#633D00",
  /** outline-variant */
  disabledFace: "#D8C3AD",
  /** secondary-container */
  badgeFill: "#FECB8F",
  /** surface-container-high */
  track: "#F5E6D7",
  /** tertiary-container — meter and progress fill (numbers always sit beside it) */
  fill: "#ACBD33",
  /** primary-fixed */
  highlight: "#FFDDB7",
} as const;

export const radius = {
  card: 20,
} as const;

/** Minimum touch target (UX constraints). */
export const minTarget = 48;
