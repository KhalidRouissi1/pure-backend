export const COMPACT_PHONE_WIDTH = 380;
export const TABLET_WIDTH = 600;
export const DESKTOP_WIDTH = 1024;
export const MAX_CONTENT_WIDTH = 1200;
export const MAX_FORM_WIDTH = 680;

export type LayoutSize = 'phone' | 'tablet' | 'desktop';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getLayoutMetrics(windowWidth: number) {
  const size: LayoutSize =
    windowWidth >= DESKTOP_WIDTH ? 'desktop' : windowWidth >= TABLET_WIDTH ? 'tablet' : 'phone';
  const gutter = size === 'desktop' ? 32 : size === 'tablet' ? 24 : 16;
  const maxContentWidth = size === 'phone' ? windowWidth : MAX_CONTENT_WIDTH;
  const contentWidth = Math.min(windowWidth, maxContentWidth);
  const outerInset = Math.max(0, (windowWidth - contentWidth) / 2);

  return {
    size,
    gutter,
    contentWidth,
    maxContentWidth,
    outerInset,
    isPhone: size === 'phone',
    isTablet: size === 'tablet',
    isDesktop: size === 'desktop',
    isWide: size !== 'phone',
  };
}

export function getProductGridMetrics(windowWidth: number, gap = 12) {
  const layout = getLayoutMetrics(windowWidth);
  const availableWidth = Math.max(0, layout.contentWidth - layout.gutter * 2);
  const minimumCardWidth = layout.isPhone ? 148 : 190;
  const columns = clamp(
    Math.floor((availableWidth + gap) / (minimumCardWidth + gap)),
    availableWidth < 320 ? 1 : 2,
    5
  );
  const itemWidth = Math.floor((availableWidth - gap * (columns - 1)) / columns);

  return {
    ...layout,
    availableWidth,
    columns,
    gap,
    itemWidth,
    listHorizontalPadding: layout.outerInset + layout.gutter,
  };
}

export function getDashboardColumns(windowWidth: number) {
  const { size } = getLayoutMetrics(windowWidth);
  return size === 'desktop' ? 4 : size === 'tablet' ? 3 : 2;
}

export function getRailCardWidth(windowWidth: number) {
  const layout = getLayoutMetrics(windowWidth);
  return layout.isPhone
    ? clamp(windowWidth * 0.44, 150, 210)
    : clamp(layout.contentWidth * 0.24, 190, 260);
}
