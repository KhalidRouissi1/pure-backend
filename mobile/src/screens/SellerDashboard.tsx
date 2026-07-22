import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDashboardStats, getSellerStores } from '../services/stores';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useTranslation } from 'react-i18next';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  isVerified: boolean;
  whatsappNumber: string;
  _count?: { products: number };
  stats?: { totalProducts: number; totalFavorites: number; recentProducts: number };
}

export default function SellerDashboard() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const layout = useResponsiveLayout();
  const storeColumns = layout.isWide ? 2 : 1;
  const statColumns = layout.isWide ? 4 : 2;
  const statCardStyle = { flexBasis: `${100 / statColumns - 3}%` } as const;
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState({
    totalStores: 0,
    totalProducts: 0,
    totalFavorites: 0,
    verifiedStores: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const storesData = await getSellerStores();
      const statsData = await getDashboardStats();
      setStores(storesData || []);
      setStats(
        statsData || { totalStores: 0, totalProducts: 0, totalFavorites: 0, verifiedStores: 0 }
      );
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const renderStoreCard = ({ item }: { item: Store }) => (
    <View style={styles.storeColumn}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.storeIconWrap}>
              <Ionicons name="storefront" size={20} color={colors.secondary} />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.storeName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.storeCategory}>{item.category}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.isVerified ? styles.statusVerified : styles.statusPending,
            ]}
          >
            <Text style={styles.statusText}>{item.isVerified ? t('verified') : t('pending')}</Text>
          </View>
        </View>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardStats}>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatValue}>{item._count?.products || 0}</Text>
            <Text style={styles.cardStatLabel}>
              {t('no_products').replace('ما فيه ', '').replace('No ', '')}
            </Text>
          </View>
          {item.stats && (
            <>
              <View style={styles.cardStatDivider} />
              <View style={styles.cardStatItem}>
                <Text style={styles.cardStatValue}>{item.stats.totalFavorites}</Text>
                <Text style={styles.cardStatLabel}>{t('favorites')}</Text>
              </View>
              <View style={styles.cardStatDivider} />
              <View style={styles.cardStatItem}>
                <Text style={styles.cardStatValue}>{item.stats.recentProducts}</Text>
                <Text style={styles.cardStatLabel}>{t('name')}</Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity
          style={styles.viewProductsButton}
          onPress={() => navigation.navigate('ProductList', { storeId: item.id })}
        >
          <Text style={styles.viewProductsText}>
            {t('store')} ({item._count?.products || 0})
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>{t('name')}</Text>
        <View style={styles.statsAccent} />
      </View>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, statCardStyle, { borderLeftColor: colors.primary }]}>
          <Ionicons name="storefront-outline" size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.totalStores}</Text>
          <Text style={styles.statTitle}>{t('store')}</Text>
        </View>
        <View style={[styles.statCard, statCardStyle, { borderLeftColor: colors.secondary }]}>
          <Ionicons name="cube-outline" size={20} color={colors.secondary} />
          <Text style={styles.statNumber}>{stats.totalProducts}</Text>
          <Text style={styles.statTitle}>{t('no_products').replace('ما فيه ', '')}</Text>
        </View>
        <View style={[styles.statCard, statCardStyle, { borderLeftColor: colors.accent }]}>
          <Ionicons name="heart-outline" size={20} color={colors.accent} />
          <Text style={styles.statNumber}>{stats.totalFavorites}</Text>
          <Text style={styles.statTitle}>{t('favorites')}</Text>
        </View>
        <View style={[styles.statCard, statCardStyle, { borderLeftColor: colors.success }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
          <Text style={styles.statNumber}>{stats.verifiedStores}</Text>
          <Text style={styles.statTitle}>{t('verified')}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="storefront-outline" size={44} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyStateTitle}>{t('no_products')}</Text>
      <TouchableOpacity
        style={styles.createStoreButton}
        onPress={() => navigation.navigate('CreateStore' as never)}
      >
        <Text style={styles.createStoreText}>
          {t('add')} {t('store')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );

  return (
    <View style={styles.root}>
      <FlatList
        key={`seller-${storeColumns}`}
        data={stores}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
        numColumns={storeColumns}
        columnWrapperStyle={storeColumns > 1 ? styles.storeRow : undefined}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 12, paddingHorizontal: layout.outerInset + layout.gutter },
        ]}
        ListHeaderComponent={renderStatsCards()}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
      {stores.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { right: layout.outerInset + layout.gutter }]}
          onPress={() => navigation.navigate('CreateProduct' as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  listContent: { paddingBottom: 100 },
  statsSection: { marginBottom: 24 },
  statsHeader: { marginBottom: 14 },
  statsTitle: { fontFamily: FontFamilies.bold, fontSize: 22, color: colors.text },
  statsAccent: {
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  statNumber: { fontFamily: FontFamilies.bold, fontSize: 26, color: colors.text, marginTop: 8 },
  statTitle: {
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  storeColumn: { flex: 1 },
  storeRow: { gap: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  storeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleWrap: { flex: 1 },
  storeName: { fontFamily: FontFamilies.semiBold, fontSize: 16, color: colors.text },
  storeCategory: {
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 1,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusVerified: { backgroundColor: colors.successLight },
  statusPending: { backgroundColor: colors.warningLight },
  statusText: { fontFamily: FontFamilies.semiBold, fontSize: 11, color: colors.text },
  description: {
    fontFamily: FontFamilies.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardStatItem: { alignItems: 'center', flex: 1 },
  cardStatValue: { fontFamily: FontFamilies.bold, fontSize: 20, color: colors.text },
  cardStatLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  cardStatDivider: { width: 1, height: 24, backgroundColor: colors.borderLight },
  viewProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  viewProductsText: { fontFamily: FontFamilies.semiBold, fontSize: 13, color: colors.primary },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontFamily: FontFamilies.bold,
    fontSize: 22,
    color: colors.text,
    marginBottom: 8,
  },
  createStoreButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  createStoreText: { fontFamily: FontFamilies.bold, fontSize: 15, color: '#FFFFFF' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
});
