export const PHONE_MIN_WIDTH = 360;
export const COMPACT_PHONE_WIDTH = 380;
export const TABLET_WIDTH = 768;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getProductGridMetrics(windowWidth: number, horizontalPadding = 16, gap = 12) {
  const availableWidth = Math.max(0, windowWidth - horizontalPadding * 2);
  const columns = availableWidth < 330 ? 1 : 2;
  const itemWidth = columns === 1 ? availableWidth : Math.floor((availableWidth - gap) / columns);

  return {
    availableWidth,
    columns,
    gap,
    itemWidth,
  };
}

export function getRailCardWidth(windowWidth: number) {
  return clamp(windowWidth * 0.44, 150, 210);
}
