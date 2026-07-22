import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  ActivityIndicator,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import BackHeader from '../components/BackHeader';
import SaudiRiyalSymbol from '../components/SaudiRiyalSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Product, Role } from '../types';
import { getProductDetail, toggleFavorite } from '../services/products';
import { addToCart } from '../services/cart';
import { useAuth } from '../hooks/useAuth';
import { clamp } from '../utils/responsive';
import AdaptiveSplitLayout from '../components/layout/AdaptiveSplitLayout';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function ProductDetail({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isWide } = useResponsiveLayout();
  const mediaHeight = clamp(width * (isWide ? 0.42 : 0.65), 220, isWide ? 560 : 420);
  const { t } = useTranslation(['products', 'common']);
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const productId = route.params?.id || route.params?.productId;
  const passedProduct = route.params?.product || route.params?.productData;

  const [product, setProduct] = useState<Product | null>(passedProduct || null);
  const [loading, setLoading] = useState(!passedProduct);
  const [isFavorited, setIsFavorited] = useState(passedProduct?.isFavorited || false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (passedProduct) return;
    const fetchProduct = async () => {
      try {
        const product = await getProductDetail(productId);
        setProduct(product);
      } catch (e) {
        console.error('Failed to load product:', e);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleWhatsApp = () => {
    const phone = product?.store?.whatsappNumber;
    if (!phone) {
      Alert.alert(t('common:error'), t('products:noWhatsappNumber'));
      return;
    }
    const productName = product?.name || `#${productId}`;
    const price = product?.price || '';
    const message = encodeURIComponent(t('products:whatsappMessage', { name: productName, price }));
    const url = `https://wa.me/${phone}?text=${message}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common:error'), t('products:errorOpenWhatsapp'));
    });
  };

  const handleFavoriteToggle = async () => {
    try {
      await toggleFavorite(productId);
      setIsFavorited((prev: boolean) => !prev);
    } catch (e) {
      console.error('Favorite toggle error:', e);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: product?.name || t('products:shareTitle'),
        message: `${t('products:shareMessage')} ${product?.name}`,
      });
    } catch {}
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(productId, quantity);
      Alert.alert(
        t('products:added_to_cart'),
        t('products:added_to_cart_message'),
        [
          {
            text: t('products:continue_shopping'),
            style: 'cancel',
          },
          {
            text: t('products:view_cart'),
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch {
      Alert.alert(t('common:error'), t('products:could_not_add_cart'));
    } finally {
      setAdding(false);
    }
  };

  const handleVisitStore = () => {
    if (product?.store?.id) {
      (navigation as any).navigate('StoreDetail', {
        storeId: product.store.id,
        store: product.store,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <BackHeader title={t('common:product')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.root}>
        <BackHeader title={t('common:product')} />
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>{t('common:no_products')}</Text>
        </View>
      </View>
    );
  }

  const imageUrl = product.imageUrls?.[0];
  const store = product.store;
  const originLatitude = product.originLatitude ?? store?.latitude;
  const originLongitude = product.originLongitude ?? store?.longitude;
  const originAddress =
    product.originAddressText || store?.addressText || store?.city || product.originCity;
  const hasOriginMap = typeof originLatitude === 'number' && typeof originLongitude === 'number';

  const openOriginMaps = () => {
    if (!hasOriginMap) return;
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${originLatitude},${originLongitude}`
    );
  };

  return (
    <View style={styles.root}>
      <BackHeader title={product.name} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <AdaptiveSplitLayout
          primary={
            <View style={isWide && styles.mediaPane}>
              {imageUrl ? (
                <View style={styles.imageContainer} testID="image-gallery">
                  <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { height: mediaHeight }]}
                  />
                  <LinearGradient
                    colors={['transparent', colors.background]}
                    style={styles.imageGradient}
                  />
                </View>
              ) : (
                <View style={[styles.imagePlaceholder, { height: mediaHeight }]}>
                  <Ionicons name="image-outline" size={56} color={colors.textTertiary} />
                  <Text style={styles.imagePlaceholderText}>{t('products:noImages')}</Text>
                </View>
              )}
            </View>
          }
          secondary={
            <View style={styles.content}>
              <View style={styles.priceRow}>
                <View style={styles.priceValue}>
                  <SaudiRiyalSymbol size={22} color={colors.primaryDark} />
                  <Text style={styles.price}>{product.price}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                    testID="share-button"
                  >
                    <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleFavoriteToggle}
                    activeOpacity={0.7}
                    testID="favorite-button"
                  >
                    <Ionicons
                      name={isFavorited ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isFavorited ? '#E8456C' : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.productName}>{product.name}</Text>

              {product.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>
              )}

              {store && (
                <TouchableOpacity
                  style={styles.storeCard}
                  onPress={handleVisitStore}
                  activeOpacity={0.7}
                >
                  <View style={styles.storeAvatar}>
                    {store.logoUrl ? (
                      <Image source={{ uri: store.logoUrl }} style={styles.storeAvatarImage} />
                    ) : (
                      <Ionicons name="storefront" size={20} color={colors.secondary} />
                    )}
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={styles.storeMetaRow}>
                      {(store as any).isVerified && (
                        <View style={styles.verifiedBadge} testID="verified-badge">
                          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                          <Text style={styles.verifiedText}>{t('common:verified')}</Text>
                        </View>
                      )}
                      {(store as any).trustedBadge && (
                        <View style={styles.trustedBadge}>
                          <Ionicons name="leaf" size={13} color="#0AAD0A" />
                          <Text style={styles.trustedText}>{t('products:trusted')}</Text>
                        </View>
                      )}
                      {store.category && <Text style={styles.storeMeta}>{store.category}</Text>}
                    </View>
                  </View>
                  <View style={styles.storeFollow}>
                    <Text style={styles.storeFollowText}>{t('products:visit_store')}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {product.description ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('products:description_section')}</Text>
                    <Text style={styles.description}>{product.description}</Text>
                  </View>
                </>
              ) : null}

              {hasOriginMap || originAddress ? (
                <View style={styles.originSection}>
                  <View style={styles.originHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>{t('products:product_origin')}</Text>
                      <Text style={styles.originText} numberOfLines={2}>
                        {originAddress || product.originCity || t('common:saudi_arabia')}
                      </Text>
                    </View>
                    {hasOriginMap ? (
                      <TouchableOpacity style={styles.directionsButton} onPress={openOriginMaps}>
                        <Ionicons name="navigate-outline" size={16} color="#0AAD0A" />
                        <Text style={styles.directionsText}>{t('products:open')}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {hasOriginMap ? (
                    <MapView
                      style={styles.originMap}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      region={{
                        latitude: originLatitude,
                        longitude: originLongitude,
                        latitudeDelta: 0.08,
                        longitudeDelta: 0.08,
                      }}
                    >
                      <Marker
                        coordinate={{ latitude: originLatitude, longitude: originLongitude }}
                      />
                    </MapView>
                  ) : null}
                </View>
              ) : null}

              {!isAdmin && <View style={styles.purchasePanel}>
                <View>
                  <Text style={styles.sectionTitle}>{t('products:quantity')}</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepButton}
                      onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                    >
                      <Ionicons name="remove" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepButton}
                      onPress={() => setQuantity((value) => value + 1)}
                    >
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={handleAddToCart}
                  disabled={adding}
                >
                  <Ionicons name="basket-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.cartButtonText}>
                    {adding ? t('products:adding') : t('products:add_to_cart')}
                  </Text>
                </TouchableOpacity>
              </View>}

              <TouchableOpacity
                style={styles.reviewsButton}
                onPress={() => navigation.navigate('Reviews', { productId })}
              >
                <View>
                  <Text style={styles.sectionTitle}>{t('products:reviews')}</Text>
                  <Text style={styles.reviewSummary}>
                    {t('products:review_summary', {
                      rating: product.averageRating || 0,
                      count: product.reviewCount || 0,
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>

              {!isAdmin && <TouchableOpacity
                style={styles.whatsappButton}
                onPress={handleWhatsApp}
                activeOpacity={0.7}
                testID="whatsapp-button"
              >
                <LinearGradient
                  colors={['#25D366', '#128C7E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.whatsappGradient}
                >
                  <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                  <Text style={styles.whatsappText}>{t('products:orderOnWhatsApp')}</Text>
                </LinearGradient>
              </TouchableOpacity>}
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    fontFamily: FontFamilies.regular,
    fontSize: 15,
    color: colors.textTertiary,
    marginTop: 12,
  },
  imageContainer: { width: '100%', position: 'relative' },
  image: { width: '100%', resizeMode: 'cover' },
  imageGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 },
  imagePlaceholder: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
  },
  mediaPane: { justifyContent: 'center', padding: 24 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  priceValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    direction: 'ltr',
  },
  price: {
    fontFamily: FontFamilies.bold,
    fontSize: 30,
    color: colors.primaryDark,
    writingDirection: 'ltr',
  },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productName: {
    fontFamily: FontFamilies.bold,
    fontSize: 22,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  categoryText: { fontFamily: FontFamilies.semiBold, fontSize: 13, color: colors.primary },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  storeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.secondarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storeAvatarImage: { width: 44, height: 44, borderRadius: 14 },
  storeInfo: { flex: 1, marginLeft: 12, overflow: 'hidden' },
  storeName: { fontFamily: FontFamilies.semiBold, fontSize: 15, color: colors.text },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  storeMeta: { fontFamily: FontFamilies.regular, fontSize: 12, color: colors.textSecondary },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontFamily: FontFamilies.semiBold, fontSize: 11, color: colors.success },
  trustedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trustedText: { fontFamily: FontFamilies.semiBold, fontSize: 11, color: '#0AAD0A' },
  storeFollow: {
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  storeFollowText: { fontFamily: FontFamilies.bold, fontSize: 13, color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: FontFamilies.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontFamily: FontFamilies.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  originSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  originHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  originText: { fontFamily: FontFamilies.regular, color: colors.textSecondary, lineHeight: 20 },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFE7BF',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  directionsText: { fontFamily: FontFamilies.bold, color: '#0AAD0A', fontSize: 12 },
  originMap: { height: 190, borderRadius: 14 },
  whatsappButton: { borderRadius: 16, height: 56, overflow: 'hidden', marginTop: 8 },
  whatsappGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
  },
  whatsappText: { fontFamily: FontFamilies.bold, fontSize: 15, color: '#FFFFFF' },
  purchasePanel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.secondarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
    fontFamily: FontFamilies.bold,
    fontSize: 16,
    color: colors.text,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0AAD0A',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 48,
    flexGrow: 1,
  },
  cartButtonText: { fontFamily: FontFamilies.bold, color: '#FFFFFF' },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  reviewSummary: { fontFamily: FontFamilies.regular, color: colors.textSecondary, marginTop: 3 },
});
