import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Title, Paragraph, Chip, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { createStore, CreateStoreData } from '../services/stores';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category, CategoryLabels } from '../types';
import SaudiLocationPicker from '../components/SaudiLocationPicker';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { MAX_FORM_WIDTH } from '../utils/responsive';

export default function CreateStore() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { t } = useTranslation(['common', 'stores', 'products']);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: Category.FRUITS_VEGETABLES,
    addressText: '',
    city: '',
    latitude: '',
    longitude: '',
    whatsappNumber: '',
    instagramHandle: '',
    certificationUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = Object.values(Category).map((value) => ({
    label: CategoryLabels[value],
    value,
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('stores:error_name_required');
    } else if (formData.name.length < 3) {
      newErrors.name = t('stores:error_name_min_length');
    } else if (formData.name.length > 100) {
      newErrors.name = t('stores:error_name_max_length');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('products:error_description_required');
    } else if (formData.description.length < 10) {
      newErrors.description = t('products:error_description_min_length');
    } else if (formData.description.length > 500) {
      newErrors.description = t('stores:error_description_max_length');
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = t('stores:error_whatsapp_required');
    } else if (formData.whatsappNumber.replace(/\D/g, '').length < 9) {
      newErrors.whatsappNumber = t('stores:error_whatsapp_invalid');
    }

    if (formData.instagramHandle && formData.instagramHandle.startsWith('@')) {
      newErrors.instagramHandle = t('stores:error_instagram_no_at');
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Select the Saudi city for this farm.';
    }

    if (formData.latitude) {
      const latitude = Number(formData.latitude);
      if (Number.isNaN(latitude) || latitude < 16 || latitude > 32) {
        newErrors.latitude = 'Latitude must be inside Saudi Arabia.';
      }
    }

    if (formData.longitude) {
      const longitude = Number(formData.longitude);
      if (Number.isNaN(longitude) || longitude < 34 || longitude > 56) {
        newErrors.longitude = 'Longitude must be inside Saudi Arabia.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const rawNumber = formData.whatsappNumber.replace(/\D/g, '');
      const formattedNumber = rawNumber.startsWith('966') ? rawNumber : `966${rawNumber}`;

      const data: CreateStoreData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        addressText: formData.addressText.trim(),
        city: formData.city.trim(),
        whatsappNumber: formattedNumber,
      };

      if (formData.latitude && formData.longitude) {
        data.latitude = Number(formData.latitude);
        data.longitude = Number(formData.longitude);
      }

      if (formData.instagramHandle.trim()) {
        data.instagramHandle = formData.instagramHandle.trim();
      }

      if (formData.certificationUrl.trim()) {
        data.certificationUrl = formData.certificationUrl.trim();
      }

      await createStore(data);

      Alert.alert(t('common:success'), t('stores:created_successfully'), [
        {
          text: t('common:ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(t('common:error'), t('stores:error_create'));
      console.error('Create store error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <BackHeader title={t('stores:create_title')} subtitle={t('stores:create_subtitle')} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: layout.gutter,
            maxWidth: MAX_FORM_WIDTH,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label={`${t('stores:store_name')} *`}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          error={!!errors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label={`${t('products:description')} *`}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          mode="outlined"
          multiline
          numberOfLines={4}
          error={!!errors.description}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description}
        </HelperText>

        <View style={styles.categorySection}>
          <Paragraph style={styles.label}>{t('common:category')} *</Paragraph>
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <Chip
                key={cat.value}
                selected={formData.category === cat.value}
                onPress={() => setFormData({ ...formData, category: cat.value as any })}
                style={styles.chip}
              >
                {cat.label}
              </Chip>
            ))}
          </View>
        </View>

        <SaudiLocationPicker
          city={formData.city}
          addressText={formData.addressText}
          latitude={formData.latitude}
          longitude={formData.longitude}
          errors={{
            city: errors.city,
            latitude: errors.latitude,
            longitude: errors.longitude,
          }}
          onChange={(location) =>
            setFormData({
              ...formData,
              city: location.city,
              addressText: location.addressText ?? formData.addressText,
              latitude: location.latitude ?? formData.latitude,
              longitude: location.longitude ?? formData.longitude,
            })
          }
        />

        <TextInput
          label={`${t('stores:whatsapp_number')} * (+966)`}
          value={formData.whatsappNumber}
          onChangeText={(text) =>
            setFormData({ ...formData, whatsappNumber: text.replace(/[^0-9]/g, '') })
          }
          mode="outlined"
          keyboardType="phone-pad"
          error={!!errors.whatsappNumber}
          style={styles.input}
          placeholder="5XXXXXXXX"
          left={<TextInput.Affix text="+966" />}
        />
        <HelperText type="error" visible={!!errors.whatsappNumber}>
          {errors.whatsappNumber}
        </HelperText>

        <TextInput
          label={`${t('stores:instagram_handle')} (${t('stores:optional')})`}
          value={formData.instagramHandle}
          onChangeText={(text) => setFormData({ ...formData, instagramHandle: text })}
          mode="outlined"
          autoCapitalize="none"
          error={!!errors.instagramHandle}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.instagramHandle}>
          {errors.instagramHandle}
        </HelperText>

        <TextInput
          label={`Organic certification URL (${t('stores:optional')})`}
          value={formData.certificationUrl}
          onChangeText={(text) => setFormData({ ...formData, certificationUrl: text })}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="url"
          style={styles.input}
          placeholder="https://..."
        />
        <HelperText type="info" visible>
          Sellers with approved certificates receive a Trusted Badge.
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={submitting}
          loading={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {submitting ? t('stores:creating') : t('stores:create_title')}
        </Button>

        {submitting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Paragraph style={styles.loadingText}>{t('stores:creating_store')}</Paragraph>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  input: {
    marginBottom: 4,
    backgroundColor: colors.surface,
  },
  categorySection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  submitButton: {
    marginBottom: 12,
    backgroundColor: colors.secondary,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
  },
});
