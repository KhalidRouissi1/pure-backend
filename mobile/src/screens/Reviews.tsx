import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Review } from '../types';
import {
  createProductReview,
  createStoreReview,
  getProductReviews,
  getStoreReviews,
} from '../services/reviews';
import { useAuth } from '../hooks/useAuth';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { MAX_FORM_WIDTH } from '../utils/responsive';

export default function Reviews({ route, navigation }: any) {
  const productId = route.params?.productId as string | undefined;
  const storeId = route.params?.storeId as string | undefined;
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('products');
  const layout = useResponsiveLayout();
  const contentInset = Math.max(
    layout.outerInset + layout.gutter,
    (layout.width - MAX_FORM_WIDTH) / 2
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    const data = productId ? await getProductReviews(productId) : await getStoreReviews(storeId!);
    setReviews(data.reviews);
  }, [productId, storeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submit = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      if (productId) await createProductReview(productId, rating, comment);
      else await createStoreReview(storeId!, rating, comment);
      setComment('');
      load();
    } catch {
      Alert.alert(t('common:error'), t('could_not_save_review'));
    }
  };

  return (
    <View style={styles.root}>
      <BackHeader title={t('reviews')} />
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, { paddingHorizontal: contentInset }]}
        ListHeaderComponent={
          <View style={styles.form}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)}>
                  <Ionicons
                    name={value <= rating ? 'star' : 'star-outline'}
                    size={24}
                    color="#F7A600"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              label={t('write_review')}
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
            />
            <TouchableOpacity style={styles.primaryButton} onPress={submit}>
              <Text style={styles.primaryText}>{t('submit_review')}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {'★'.repeat(item.rating)}
              {'☆'.repeat(5 - item.rating)}
            </Text>
            <Text style={styles.cardText}>{item.comment || t('no_comment')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_reviews_yet')}</Text>}
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
  stars: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#0AAD0A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
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
  cardTitle: { fontFamily: FontFamilies.bold, color: '#F7A600' },
  cardText: { fontFamily: FontFamilies.regular, color: colors.textSecondary, marginTop: 4 },
  emptyText: {
    fontFamily: FontFamilies.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});
