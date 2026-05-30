import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useTranslation } from 'react-i18next';
import { Role } from '../types';

interface ProfileHeaderProps {
  name?: string;
  email: string;
  avatarUrl?: string;
  role: Role;
}

const roleColors: Record<string, string> = {
  [Role.ADMIN]: colors.accent,
  [Role.SELLER]: colors.secondary,
  [Role.USER]: colors.primary,
};

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
  return email ? email.substring(0, 2).toUpperCase() : '??';
}

export default function ProfileHeader({ name, email, avatarUrl, role }: ProfileHeaderProps) {
  const { t } = useTranslation('profile');

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.initialsCircle, { backgroundColor: roleColors[role] || colors.primary }]}>
            <Text style={styles.initialsText}>{getInitials(name, email)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.name}>{name || email}</Text>
      <View style={[styles.roleBadge, { backgroundColor: roleColors[role] || colors.primary }]}>
        <Text style={styles.roleText}>{t(`roleBadge.${role}`)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  initialsCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: FontFamilies.display,
    fontSize: 32,
    color: colors.textLight,
  },
  name: {
    fontFamily: FontFamilies.display,
    fontSize: 22,
    color: colors.text,
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roleText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 10,
    color: colors.textLight,
    letterSpacing: 0.8,
  },
});
