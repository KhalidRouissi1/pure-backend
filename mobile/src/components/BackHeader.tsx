import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export default function BackHeader({ title, subtitle, rightAction }: BackHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View
        style={[styles.row, { paddingHorizontal: layout.gutter, maxWidth: layout.maxContentWidth }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          testID="back-button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    paddingBottom: 8,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  titleContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    fontFamily: FontFamilies.extraBold,
    fontSize: 20,
    color: colors.text,
    writingDirection: 'auto',
  },
  subtitle: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 1,
    writingDirection: 'auto',
  },
  rightAction: {
    marginStart: 8,
  },
});
