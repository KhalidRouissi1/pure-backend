import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import BackHeader from '../components/BackHeader';
import StoreApprovalCard from '../components/StoreApprovalCard';
import { getPendingStores } from '../services/admin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function StoreApproval() {
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { t } = useTranslation(['common', 'admin', 'stores']);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'certification' | 'unverified'>('all');

  const loadStores = useCallback(async () => {
    try {
      const data = await getPendingStores();
      setStores(data || []);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStores();
  }, [loadStores]);

  const handleStoreUpdated = useCallback(() => {
    loadStores();
  }, [loadStores]);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter((store) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'certification' &&
          store.certificationStatus === 'PENDING' &&
          store.certificationUrl) ||
        (filter === 'unverified' && !store.isVerified);
      const matchesQuery =
        !q ||
        [store.name, store.city, store.category, store.owner?.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, stores]);

  if (loading) {
    return (
      <View style={styles.root}>
        <BackHeader title={t('admin:store_approvals')} subtitle={t('admin:pending_reviews')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BackHeader
        title={t('admin:store_approvals')}
        subtitle={t('admin:pending_count', { count: stores.length })}
      />
      <View style={[styles.filters, { paddingHorizontal: layout.outerInset + layout.gutter }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('common:search')}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={styles.filterRow}>
          {(['all', 'certification', 'unverified'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.filterChip, filter === value && styles.filterChipActive]}
              onPress={() => setFilter(value)}
            >
              <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
                {value === 'all'
                  ? t('common:all')
                  : value === 'certification'
                    ? t('admin:pending_certifications')
                    : t('stores:unverified')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreApprovalCard store={item} onUpdated={handleStoreUpdated} />}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: 8,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: layout.outerInset + layout.gutter,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-done-outline" size={48} color={colors.success} />
            </View>
            <Text style={styles.emptyTitle}>{t('admin:all_clear')}</Text>
            <Text style={styles.emptySub}>{t('admin:no_pending_approvals')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {},
  filters: { paddingBottom: 6 },
  searchBox: {
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: { flex: 1, ...typography.body2, color: colors.text, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.primaryDark },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { ...typography.h4, color: colors.text, marginBottom: 8 },
  emptySub: { ...typography.body2, color: colors.textSecondary, textAlign: 'center' },
});
