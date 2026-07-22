import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Title, Paragraph, Chip, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { uploadImages } from '../services/images';
import { createProduct } from '../services/products';
import { getSellerStores, StoreWithStats } from '../services/stores';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category, CategoryLabels } from '../types';
import SaudiLocationPicker from '../components/SaudiLocationPicker';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { MAX_FORM_WIDTH } from '../utils/responsive';

interface ImagePreview {
  uri: string;
  dataUrl: string;
}

export default function CreateProduct() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { t } = useTranslation(['common', 'products']);
  const params = (route.params ?? {}) as { storeId?: string };
  const { storeId } = params;
  const [selectedStoreId, setSelectedStoreId] = useState(storeId || '');
  const [stores, setStores] = useState<StoreWithStats[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inventoryQuantity: '',
    category: Category.FRUITS_VEGETABLES,
    originAddressText: '',
    originCity: '',
    originLatitude: '',
    originLongitude: '',
  });

  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = Object.values(Category).map((value) => ({
    label: CategoryLabels[value],
    value,
  }));
  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId),
    [selectedStoreId, stores]
  );

  const applyStoreOrigin = (store?: StoreWithStats) => {
    if (!store) return;
    setFormData((current) => ({
      ...current,
      originAddressText: current.originAddressText || store.addressText || store.city || '',
      originCity: current.originCity || store.city || '',
      originLatitude: current.originLatitude || (store.latitude ? String(store.latitude) : ''),
      originLongitude: current.originLongitude || (store.longitude ? String(store.longitude) : ''),
    }));
  };

  useEffect(() => {
    let active = true;

    getSellerStores().then((items) => {
      if (!active) return;
      setStores(items);
      if (!selectedStoreId && items.length === 1) {
        setSelectedStoreId(items[0].id);
        applyStoreOrigin(items[0]);
      } else {
        applyStoreOrigin(items.find((store) => store.id === selectedStoreId));
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handlePickImages = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets
          .slice(0, 5 - selectedImages.length)
          .filter((asset) => asset.base64)
          .map((asset) => ({
            uri: asset.uri,
            dataUrl: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
          }));

        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert(t('common:error'), t('products:error_pick_images'));
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('products:error_name_required');
    } else if (formData.name.length < 3) {
      newErrors.name = t('products:error_name_min_length');
    } else if (formData.name.length > 200) {
      newErrors.name = t('products:error_name_max_length');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('products:error_description_required');
    } else if (formData.description.length < 10) {
      newErrors.description = t('products:error_description_min_length');
    } else if (formData.description.length > 1000) {
      newErrors.description = t('products:error_description_max_length');
    }

    if (!formData.price) {
      newErrors.price = t('products:error_price_required');
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = t('products:error_price_positive');
      } else if (priceNum > 999999.99) {
        newErrors.price = t('products:error_price_max');
      }
    }

    const inventoryQuantity = Number(formData.inventoryQuantity);
    if (
      !formData.inventoryQuantity.trim() ||
      !Number.isInteger(inventoryQuantity) ||
      inventoryQuantity < 0 ||
      inventoryQuantity > 999999
    ) {
      newErrors.inventoryQuantity = t('products:error_inventory');
    }

    if (selectedImages.length > 5) {
      newErrors.images = t('products:error_max_images');
    }

    if (!selectedStoreId) {
      newErrors.store = 'Select the farm/store where this product is sold.';
    }

    if (!formData.originCity.trim()) {
      newErrors.originCity = 'Select where this product comes from.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      let uploadedUrls: string[] = [];
      if (selectedImages.length > 0) {
        const base64Images = selectedImages.map((img) => img.dataUrl);
        uploadedUrls = await uploadImages(base64Images);
      }

      setSubmitting(true);
      await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        inventoryQuantity: Number(formData.inventoryQuantity),
        category: formData.category,
        imageUrls: uploadedUrls,
        storeId: selectedStoreId,
        originAddressText: formData.originAddressText.trim(),
        originCity: formData.originCity.trim(),
        originLatitude: formData.originLatitude ? Number(formData.originLatitude) : undefined,
        originLongitude: formData.originLongitude ? Number(formData.originLongitude) : undefined,
      });

      Alert.alert(t('common:success'), t('products:created_successfully'), [
        {
          text: t('common:ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(t('common:error'), t('products:error_create'));
      console.error('Create product error:', error);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <BackHeader title={t('products:create_title')} subtitle={t('products:create_subtitle')} />
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
          label={`${t('products:product_name')} *`}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          placeholder={t('products:product_name')}
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
          placeholder={t('products:description')}
          multiline
          numberOfLines={4}
          error={!!errors.description}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description}
        </HelperText>

        <TextInput
          label={`${t('common:price')} (${t('common:sar')}) *`}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          mode="outlined"
          placeholder={t('products:price_placeholder', { currency: t('common:sar') })}
          keyboardType="decimal-pad"
          error={!!errors.price}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.price}>
          {errors.price}
        </HelperText>

        <TextInput
          label={`${t('products:inventory_quantity')} *`}
          value={formData.inventoryQuantity}
          onChangeText={(text) =>
            setFormData({ ...formData, inventoryQuantity: text.replace(/[^0-9]/g, '') })
          }
          mode="outlined"
          placeholder={t('products:inventory_placeholder')}
          keyboardType="number-pad"
          error={!!errors.inventoryQuantity}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.inventoryQuantity}>
          {errors.inventoryQuantity}
        </HelperText>

        <View style={styles.storeSection}>
          <Paragraph style={styles.label}>{t('products:farm_store_location')} *</Paragraph>
          <View style={styles.categoriesContainer}>
            {stores.map((store) => (
              <Chip
                key={store.id}
                selected={selectedStoreId === store.id}
                onPress={() => {
                  setSelectedStoreId(store.id);
                  setFormData((current) => ({
                    ...current,
                    originAddressText: store.addressText || store.city || '',
                    originCity: store.city || '',
                    originLatitude: store.latitude ? String(store.latitude) : '',
                    originLongitude: store.longitude ? String(store.longitude) : '',
                  }));
                }}
                style={styles.chip}
              >
                {store.city ? `${store.name} - ${store.city}` : store.name}
              </Chip>
            ))}
          </View>
          {selectedStore ? (
            <View style={styles.locationNote}>
              <Paragraph style={styles.locationTitle}>
                {selectedStore.city || t('common:saudi_arabia')}
              </Paragraph>
              <Paragraph style={styles.locationText}>
                {t('products:selected_store_location_note')}
              </Paragraph>
            </View>
          ) : null}
          <HelperText type="error" visible={!!errors.store}>
            {errors.store}
          </HelperText>
        </View>

        <SaudiLocationPicker
          city={formData.originCity}
          addressText={formData.originAddressText}
          latitude={formData.originLatitude}
          longitude={formData.originLongitude}
          errors={{
            city: errors.originCity,
            latitude: errors.originLatitude,
            longitude: errors.originLongitude,
          }}
          onChange={(location) =>
            setFormData({
              ...formData,
              originCity: location.city,
              originAddressText: location.addressText ?? formData.originAddressText,
              originLatitude: location.latitude ?? formData.originLatitude,
              originLongitude: location.longitude ?? formData.originLongitude,
            })
          }
        />

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

        <View style={styles.imagesSection}>
          <Title style={styles.sectionTitle}>{t('products:product_images')}</Title>
          <Paragraph style={styles.sectionSubtitle}>
            {t('products:image_count', { count: selectedImages.length, max: 5 })}
          </Paragraph>

          <Button
            mode="outlined"
            icon="camera"
            onPress={handlePickImages}
            disabled={selectedImages.length >= 5 || uploading}
            style={styles.uploadButton}
          >
            {uploading ? t('products:uploading') : t('products:upload_images')}
          </Button>

          <HelperText type="error" visible={!!errors.images}>
            {errors.images}
          </HelperText>

          {selectedImages.length > 0 && (
            <View style={styles.previewContainer}>
              {selectedImages.map((image, index) => (
                <View
                  key={index}
                  style={styles.imagePreviewWrapper}
                  testID={`image-preview-${index}`}
                >
                  <View style={styles.imagePlaceholder}>
                    <Paragraph style={styles.imagePlaceholderText}>
                      {t('products:product_image')} {index + 1}
                    </Paragraph>
                  </View>
                  <Button
                    mode="contained"
                    icon="close"
                    onPress={() => handleRemoveImage(index)}
                    style={styles.removeButton}
                    contentStyle={styles.removeButtonContent}
                    testID={`remove-image-${index}`}
                  >
                    {t('common:delete')}
                  </Button>
                </View>
              ))}
            </View>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={uploading || submitting}
          loading={submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          testID={submitting ? 'submitting-indicator' : 'submit-product-button'}
        >
          {submitting ? t('products:creating') : t('products:create_title')}
        </Button>

        {uploading && (
          <View style={styles.loadingContainer} testID="uploading-indicator">
            <ActivityIndicator size="large" />
            <Paragraph style={styles.loadingText}>{t('products:uploading_images')}</Paragraph>
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
  storeSection: {
    marginBottom: 20,
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
  locationNote: {
    backgroundColor: '#F6F8F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E8D8',
    marginTop: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  imagesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  uploadButton: {
    marginBottom: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imagePreviewWrapper: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    color: colors.textSecondary,
  },
  removeButton: {
    backgroundColor: '#f44336',
  },
  removeButtonContent: {
    paddingVertical: 4,
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
