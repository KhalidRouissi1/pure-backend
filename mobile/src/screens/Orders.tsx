import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Order } from '../types';
import { getOrders } from '../services/orders';

export default function Orders({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setOrders(await getOrders());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('orders')}</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={orders.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_orders_yet')}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, order: item })}>
            <Text style={styles.cardTitle}>{t('order_number', { id: item.id.slice(0, 8) })}</Text>
            <Text style={styles.cardText}>{item.status} · {t('sar')} {item.total}</Text>
            <Text style={styles.cardText}>{t('eta_minutes', { minutes: item.deliveryEtaMinutes })}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export function OrderDetail({ route }: any) {
  const { t } = useTranslation('common');
  const order: Order | undefined = route.params?.order;
  if (!order) return <View style={styles.center}><Text style={styles.emptyText}>{t('order_not_found')}</Text></View>;
  return (
    <View style={styles.root}>
      <View style={styles.detailHeader}>
        <Text style={styles.title}>{t('order_confirmed')}</Text>
        <Text style={styles.cardText}>{t('status_label', { status: order.status })}</Text>
      </View>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.productName}</Text>
            <Text style={styles.cardText}>{t('quantity_price', { quantity: item.quantity, currency: t('sar'), price: item.unitPrice })}</Text>
          </View>
        )}
        ListFooterComponent={<Text style={styles.total}>{t('total_price', { currency: t('sar'), total: order.total })}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F2' },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  detailHeader: { padding: 20, paddingTop: 56 },
  title: { fontFamily: FontFamilies.extraBold, fontSize: 30, color: colors.text },
  list: { padding: 16, paddingBottom: 100 },
  emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontFamily: FontFamilies.regular, color: colors.textSecondary },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E3E8DD' },
  cardTitle: { fontFamily: FontFamilies.bold, color: colors.text },
  cardText: { fontFamily: FontFamilies.regular, color: colors.textSecondary, marginTop: 4 },
  total: { fontFamily: FontFamilies.extraBold, fontSize: 20, color: colors.text, marginTop: 12 },
});
