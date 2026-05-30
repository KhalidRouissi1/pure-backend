import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Address, Cart } from '../types';
import { getCart } from '../services/cart';
import { getAddresses } from '../services/addresses';
import { checkout } from '../services/orders';

export default function Checkout({ navigation }: any) {
  const { t } = useTranslation(['common']);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, totalItems: 0 });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const load = useCallback(async () => {
    try {
      const [cartData, addressData] = await Promise.all([getCart(), getAddresses()]);
      setCart(cartData);
      setAddresses(addressData);
      setSelectedAddressId(addressData.find((address) => address.isDefault)?.id || addressData[0]?.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const deliveryFee = cart.items.length ? 15 : 0;
  const total = cart.subtotal + deliveryFee;

  const paymentMethods = [
    { id: 'cash_on_delivery', label: t('common:cash_on_delivery'), icon: 'cash-outline', type: 'ionicon' },
    { id: 'card_on_delivery', label: t('common:card_on_delivery'), icon: 'card-outline', type: 'ionicon' },
    { id: 'stc_pay', label: t('common:stc_pay'), icon: 'wallet-outline', type: 'ionicon' },
    { id: 'paypal', label: t('common:paypal'), icon: 'paypal', type: 'fontawesome' },
  ];

  const placeOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert(t('common:address_required'), t('common:add_address_msg'));
      navigation.navigate('AddressBook');
      return;
    }
    setPlacing(true);
    try {
      const order = await checkout({ 
        addressId: selectedAddressId, 
        paymentMethod: paymentMethods.find(m => m.id === paymentMethod)?.label || paymentMethod, 
        paymentStatus: paymentMethod === 'cash_on_delivery' || paymentMethod === 'card_on_delivery' ? 'PENDING' : 'CONFIRMED' 
      });
      navigation.replace('OrderDetail', { orderId: order.id, order });
    } catch {
      Alert.alert(t('common:checkout_failed'), t('common:checkout_failed_msg'));
    } finally {
      setPlacing(false);
    }
  };

  const renderPaymentIcon = (method: any) => {
    if (method.type === 'ionicon') {
      return <Ionicons name={method.icon as any} size={20} color={paymentMethod === method.id ? '#0AAD0A' : colors.textSecondary} />;
    } else if (method.type === 'fontawesome') {
      return <FontAwesome5 name={method.icon} size={18} color={paymentMethod === method.id ? '#0AAD0A' : colors.textSecondary} />;
    }
    return null;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.root}>
      <BackHeader title={t('common:checkout')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{t('common:delivery')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddressBook')}>
              <Text style={styles.link}>{t('common:manage')}</Text>
            </TouchableOpacity>
          </View>
          {addresses.length ? addresses.map((address) => (
            <TouchableOpacity key={address.id} style={[styles.option, selectedAddressId === address.id && styles.optionSelected]} onPress={() => setSelectedAddressId(address.id)}>
              <Ionicons name="location-outline" size={18} color="#0AAD0A" />
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>{address.label}</Text>
                <Text style={styles.optionText}>{address.line1}, {address.city}</Text>
              </View>
            </TouchableOpacity>
          )) : <Text style={styles.muted}>{t('common:no_addresses')}</Text>}
          <View style={styles.deliveryMeta}>
            <Text style={styles.muted}>{t('common:delivery_fee')}: {t('common:sar')} {deliveryFee.toFixed(2)}</Text>
            <Text style={styles.muted}>{t('common:eta')}: 45 {t('common:minutes')}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('common:payment')}</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity key={method.id} style={[styles.option, paymentMethod === method.id && styles.optionSelected]} onPress={() => setPaymentMethod(method.id)}>
              <View style={styles.paymentMethodRow}>
                {renderPaymentIcon(method)}
                <Text style={styles.optionTitle}>{method.label}</Text>
              </View>
              <Ionicons name={paymentMethod === method.id ? 'radio-button-on' : 'radio-button-off'} size={18} color="#0AAD0A" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View>
          <Text style={styles.muted}>{t('common:total')}</Text>
          <Text style={styles.total}>{t('common:sar')} {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={placeOrder} disabled={placing}>
          <Text style={styles.primaryText}>{placing ? t('common:placing_order') : t('common:confirm_order')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F2' },
  content: { padding: 16 },
  panel: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E3E8DD' },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  panelTitle: { fontFamily: FontFamilies.bold, fontSize: 18, color: colors.text, marginBottom: 10 },
  link: { fontFamily: FontFamilies.bold, color: '#0AAD0A' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E3E8DD', marginBottom: 8 },
  optionSelected: { borderColor: '#0AAD0A', backgroundColor: '#F0FAEA' },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontFamily: FontFamilies.bold, color: colors.text },
  optionText: { fontFamily: FontFamilies.regular, color: colors.textSecondary, marginTop: 2 },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  deliveryMeta: { marginTop: 8, gap: 3 },
  muted: { fontFamily: FontFamilies.regular, color: colors.textSecondary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3E8DD', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontFamily: FontFamilies.extraBold, fontSize: 20, color: colors.text },
  primaryButton: { backgroundColor: '#0AAD0A', borderRadius: 16, paddingHorizontal: 22, paddingVertical: 14 },
  primaryText: { fontFamily: FontFamilies.bold, color: '#FFFFFF' },
});
