import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useTranslation } from 'react-i18next';

interface EditInfoModalProps {
  visible: boolean;
  label: string;
  value: string;
  saving: boolean;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  fieldKey?: string;
}

export default function EditInfoModal({
  visible,
  label,
  value,
  saving,
  onSave,
  onCancel,
  fieldKey,
}: EditInfoModalProps) {
  const { t } = useTranslation('profile');
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    const trimmed = localValue.trim();
    onSave(trimmed);
  };

  const getPlaceholder = () => {
    if (fieldKey === 'name') return t('editModal.placeholder.name');
    if (fieldKey === 'city') return t('editModal.placeholder.city');
    if (fieldKey === 'phone') return t('editModal.placeholder.phone');
    return '';
  };

  const getKeyboardType = () => {
    if (fieldKey === 'phone') return 'phone-pad';
    return 'default';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>{t('editModal.title', { field: label })}</Text>

        <TextInput
          style={styles.input}
          value={localValue}
          onChangeText={setLocalValue}
          placeholder={getPlaceholder()}
          keyboardType={getKeyboardType()}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={saving}>
            <Text style={styles.cancelText}>{t('editModal.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveText}>{saving ? '...' : t('editModal.save')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 680,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h5,
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    ...typography.body1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.h6,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveText: {
    ...typography.h6,
    color: colors.textOnPrimary,
  },
});
