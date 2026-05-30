import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import BackHeader from '../components/BackHeader';
import { getAllStores, deleteStore } from '../services/admin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../types';

export default function StoreManagement() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'admin', 'stores']);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'trusted'>('all');

  const loadStores = useCallback(async () => {
    try {
      const data = await getAllStores();
      setStores(data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleDeleteStore = (storeId: string, storeName: string) => {
    Alert.alert(
      t('stores:delete_store'),
      t('stores:delete_store_confirm', { name: storeName }),
      [
        { text: t('common:cancel'), style: 'cancel' },
        { 
          text: t('common:delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStore(storeId);
              loadStores();
            } catch (e) {
              Alert.alert(t('common:error'), t('stores:error_delete_store'));
            }
          }
        }
      ]
    );
  };

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter((store) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && store.isVerified) ||
        (statusFilter === 'unverified' && !store.isVerified) ||
        (statusFilter === 'trusted' && store.trustedBadge);
      const ownerEmail = (store as any).owner?.email || '';
      const matchesQuery = !q || [store.name, store.city, store.category, ownerEmail].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, stores]);

  const renderStoreItem = ({ item }: { item: Store }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.logoContainer}>
          {item.logoUrl ? (
            <Image source={{ uri: item.logoUrl }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.placeholderLogo]}>
              <Ionicons name="storefront" size={24} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.ownerEmail} numberOfLines={1}>{(item as any).owner?.email}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.badge, item.isVerified ? styles.verifiedBadge : styles.pendingBadge]}>
              <Text style={[styles.badgeText, item.isVerified ? styles.verifiedText : styles.pendingText]}>
                {item.isVerified ? t('common:verified') : t('stores:unverified')}
              </Text>
            </View>
            {item.trustedBadge && (
              <View style={[styles.badge, styles.trustedBadge]}>
                <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
                <Text style={styles.trustedText}>{t('stores:trusted')}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteStore(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <BackHeader title={t('stores:store_management')} subtitle={t('stores:store_management_subtitle')} />
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={t('common:search')} placeholderTextColor={colors.textTertiary} />
        </View>
        <View style={styles.filterRow}>
          {(['all', 'verified', 'unverified', 'trusted'] as const).map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterChip, statusFilter === filter && styles.filterChipActive]} onPress={() => setStatusFilter(filter)}>
              <Text style={[styles.filterText, statusFilter === filter && styles.filterTextActive]}>{filter === 'all' ? t('common:all') : filter === 'verified' ? t('common:verified') : filter === 'unverified' ? t('stores:unverified') : t('stores:trusted')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        onRefresh={() => { setRefreshing(true); loadStores(); }}
        refreshing={refreshing}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('stores:no_stores_found')}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16 },
  filters: { paddingHorizontal: 16, paddingBottom: 6 },
  searchBox: { height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, ...typography.body2, color: colors.text, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.primaryDark },
  storeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeHeader: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: { marginRight: 12 },
  logo: { width: 50, height: 50, borderRadius: 10 },
  placeholderLogo: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  storeDetails: { flex: 1 },
  storeName: { ...typography.body1, fontWeight: 'bold', color: colors.text },
  ownerEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedBadge: { backgroundColor: colors.successLight },
  pendingBadge: { backgroundColor: colors.warningLight },
  trustedBadge: { backgroundColor: colors.secondary },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  verifiedText: { color: colors.success },
  pendingText: { color: colors.warning },
  trustedText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  deleteButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: colors.textSecondary },
});
