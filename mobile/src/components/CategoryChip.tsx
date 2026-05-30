import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Category } from '../types';

interface CategoryChipProps {
  category: Category;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginEnd: 8,
  },
  chipSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  label: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
