import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FontFamilies } from '../theme/fonts';
import BackHeader from '../components/BackHeader';
import { getAdminOrders } from '../services/admin';
import { useTranslation } from 'react-i18next';

const statusColor: Record<string, string> = {
  PENDING: colors.warning,
  CONFIRMED: colors.info,
  PREPARING: colors.primary,
  OUT_FOR_DELIVERY: colors.teal,
  DELIVERED: colors.success,
  CANCELLED: colors.error,
};

export default function AdminOrders() {
  const { t } = useTranslation(['common', 'admin']);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadOrders = useCallback(async () => {
    try {
      const data = await getAdminOrders();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const onRefresh = useCallback(() => { setRefreshing(true); loadOrders(); }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesQuery = !q || [order.id, order.user?.name, order.user?.email, order.paymentMethod, order.paymentStatus].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>#{item.id?.slice(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (statusColor[item.status] || colors.textTertiary) + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor[item.status] || colors.textTertiary }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.cardMeta}>{item.user?.name || item.user?.email || t('admin:unknown')}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.cardMeta}>{t('common:sar')} {Number(item.total).toFixed(2)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="card-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.cardMeta}>{item.paymentMethod} · {item.paymentStatus}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.cardMeta}>{t('common:eta')} {item.deliveryEtaMinutes} {t('common:minutes')}</Text>
        </View>
      </View>
      {item.items?.length > 0 && (
        <View style={styles.itemsSection}>
          {item.items.map((it: any, i: number) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{it.productName}</Text>
              <Text style={styles.itemQty}>{it.quantity}x {t('common:sar')} {Number(it.unitPrice).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.itemCount}>{t('admin:items_count', { count: item.items?.length || 0 })}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <BackHeader title={t('admin:orders')} subtitle={t('admin:all_platform_orders')} />
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={t('common:search')} placeholderTextColor={colors.textTertiary} />
        </View>
        <View style={styles.filterRow}>
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
            <TouchableOpacity key={status} style={[styles.filterChip, statusFilter === status && styles.filterChipActive]} onPress={() => setStatusFilter(status)}>
              <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>{status === 'ALL' ? t('common:all') : t(`admin:${status.toLowerCase()}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>{t('admin:no_orders_yet')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 40 },
  filters: { paddingHorizontal: 16, paddingBottom: 6 },
  searchBox: { height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, ...typography.body2, color: colors.text, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.primaryDark },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontFamily: FontFamilies.bold, fontSize: 16, color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontFamily: FontFamilies.semiBold, fontSize: 11 },
  cardBody: { gap: 4, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMeta: { fontFamily: FontFamilies.regular, fontSize: 13, color: colors.textSecondary },
  itemsSection: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 10, marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  itemName: { fontFamily: FontFamilies.regular, fontSize: 13, color: colors.text, flex: 1 },
  itemQty: { fontFamily: FontFamilies.regular, fontSize: 13, color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontFamily: FontFamilies.regular, fontSize: 11, color: colors.textTertiary },
  itemCount: { fontFamily: FontFamilies.semiBold, fontSize: 11, color: colors.primary },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontFamily: FontFamilies.regular, fontSize: 16, color: colors.textSecondary, marginTop: 12 },
});
