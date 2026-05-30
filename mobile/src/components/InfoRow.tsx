import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';

interface InfoRowProps {
  label: string;
  value?: string | null;
  locked?: boolean;
  onPress?: () => void;
}

export default function InfoRow({ label, value, locked, onPress }: InfoRowProps) {
  const Wrapper = onPress && !locked ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || '\u2014'}
        </Text>
        {locked ? (
          <Ionicons name="lock-closed" size={14} color={colors.textTertiary} />
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        ) : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 2,
    justifyContent: 'flex-end',
  },
  value: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  placeholder: {
    color: colors.textTertiary,
  },
});
