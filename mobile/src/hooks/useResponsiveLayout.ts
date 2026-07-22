import { useWindowDimensions } from 'react-native';
import { getLayoutMetrics } from '../utils/responsive';

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  return { width, height, fontScale, ...getLayoutMetrics(width) };
}
