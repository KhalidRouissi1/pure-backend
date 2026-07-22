import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Address } from '../types';
import { createAddress, getAddresses } from '../services/addresses';
import SaudiLocationPicker from '../components/SaudiLocationPicker';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { MAX_FORM_WIDTH } from '../utils/responsive';

export default function AddressBook() {
  const { t } = useTranslation('common');
  const layout = useResponsiveLayout();
  const contentInset = Math.max(
    layout.outerInset + layout.gutter,
    (layout.width - MAX_FORM_WIDTH) / 2
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    label: 'Home',
    recipient: '',
    phone: '',
    addressText: '',
    city: '',
    line1: '',
    line2: '',
    latitude: '',
    longitude: '',
  });

  const load = useCallback(async () => {
    setAddresses(await getAddresses());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const addAddress = async () => {
    if (!form.recipient || !form.phone || !form.city || !form.addressText) {
      Alert.alert(t('missing_details'), t('address_required_message'));
      return;
    }
    const phone = form.phone.replace(/\D/g, '');
    await createAddress({
      label: form.label,
      recipient: form.recipient,
      phone: phone.startsWith('966') ? phone : `966${phone}`,
      city: form.city,
      addressText: form.addressText,
      line1: form.line1 || form.addressText,
      line2: form.line2,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      isDefault: addresses.length === 0,
    });
    setForm({
      label: t('home'),
      recipient: '',
      phone: '',
      addressText: '',
      city: '',
      line1: '',
      line2: '',
      latitude: '',
      longitude: '',
    });
    load();
  };

  return (
    <View style={styles.root}>
      <BackHeader title={t('saved_addresses')} />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingHorizontal: contentInset }]}
        ListHeaderComponent={
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>{t('add_address')}</Text>
            {(['label', 'recipient', 'phone', 'line2'] as const).map((field) => (
              <TextInput
                key={field}
                label={t(`address_fields.${field}`)}
                value={form[field]}
                onChangeText={(value) => setForm({ ...form, [field]: value })}
                mode="outlined"
                style={styles.input}
              />
            ))}
            <SaudiLocationPicker
              city={form.city}
              addressText={form.addressText}
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(location) =>
                setForm({
                  ...form,
                  city: location.city,
                  addressText: location.addressText ?? form.addressText,
                  line1: location.addressText ?? form.line1,
                  latitude: location.latitude ?? form.latitude,
                  longitude: location.longitude ?? form.longitude,
                })
              }
            />
            <TouchableOpacity style={styles.primaryButton} onPress={addAddress}>
              <Text style={styles.primaryText}>{t('save_address')}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.label}
              {item.isDefault ? ` · ${t('default')}` : ''}
            </Text>
            <Text style={styles.cardText}>
              {item.recipient} · {item.phone}
            </Text>
            <Text style={styles.cardText}>
              {item.addressText || item.line1}, {item.city}
            </Text>
            {item.latitude && item.longitude ? (
              <Text style={styles.cardMeta}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F2' },
  content: { paddingVertical: 16, paddingBottom: 100 },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E3E8DD',
  },
  sectionTitle: {
    fontFamily: FontFamilies.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  input: { marginBottom: 8, backgroundColor: '#FFFFFF' },
  primaryButton: {
    backgroundColor: '#0AAD0A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryText: { fontFamily: FontFamilies.bold, color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E3E8DD',
  },
  cardTitle: { fontFamily: FontFamilies.bold, color: colors.text },
  cardText: { fontFamily: FontFamilies.regular, color: colors.textSecondary, marginTop: 3 },
  cardMeta: {
    fontFamily: FontFamilies.regular,
    color: colors.textTertiary,
    marginTop: 3,
    fontSize: 12,
  },
});
