import { spacing } from "../theme";

/** Moscow map art is 3:4 (width / height). */
export const MAP_ASPECT = 3 / 4;

/**
 * The lesson dock (copy, games, «Начать») never takes more than this share of
 * the padded screen. A long description scrolls inside the dock instead of
 * shrinking the map.
 */
export const DOCK_MAX_SHARE = 0.4;

/** Must match the lesson card's padding and border. */
export const PANEL_PAD = spacing.s + 4;
export const PANEL_BORDER = 2;

export function dockCap(outerHeight: number, pad: number): number {
  if (outerHeight <= 0) return 0;
  return Math.round(Math.max(0, outerHeight - pad * 2) * DOCK_MAX_SHARE);
}

/** Largest 3:4 map that fits in the slot above the dock. */
export function containedMapSize(slotWidth: number, slotHeight: number): { width: number; height: number } {
  if (slotWidth <= 0 || slotHeight <= 0) return { width: 0, height: 0 };
  const height = Math.min(slotHeight, slotWidth / MAP_ASPECT);
  return { width: height * MAP_ASPECT, height };
}

/** Padding, border, and the gap before a pinned action. */
export function panelChrome(hasAction: boolean, gap: number = spacing.s): number {
  return PANEL_PAD * 2 + PANEL_BORDER * 2 + (hasAction ? gap : 0);
}

/**
 * Height of the lesson card before it starts scrolling: the measured copy,
 * games, and pinned action, plus the card's padding, border, and gaps.
 */
export function naturalDockHeight(input: {
  copyHeight: number;
  actionHeight: number;
  extrasHeight: number;
  gap?: number;
}): number {
  if (input.copyHeight <= 0 && input.actionHeight <= 0 && input.extrasHeight <= 0) return 0;
  const gap = input.gap ?? spacing.s;
  return (
    input.copyHeight +
    input.actionHeight +
    input.extrasHeight +
    panelChrome(input.actionHeight > 0, gap) +
    (input.extrasHeight > 0 ? gap : 0)
  );
}

export function dockOverflows(natural: number, cap: number): boolean {
  return cap > 0 && natural > cap;
}
