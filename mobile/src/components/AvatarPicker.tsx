import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Role } from '../types';
import { uploadImages } from '../services/images';
import { useTranslation } from 'react-i18next';

interface AvatarPickerProps {
  name?: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  onAvatarChange: (url: string) => void;
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

export default function AvatarPicker({ name, email, avatarUrl, role, onAvatarChange }: AvatarPickerProps) {
  const { t } = useTranslation('profile');
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 4 * 1024 * 1024) {
        Alert.alert(t('errors.uploadFailed'), 'Image must be under 4MB');
        return;
      }

      if (!asset.base64) {
        Alert.alert(t('errors.uploadFailed'));
        return;
      }

      setUploading(true);
      const dataUrl = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      const urls = await uploadImages([dataUrl]);
      if (urls?.[0]) {
        onAvatarChange(urls[0]);
      }
    } catch (err) {
      Alert.alert(t('errors.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePickImage} disabled={uploading} activeOpacity={0.7}>
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.initialsCircle, { backgroundColor: roleColors[role] || colors.primary }]}>
              <Text style={styles.initialsText}>{getInitials(name, email)}</Text>
            </View>
          )}
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color={colors.textLight} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={12} color={colors.textLight} />
          </View>
        </View>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{name || email}</Text>
          <Text style={styles.changePhoto}>{t('avatar.change')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginHorizontal: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  initialsCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: FontFamilies.display,
    fontSize: 26,
    color: colors.textLight,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  changePhoto: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
  },
});
