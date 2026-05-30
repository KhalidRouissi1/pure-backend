import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FontFamilies } from '../theme/fonts';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { getProductGridMetrics, getRailCardWidth } from '../utils/responsive';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onFavoriteToggle: (productId: string, isFavorited: boolean) => void;
  layout?: 'grid' | 'rail';
  cardWidth?: number;
}

export default function ProductCard({
  product,
  onPress,
  onFavoriteToggle,
  layout = 'grid',
  cardWidth,
}: ProductCardProps) {
  const { name, price, imageUrls, store, isFavorited } = product;
  const imageUrl = imageUrls?.[0];
  const { t } = useTranslation('common');
  const { width } = useWindowDimensions();
  const category = product.category || store?.category;
  const fallbackWidth = layout === 'rail' ? getRailCardWidth(width) : getProductGridMetrics(width).itemWidth;
  const resolvedCardWidth = cardWidth ?? fallbackWidth;

  return (
    <TouchableOpacity
      testID={`product-card-${product.id}`}
      style={[styles.container, { width: resolvedCardWidth }]}
      onPress={() => onPress(product)}
      activeOpacity={0.85}
    >
      <View style={[styles.imageContainer, { height: Math.max(126, resolvedCardWidth * 0.88) }]}>
        {imageUrl ? (
          <Image testID="product-image" source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(28,20,16,0.55)']}
          style={styles.imageGradient}
        />
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText} numberOfLines={1}>{category}</Text>
          </View>
        )}
        <TouchableOpacity
          testID={`favorite-button-${product.id}`}
          style={styles.favoriteButton}
          onPress={() => onFavoriteToggle(product.id, !(isFavorited || false))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            testID="heart-icon"
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={15}
            color={isFavorited ? '#E8456C' : colors.textSecondary}
          />
        </TouchableOpacity>
        <View style={styles.priceTag}>
          <Text style={styles.priceText} numberOfLines={1}>{t('sar')} {price}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
    borderWidth: 1,
    borderColor: '#E3E8DD',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#EEF4E8',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    height: '50%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    start: 10,
    maxWidth: '58%',
    backgroundColor: 'rgba(20,53,31,0.78)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  categoryText: {
    ...typography.badge,
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    end: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    end: 10,
    maxWidth: '72%',
    backgroundColor: '#0AAD0A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 12,
    color: colors.textLight,
    letterSpacing: 0.3,
  },
  info: {
    padding: 12,
    paddingBottom: 14,
  },
  name: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 3,
  },
  storeName: {
    fontFamily: FontFamilies.body,
    fontSize: 11,
    color: colors.textTertiary,
  },
});
