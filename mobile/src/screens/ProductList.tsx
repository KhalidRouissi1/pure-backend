import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import BackHeader from '../components/BackHeader';
import ProductCard from '../components/ProductCard';
import { getProducts, Product, toggleFavorite } from '../services/products';
import { getStores, Store } from '../services/stores';

type ListMode = 'products' | 'stores';

export default function ProductList({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'products', 'stores']);
  const storeId = route.params?.storeId;
  const mode: ListMode = route.params?.mode || 'products';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const load = useCallback(async () => {
    try {
      if (mode === 'stores') {
        const data = await getStores({ verified: true, limit: 50 });
        setStores(data || []);
      } else {
        const data = await getProducts({ storeId, limit: 50 });
        setProducts(data || []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, storeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((store) => [store.name, store.city, store.category].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [query, stores]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => [product.name, product.description, product.category, product.store?.name].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [query, products]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleFavoriteToggle = async (productId: string, isFavorited: boolean) => {
    await toggleFavorite(productId, isFavorited ? 'remove' : 'add');
    load();
  };

  const title = mode === 'stores' ? t('stores:all_stores') : t('products:products');
  const subtitle = mode === 'stores'
    ? t('stores:verified_local_stores')
    : storeId ? t('products:products_from_store') : t('products:browse_products');

  if (loading) {
    return (
      <View style={styles.root}>
        <BackHeader title={title} subtitle={subtitle} />
        <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  const renderStore = ({ item }: { item: Store }) => (
    <TouchableOpacity style={styles.storeCard} onPress={() => navigation.navigate('StoreDetail', { storeId: item.id, store: item })}>
      <View style={styles.storeLogoBox}>
        {item.logoUrl ? <Image source={{ uri: item.logoUrl }} style={styles.storeLogo} /> : <Ionicons name="storefront" size={28} color={colors.primary} />}
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.storeMeta} numberOfLines={1}>{item.city || t('common:other')} · {item.category}</Text>
        <View style={styles.badgeRow}>
          {item.isVerified && <Text style={styles.verifiedBadge}>{t('common:verified')}</Text>}
          {item.trustedBadge && <Text style={styles.trustedBadge}>{t('stores:trusted')}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <BackHeader title={title} subtitle={subtitle} />
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('common:search')}
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      {mode === 'stores' ? (
        <FlatList
          data={filteredStores}
          keyExtractor={(item) => item.id}
          renderItem={renderStore}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title={t('stores:no_stores_found')} subtitle={t('stores:try_different_filter')} />}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item as any}
              onPress={(product) => navigation.navigate('ProductDetail', { productId: product.id, product })}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
          contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title={t('common:no_products')} subtitle={t('products:no_products_store')} />}
        />
      )}
    </View>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Ionicons name="search-outline" size={44} color={colors.textTertiary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchWrap: { marginHorizontal: 16, marginBottom: 10, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, ...typography.body2, color: colors.text, paddingVertical: 0 },
  listContent: { paddingHorizontal: 16, paddingTop: 6 },
  productList: { paddingHorizontal: 16, paddingTop: 6, gap: 12 },
  storeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.borderLight, padding: 14, marginBottom: 12 },
  storeLogoBox: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  storeLogo: { width: 58, height: 58 },
  storeInfo: { flex: 1 },
  storeName: { ...typography.h6, color: colors.text },
  storeMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  verifiedBadge: { ...typography.badge, color: colors.success, backgroundColor: colors.successLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  trustedBadge: { ...typography.badge, color: colors.secondary, backgroundColor: colors.secondarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  emptyState: { alignItems: 'center', padding: 32, marginTop: 80 },
  emptyIcon: { width: 92, height: 92, borderRadius: 28, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { ...typography.h4, color: colors.text, textAlign: 'center' },
  emptySub: { ...typography.body2, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
});
