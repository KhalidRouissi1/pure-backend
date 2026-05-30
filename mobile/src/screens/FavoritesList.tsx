import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useAuth } from '../hooks/useAuth';
import { getUserFavorites, toggleFavorite } from '../services/products';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProductGridMetrics } from '../utils/responsive';

interface FavoriteItem { id: string; productId: string; createdAt: string; product: any; }

export default function FavoritesList({ navigation }: any) {
  const { t } = useTranslation(['common', 'profile']);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const grid = getProductGridMetrics(width);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const loadFavorites = useCallback(async () => {
    try { 
      setLoading(true); 
      const r = await getUserFavorites({ page: 1, limit: 50 }); 
      const items = Array.isArray(r) ? r : r?.data?.items || r?.data?.favorites || [];
      setFavorites(items); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useFocusEffect(useCallback(() => { if (user?.id) loadFavorites(); else setLoading(false); }, [user?.id, loadFavorites]));
  const handleRefresh = useCallback(async () => { setRefreshing(true); await loadFavorites(); setRefreshing(false); }, []);
  const handleProductPress = (product: any) => { navigation.navigate('ProductDetail', { productId: product.id, product }); };
  const handleFavoriteToggle = async (productId: string, _isFavorited: boolean) => { 
    try { 
      await toggleFavorite(productId); 
      loadFavorites(); 
    } catch (e) { 
      console.error(e); 
    } 
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}><Ionicons name="heart-outline" size={44} color={colors.textTertiary} /></View>
      <Text style={styles.emptyTitle}>{t('common:no_favorites')}</Text>
      <Text style={styles.emptySub}>{t('common:discover_subtitle')}</Text>
    </View>
  );
  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <ProductCard
      product={item.product}
      onPress={handleProductPress}
      onFavoriteToggle={handleFavoriteToggle}
      cardWidth={grid.itemWidth}
    />
  );

  if (loading) return (<View style={styles.centerContainer}><ActivityIndicator testID="loading-indicator" size="large" color={colors.primary} /></View>);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View><Text style={styles.title}>{t('common:favorites')}</Text><View style={styles.titleAccent} /></View>
        {favorites.length > 0 && (<View style={styles.countBadge}><Text style={styles.countText}>{favorites.length} {t('profile:saved_count')}</Text></View>)}
      </View>
      <FlatList
        testID="favorites-flatlist"
        key={`favorites-${grid.columns}`}
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        numColumns={grid.columns}
        columnWrapperStyle={grid.columns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontFamily: FontFamilies.extraBold, fontSize: 34, color: colors.text },
  titleAccent: { width: 28, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 4 },
  countBadge: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  countText: { fontFamily: FontFamilies.semiBold, fontSize: 12, color: colors.primaryDark },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  columnWrapper: { gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyContainer: { alignItems: 'center' },
  emptyIcon: { width: 96, height: 96, borderRadius: 28, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: FontFamilies.bold, fontSize: 20, color: colors.text, marginTop: 4 },
  emptySub: { fontFamily: FontFamilies.regular, fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
