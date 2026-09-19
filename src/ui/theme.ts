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

export const colors = {
  background: "#FFF8F0",
  text: "#1B1B1F",
  subtle: "#5F6368",
  card: "#FFFFFF",
  accent: "#E07A3D",
  raisedFace: "#E07A3D",
  raisedEdge: "#C45F28",
  disabledFace: "#C5C0B8",
  badgeFill: "#FFE6C7",
  track: "#E6E0D8",
  fill: "#5B8C5A",
  highlight: "#F4D9A6",
} as const;

export const radius = {
  card: 20,
} as const;

/** Minimum touch target (UX constraints). */
export const minTarget = 48;
