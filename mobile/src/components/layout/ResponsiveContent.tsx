import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { MAX_FORM_WIDTH } from '../../utils/responsive';

interface ResponsiveContentProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'page' | 'form';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ResponsiveContent({
  children,
  variant = 'page',
  padded = true,
  style,
  ...props
}: ResponsiveContentProps) {
  const layout = useResponsiveLayout();
  const maxWidth = variant === 'form' ? MAX_FORM_WIDTH : layout.maxContentWidth;

  return (
    <View
      {...props}
      style={[
        {
          alignSelf: 'center',
          width: '100%',
          maxWidth,
          paddingHorizontal: padded ? layout.gutter : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
