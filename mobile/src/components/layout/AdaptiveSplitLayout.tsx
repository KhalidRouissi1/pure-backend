import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface AdaptiveSplitLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function AdaptiveSplitLayout({
  primary,
  secondary,
  style,
}: AdaptiveSplitLayoutProps) {
  const { isWide } = useResponsiveLayout();

  return (
    <View style={[styles.base, isWide && styles.wide, style]}>
      <View style={[styles.pane, isWide && styles.primaryWide]}>{primary}</View>
      <View style={[styles.pane, isWide && styles.secondaryWide]}>{secondary}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { width: '100%', flexGrow: 1 },
  wide: { flexDirection: 'row', alignSelf: 'center', maxWidth: 1200, minHeight: 720 },
  pane: { width: '100%' },
  primaryWide: { flex: 4, justifyContent: 'center' },
  secondaryWide: { flex: 6, justifyContent: 'center' },
});
