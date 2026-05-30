import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  IconButton,
  Card,
  ProgressBar,
  Title,
  Paragraph,
  Button,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { uploadImagesToCloudinary } from '../services/images';

interface ImagePreview {
  uri: string;
  publicId?: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploaderProps {
  images: ImagePreview[];
  onChange: (images: ImagePreview[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation(['common', 'products']);

  const handlePickImages = async () => {
    if (images.length >= maxImages) {
      Alert.alert(t('common:error'), t('products:error_max_images_count', { max: maxImages }));
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages: ImagePreview[] = [];

        for (const asset of result.assets) {
          // Validate file size
          if (asset.fileSize && asset.fileSize > maxSizeMB * 1024 * 1024) {
            Alert.alert(
              t('common:error'),
              t('products:error_image_too_large', { name: asset.fileName, max: maxSizeMB })
            );
            continue;
          }

          // Validate file type
          if (!asset.mimeType?.startsWith('image/')) {
            Alert.alert(t('common:error'), t('products:error_images_only'));
            continue;
          }

          newImages.push({
            uri: asset.uri!,
            uploading: false,
          });
        }

        if (newImages.length > 0) {
          onChange([...images, ...newImages]);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('common:error'), t('products:error_pick_images'));
    }
  };

  const handleUpload = async () => {
    const unuploadedImages = images.filter(img => !img.publicId && !img.uploading);

    if (unuploadedImages.length === 0) {
      Alert.alert(t('products:info'), t('products:all_uploaded'));
      return;
    }

    setUploading(true);

    try {
      // Mark images as uploading
      const updatedImages = images.map(img =>
        img.publicId || img.uploading ? img : { ...img, uploading: true }
      );
      onChange(updatedImages);

      // Upload to Cloudinary
      const base64Images = unuploadedImages.map(img => img.uri);
      const uploadedUrls = await uploadImagesToCloudinary(base64Images);

      // Update images with public IDs
      const finalImages = updatedImages.map((img, index) => {
        if (img.uploading) {
          const urlIndex = unuploadedImages.indexOf(img);
          return {
            ...img,
            uri: uploadedUrls[urlIndex] || img.uri,
            publicId: uploadedUrls[urlIndex]?.split('/').pop() || undefined,
            uploading: false,
          };
        }
        return img;
      });

      onChange(finalImages);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(t('common:error'), t('products:error_upload'));

      const resetImages = images.map(img =>
        img.uploading ? { ...img, uploading: false, error: t('products:error_upload_failed') } : img
      );
      onChange(resetImages);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const renderImagePreview = (image: ImagePreview, index: number) => (
    <View key={index} style={styles.imageCard}>
      {image.uploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" />
          <ProgressBar indeterminate style={styles.progressBar} />
        </View>
      ) : image.error ? (
        <View style={styles.errorContainer}>
          <IconButton icon="alert-circle" size={32} iconColor="#f44336" />
          <Paragraph style={styles.errorText}>{image.error}</Paragraph>
        </View>
      ) : (
        <Image source={{ uri: image.uri }} style={styles.image} />
      )}

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(index)}
      >
        <IconButton
          icon="close"
          size={20}
          iconColor="#fff"
          style={styles.removeIcon}
        />
      </TouchableOpacity>

      {image.publicId && (
        <View style={styles.uploadedBadge}>
          <IconButton icon="check-circle" size={16} iconColor="#4CAF50" />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>{t('products:product_images')}</Title>
        <Paragraph style={styles.subtitle}>
          {t('products:image_count', { count: images.length, max: maxImages })}
        </Paragraph>
      </View>

      {images.length > 0 && (
        <View style={styles.previewGrid}>
          {images.map((image, index) => renderImagePreview(image, index))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {images.some(img => !img.publicId && !img.uploading) && (
          <Button
            mode="contained"
            icon="cloud-upload"
            onPress={handleUpload}
            disabled={uploading}
            loading={uploading}
            style={styles.uploadButton}
          >
            {uploading ? t('products:uploading') : t('products:upload_all')}
          </Button>
        )}

        <Button
          mode="outlined"
          icon="camera"
          onPress={handlePickImages}
          disabled={images.length >= maxImages || uploading}
          style={styles.addButton}
        >
          {images.length >= maxImages ? t('products:max_limit_reached') : t('products:add_images')}
        </Button>
      </View>

      {images.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <IconButton
              icon="image-multiple"
              size={48}
              iconColor="#bdbdbd"
            />
            <Title style={styles.emptyTitle}>{t('products:no_images_selected')}</Title>
            <Paragraph style={styles.emptyText}>
              {t('products:add_images_description')}
            </Paragraph>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  imageCard: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    marginTop: 12,
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  removeIcon: {
    margin: 0,
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    gap: 8,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  addButton: {
    borderColor: '#4CAF50',
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});
