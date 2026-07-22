import {
  getDashboardColumns,
  getLayoutMetrics,
  getProductGridMetrics,
} from '../../../src/utils/responsive';

describe('responsive layout metrics', () => {
  it('keeps compact phones dense without horizontal overflow', () => {
    const grid = getProductGridMetrics(360);
    expect(grid.size).toBe('phone');
    expect(grid.columns).toBe(2);
    expect(grid.itemWidth * grid.columns + grid.gap).toBeLessThanOrEqual(grid.availableWidth);
  });

  it('uses additional columns instead of scaling cards up on tablets', () => {
    expect(getProductGridMetrics(768).columns).toBe(3);
    expect(getDashboardColumns(768)).toBe(3);
  });

  it('caps content width and expands dashboard density on desktop widths', () => {
    const layout = getLayoutMetrics(1600);
    expect(layout.contentWidth).toBe(1200);
    expect(layout.outerInset).toBe(200);
    expect(getProductGridMetrics(1600).columns).toBe(5);
    expect(getDashboardColumns(1600)).toBe(4);
  });
});
