/** Type scale and spacing; main text ≥16 sp (UX constraints). */
export const type = {
  title: 28,
  body: 16,
} as const;

export const spacing = {
  s: 8,
  m: 16,
  l: 24,
} as const;

export const colors = {
  background: "#FFF8F0",
  text: "#1B1B1F",
  subtle: "#5F6368",
  card: "#FFFFFF",
  accent: "#E07A3D",
  track: "#E6E0D8",
  fill: "#5B8C5A",
  highlight: "#F4D9A6",
} as const;

/** Minimum touch target (UX constraints). */
export const minTarget = 48;
