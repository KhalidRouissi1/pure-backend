import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import BackHeader from '../components/BackHeader';
import ProductCard from '../components/ProductCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '../types';
import { getStore, Store } from '../services/stores';
import { getProducts, toggleFavorite } from '../services/products';
import { getStoreReviews } from '../services/reviews';
import { useTranslation } from 'react-i18next';

export default function StoreDetail({ route, navigation }: any) {
  const { t } = useTranslation(['common', 'products', 'stores']);
  const insets = useSafeAreaInsets();
  const storeId = route.params?.id || route.params?.storeId || route.params?.store?.id;
  const [store, setStore] = useState<Store | null>(route.params?.store || null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState({ count: 0, averageRating: 0 });

  const load = useCallback(async () => {
    if (!storeId) return;
    try {
      const [storeData, productResponse, reviewData] = await Promise.all([
        getStore(storeId),
        getProducts({ storeId, limit: 20 }),
        getStoreReviews(storeId),
      ]);
      setStore(storeData);
      setProducts(Array.isArray(productResponse) ? productResponse : productResponse?.data?.items || productResponse?.data || []);
      setReviewSummary(reviewData.summary);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleFavoriteToggle = async (productId: string) => {
    await toggleFavorite(productId);
    load();
  };

  if (loading || !store) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const heroImage = store.galleryUrls?.[0] || store.logoUrl;

  return (
    <View style={styles.root}>
      <BackHeader title={store.name} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} />
          ) : (
            <LinearGradient colors={colors.gradient.hero} style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.62)']} style={StyleSheet.absoluteFill} />
          <View style={styles.heroContent}>
            <View style={styles.storeLogo}>
              {store.logoUrl ? <Image source={{ uri: store.logoUrl }} style={styles.logoImage} /> : <Ionicons name="leaf" size={34} color="#FFFFFF" />}
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
            <View style={styles.badges}>
              {store.trustedBadge && (
                <View style={styles.badge}>
                  <Ionicons name="leaf" size={14} color="#0AAD0A" />
                  <Text style={styles.badgeText}>{t('stores:trusted')}</Text>
                </View>
              )}
              {store.isVerified && (
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.badgeText}>{t('common:verified')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>{products.length}</Text><Text style={styles.statLabel}>{t('products:products')}</Text></View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Reviews', { storeId })}>
            <Text style={styles.statValue}>{reviewSummary.averageRating || store.averageRating || 0}</Text>
            <Text style={styles.statLabel}>{t('stores:rating')}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>{store.category}</Text><Text style={styles.statLabel}>{t('common:category')}</Text></View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('stores:store_story')}</Text>
          <View style={styles.sectionAccent} />
          <Text style={styles.description}>{store.description}</Text>
          {store.certificationStatus && (
            <Text style={styles.certification}>{t('stores:certification_status', { status: store.certificationStatus })}</Text>
          )}
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>{t('products:products_from_store')}</Text>
          <FlatList
            data={products}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={(product) => navigation.navigate('ProductDetail', { productId: product.id, product })}
                onFavoriteToggle={handleFavoriteToggle}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F2' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F2' },
  hero: { height: 260, position: 'relative', justifyContent: 'flex-end', overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroContent: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20 },
  storeLogo: { width: 76, height: 76, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  logoImage: { width: 76, height: 76 },
  storeName: { fontFamily: FontFamilies.extraBold, fontSize: 25, color: '#FFFFFF', textAlign: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontFamily: FontFamilies.semiBold, fontSize: 12, color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: -22, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E3E8DD' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: FontFamilies.bold, fontSize: 16, color: colors.text, textAlign: 'center' },
  statLabel: { fontFamily: FontFamilies.regular, fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#E3E8DD' },
  content: { padding: 20 },
  sectionTitle: { fontFamily: FontFamilies.bold, fontSize: 20, color: colors.text, marginBottom: 4 },
  sectionAccent: { width: 24, height: 3, backgroundColor: '#0AAD0A', borderRadius: 2, marginBottom: 12 },
  description: { fontFamily: FontFamilies.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
  certification: { fontFamily: FontFamilies.semiBold, color: '#0AAD0A', marginTop: 12 },
  productsSection: { marginTop: 6, marginBottom: 20, paddingStart: 20 },
  productList: { gap: 12, paddingEnd: 20 },
});
