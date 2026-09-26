/** A finger must move this far before a chip picks up. Shorter moves stay taps. */
export const DRAG_THRESHOLD = 8;

/** Extra pixels around a basket so a chip that overlaps the edge still lands. */
export const DROP_SLOP = 24;

export type DropFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Basket under a page point, or null. Overlapping slop prefers the nearer center. */
export function binAtPoint(
  pageX: number,
  pageY: number,
  frames: readonly (DropFrame | undefined)[],
  slop = DROP_SLOP,
): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    if (!frame || frame.width <= 0 || frame.height <= 0) continue;
    if (
      pageX < frame.x - slop ||
      pageX > frame.x + frame.width + slop ||
      pageY < frame.y - slop ||
      pageY > frame.y + frame.height + slop
    ) {
      continue;
    }
    const dx = pageX - (frame.x + frame.width / 2);
    const dy = pageY - (frame.y + frame.height / 2);
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}

/**
 * Page point used to pick a basket: the chip's center after the drag.
 * Without a measured size, the finger itself is the point.
 */
export function chipDropPoint(input: {
  pageX: number;
  pageY: number;
  originX: number;
  originY: number;
  grabX: number;
  grabY: number;
  width: number;
  height: number;
}): { pageX: number; pageY: number } {
  if (input.width <= 0 || input.height <= 0) {
    return { pageX: input.pageX, pageY: input.pageY };
  }
  const dx = input.pageX - input.originX;
  const dy = input.pageY - input.originY;
  return {
    pageX: input.originX - input.grabX + dx + input.width / 2,
    pageY: input.originY - input.grabY + dy + input.height / 2,
  };
}

type Measurable = {
  measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void;
};

/** Window frame of a view. No-op when the host cannot measure (tests, unmounted). */
export function readWindowFrame(node: Measurable | null, save: (frame: DropFrame) => void) {
  if (node == null || typeof node.measureInWindow !== "function") return;
  node.measureInWindow((x, y, width, height) => {
    if (width > 0 && height > 0) save({ x, y, width, height });
  });
}
