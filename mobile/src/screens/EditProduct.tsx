import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Title, Paragraph, Chip, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { uploadImagesToCloudinary } from '../services/images';
import { getProductDetail, updateProduct, Product } from '../services/products';
import { getSellerStores, StoreWithStats } from '../services/stores';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category, CategoryLabels } from '../types';
import SaudiLocationPicker from '../components/SaudiLocationPicker';

interface ImagePreview {
  uri: string;
  isNew?: boolean;
}

export default function EditProduct() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'products']);
  const params = (route.params ?? {}) as { productId: string; id: string };
  const productId = params.productId || params.id;

  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [stores, setStores] = useState<StoreWithStats[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
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

  const categories = Object.values(Category).map((value) => ({ label: CategoryLabels[value], value }));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storesData, productResponse] = await Promise.all([
          getSellerStores(),
          getProductDetail(productId),
        ]);

        setStores(storesData);
        
        const product: Product = productResponse as any;
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category as Category,
            originAddressText: product.originAddressText || '',
            originCity: product.originCity || '',
            originLatitude: product.originLatitude ? String(product.originLatitude) : '',
            originLongitude: product.originLongitude ? String(product.originLongitude) : '',
          });
          setSelectedStoreId(product.storeId);
          setSelectedImages(product.imageUrls.map(url => ({ uri: url, isNew: false })));
        }
      } catch (error) {
        console.error('Load product data error:', error);
        Alert.alert(t('common:error'), 'Failed to load product details');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handlePickImages = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.slice(0, 5 - selectedImages.length).map((asset) => ({
          uri: asset.uri!,
          isNew: true,
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
    }

    if (!formData.description.trim()) {
      newErrors.description = t('products:error_description_required');
    }

    if (!formData.price) {
      newErrors.price = t('products:error_price_required');
    }

    if (!selectedStoreId) {
      newErrors.store = 'Select the farm/store.';
    }

    if (!formData.originCity.trim()) {
      newErrors.originCity = 'Select where this product comes from.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploading(true);
    setSubmitting(true);

    try {
      // Separate existing and new images
      const existingUrls = selectedImages.filter(img => !img.isNew).map(img => img.uri);
      const newImages = selectedImages.filter(img => img.isNew).map(img => img.uri);
      
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadImagesToCloudinary(newImages);
      }

      const allImageUrls = [...existingUrls, ...uploadedUrls];

      await updateProduct(productId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrls: allImageUrls,
        storeId: selectedStoreId,
        originAddressText: formData.originAddressText.trim(),
        originCity: formData.originCity.trim(),
        originLatitude: formData.originLatitude ? Number(formData.originLatitude) : undefined,
        originLongitude: formData.originLongitude ? Number(formData.originLongitude) : undefined,
      });

      Alert.alert(t('common:success'), t('products:updated_successfully'), [
        { text: t('common:ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t('common:error'), t('products:error_update'));
      console.error('Update product error:', error);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BackHeader title={t('products:edit_title')} subtitle={formData.name} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          label={`${t('products:product_name')} *`}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          error={!!errors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

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
        <HelperText type="error" visible={!!errors.description}>{errors.description}</HelperText>

        <TextInput
          label={`${t('common:price')} (${t('common:sar')}) *`}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          mode="outlined"
          keyboardType="decimal-pad"
          error={!!errors.price}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.price}>{errors.price}</HelperText>

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
          <Button
            mode="outlined"
            icon="camera"
            onPress={handlePickImages}
            disabled={selectedImages.length >= 5 || uploading}
            style={styles.uploadButton}
          >
            {uploading ? t('products:uploading') : t('products:upload_images')}
          </Button>

          <View style={styles.previewContainer}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <View style={styles.imagePlaceholder}>
                  <Paragraph style={styles.imagePlaceholderText}>Image {index + 1}</Paragraph>
                </View>
                <Button mode="contained" icon="close" onPress={() => handleRemoveImage(index)} style={styles.removeButton}>
                  {t('common:delete')}
                </Button>
              </View>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={uploading || submitting}
          loading={submitting}
          style={styles.submitButton}
        >
          {t('products:edit_title')}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loadingRoot: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  content: { padding: 20 },
  input: { marginBottom: 4, backgroundColor: colors.surface },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 12, color: colors.text },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginRight: 8, marginBottom: 8 },
  categorySection: { marginBottom: 24 },
  imagesSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  uploadButton: { marginBottom: 16 },
  previewContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  imagePreviewWrapper: { width: '48%', marginRight: '2%', marginBottom: 12 },
  imagePlaceholder: { height: 120, backgroundColor: colors.backgroundSecondary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imagePlaceholderText: { color: colors.textSecondary },
  removeButton: { backgroundColor: '#f44336' },
  submitButton: { backgroundColor: colors.secondary, marginTop: 24 },
});
