import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { FontFamilies } from '../theme/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalStores: number;
  verifiedStores: number;
  pendingStores: number;
  totalProducts: number;
  totalOrders: number;
  totalOrdersPending: number;
  totalOrdersConfirmed: number;
  totalOrdersPreparing: number;
  totalOrdersOutForDelivery: number;
  totalOrdersDelivered: number;
  totalOrdersCancelled: number;
  totalGmv: number;
  avgOrderValue: number;
  totalDeliveryFees: number;
  pendingReviews: number;
  pendingCertifications: number;
  trustedBadgeCount: number;
  newUsers7d: number;
  newStores7d: number;
  newProducts7d: number;
  newOrders7d: number;
  avgProductsPerStore: number;
}

export default function AdminDashboard() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'admin']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const { getAdminDashboardFull } = require('../services/admin');
      const data = await getAdminDashboardFull();
      if (data?.stats) setStats(data.stats);
    } catch (e) {
      setError(t('common:error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));
  const fmtSar = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toFixed(0);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>{t('common:admin')}</Text>
        <Text style={styles.subtitle}>{t('admin:dashboard_overview')}</Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* PLATFORM KPIs */}
        <Text style={styles.sectionHeader}>{t('admin:quick_management')}</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="people-outline" iconColor={colors.secondary} value={fmt(stats?.totalUsers || 0)} label={t('admin:users')} />
          <StatCard icon="storefront-outline" iconColor={colors.primary} value={fmt(stats?.totalStores || 0)} label={t('common:store')} />
          <StatCard icon="person-outline" iconColor={colors.teal} value={fmt(stats?.totalSellers || 0)} label={t('admin:sellers')} />
          <StatCard icon="cube-outline" iconColor={colors.datePalm} value={fmt(stats?.totalProducts || 0)} label={t('common:product')} />
          <StatCard icon="checkmark-circle-outline" iconColor={colors.success} value={fmt(stats?.verifiedStores || 0)} label={t('common:verified')} />
          <StatCard icon="shield-checkmark-outline" iconColor={colors.gold} value={fmt(stats?.trustedBadgeCount || 0)} label={t('admin:trusted_badges')} />
          <StatCard icon="star-outline" iconColor={colors.warning} value={fmt(stats?.pendingReviews || 0)} label={t('admin:pending_reviews')} />
          <StatCard icon="document-text-outline" iconColor={colors.accent} value={fmt(stats?.pendingCertifications || 0)} label={t('admin:pending_certifications')} />
        </View>

        {/* COMMERCE KPIs */}
        <Text style={styles.sectionHeader}>{t('admin:orders')}</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="receipt-outline" iconColor={colors.secondary} value={fmt(stats?.totalOrders || 0)} label={t('admin:orders')} />
          <StatCard icon="cash-outline" iconColor={colors.success} value={'SAR ' + fmtSar(stats?.totalGmv || 0)} label={t('admin:gmv')} small />
          <StatCard icon="calculator-outline" iconColor={colors.primary} value={'SAR ' + fmtSar(stats?.avgOrderValue || 0)} label={t('admin:avg_order')} small />
          <StatCard icon="bicycle-outline" iconColor={colors.teal} value={'SAR ' + fmtSar(stats?.totalDeliveryFees || 0)} label={t('admin:delivery_fees')} small />
        </View>

        {/* ORDER STATUS BREAKDOWN */}
        <Text style={styles.sectionHeader}>{t('admin:orders')}</Text>
        <View style={styles.orderStatusBar}>
          <OrderPill label={t('admin:pending')} count={stats?.totalOrdersPending || 0} color={colors.warning} />
          <OrderPill label={t('admin:confirmed')} count={stats?.totalOrdersConfirmed || 0} color={colors.info} />
          <OrderPill label={t('admin:preparing')} count={stats?.totalOrdersPreparing || 0} color={colors.primary} />
          <OrderPill label={t('admin:out_for_delivery')} count={stats?.totalOrdersOutForDelivery || 0} color={colors.teal} />
          <OrderPill label={t('admin:delivered')} count={stats?.totalOrdersDelivered || 0} color={colors.success} />
          <OrderPill label={t('admin:cancelled')} count={stats?.totalOrdersCancelled || 0} color={colors.error} />
        </View>

        {/* 7D GROWTH */}
        <Text style={styles.sectionHeader}>{t('admin:growth_7d')}</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="person-add-outline" iconColor={colors.secondary} value={'+' + (stats?.newUsers7d || 0)} label={t('admin:new_users')} />
          <StatCard icon="business-outline" iconColor={colors.primary} value={'+' + (stats?.newStores7d || 0)} label={t('admin:new_stores')} />
          <StatCard icon="add-circle-outline" iconColor={colors.teal} value={'+' + (stats?.newProducts7d || 0)} label={t('admin:new_products')} />
          <StatCard icon="bag-add-outline" iconColor={colors.datePalm} value={'+' + (stats?.newOrders7d || 0)} label={t('admin:new_orders')} />
        </View>

        {/* SUPPLY QUALITY */}
        <Text style={styles.sectionHeader}>{t('admin:supply')}</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="grid-outline" iconColor={colors.primary} value={String(stats?.avgProductsPerStore || 0)} label={t('admin:avg_products_store')} />
          <StatCard icon="alert-circle-outline" iconColor={colors.warning} value={fmt(stats?.pendingStores || 0)} label={t('admin:pending_approvals')} />
        </View>

        {/* MANAGEMENT NAV */}
        <Text style={styles.sectionHeader}>{t('admin:quick_management')}</Text>
        <View style={styles.managementGrid}>
          <ManageCard
            icon="storefront"
            iconBg={colors.primaryLight}
            iconColor={colors.primary}
            label={t('admin:all_stores')}
            badge={stats?.pendingStores || 0}
            onPress={() => navigation.navigate('StoreManagement' as never)}
          />
          <ManageCard
            icon="people"
            iconBg={colors.secondarySoft}
            iconColor={colors.secondary}
            label={t('admin:all_users')}
            onPress={() => navigation.navigate('UserManagement' as never)}
          />
          <ManageCard
            icon="shield-checkmark"
            iconBg={colors.successLight}
            iconColor={colors.success}
            label={t('admin:approvals')}
            badge={stats?.pendingStores || 0}
            onPress={() => navigation.navigate('StoreApproval' as never)}
          />
          <ManageCard
            icon="receipt"
            iconBg={colors.warningLight}
            iconColor={colors.warning}
            label={t('admin:all_orders')}
            onPress={() => navigation.navigate('AdminOrders' as never)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, iconColor, value, label, small }: { icon: string; iconColor: string; value: string; label: string; small?: boolean }) {
  return (
    <View style={[styles.statCard, small && styles.statCardSmall]}>
      <View style={[styles.statIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.statNumber, small && styles.statNumberSmall]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function OrderPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.orderPill, { borderLeftColor: color }]}>
      <Text style={styles.orderPillCount}>{count}</Text>
      <Text style={styles.orderPillLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function ManageCard({ icon, iconBg, iconColor, label, badge, onPress }: { icon: string; iconBg: string; iconColor: string; label: string; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.manageCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.manageIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.manageLabel}>{label}</Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  title: { ...typography.h1, fontSize: 32, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.body2, color: colors.textSecondary, marginBottom: 24 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.errorLight, borderRadius: 12, padding: 12, marginBottom: 20 },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600' },
  sectionHeader: { ...typography.h5, color: colors.text, marginTop: 24, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statCardSmall: { padding: 12 },
  statIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontFamily: FontFamilies.bold, fontSize: 22, color: colors.text, lineHeight: 28 },
  statNumberSmall: { fontSize: 16 },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  orderStatusBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  orderPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderLeftWidth: 3 },
  orderPillCount: { fontFamily: FontFamilies.bold, fontSize: 16, color: colors.text },
  orderPillLabel: { ...typography.caption, color: colors.textSecondary },
  managementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  manageCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  manageIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  manageLabel: { ...typography.body2, fontWeight: 'bold', color: colors.text },
  badgeCount: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
});
