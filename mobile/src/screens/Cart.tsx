import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Cart as CartType, CartItem } from '../types';
import { getCart, removeCartItem, updateCartItem } from '../services/cart';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function Cart({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartType>({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setCart(await getCart());
    } catch {
      Alert.alert(t('error'), t('cart_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { loadCart(); }, [loadCart]));

  const changeQuantity = async (item: CartItem, delta: number) => {
    const quantity = item.quantity + delta;
    if (quantity < 1) return;
    setCart(await updateCartItem(item.id, quantity));
  };

  const removeItem = async (item: CartItem) => {
    setCart(await removeCartItem(item.id));
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="basket-outline" size={54} color={colors.textTertiary} />
        <Text style={styles.title}>{t('cart')}</Text>
        <Text style={styles.emptyText}>{t('login_cart_message')}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryText}>{t('login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemFarm}>{item.product.store?.name}</Text>
        <Text style={styles.itemPrice}>{t('sar')} {item.product.price}</Text>
      </View>
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepButton} onPress={() => changeQuantity(item, -1)}>
          <Ionicons name="remove" size={16} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity style={styles.stepButton} onPress={() => changeQuantity(item, 1)}>
          <Ionicons name="add" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item)}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('cart')}</Text>
        <Text style={styles.subtitle}>{t('items_count', { count: cart.totalItems })}</Text>
      </View>
      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={cart.items.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('cart_empty')}</Text>}
      />
      {cart.items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 85, paddingTop: 16 }]}>
          <View>
            <Text style={styles.totalLabel}>{t('subtotal')}</Text>
            <Text style={styles.total}>{t('sar')} {cart.subtotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Checkout')}>
            <Text style={styles.primaryText}>{t('checkout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F7F7F2' },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: FontFamilies.extraBold, fontSize: 30, color: colors.text },
  subtitle: { fontFamily: FontFamilies.regular, color: colors.textSecondary, marginTop: 2 },
  list: { padding: 16, paddingBottom: 180 },
  emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontFamily: FontFamilies.regular, fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginVertical: 12 },
  item: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E3E8DD' },
  itemInfo: { flex: 1, minWidth: 150 },
  itemName: { fontFamily: FontFamilies.bold, fontSize: 15, color: colors.text },
  itemFarm: { fontFamily: FontFamilies.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontFamily: FontFamilies.bold, fontSize: 13, color: '#0AAD0A', marginTop: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF4E8' },
  quantity: { minWidth: 18, textAlign: 'center', fontFamily: FontFamilies.bold, color: colors.text },
  removeButton: { marginLeft: 10, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3E8DD', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  totalLabel: { fontFamily: FontFamilies.regular, fontSize: 12, color: colors.textSecondary },
  total: { fontFamily: FontFamilies.extraBold, fontSize: 20, color: colors.text },
  primaryButton: { backgroundColor: '#0AAD0A', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  primaryText: { fontFamily: FontFamilies.bold, color: '#FFFFFF', fontSize: 15 },
});
