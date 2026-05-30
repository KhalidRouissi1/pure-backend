import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  IconButton,
  Divider,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { verifyStore } from '../services/stores';
import { reviewCertification } from '../services/admin';

interface StoreApprovalCardProps {
  store: {
    id: string;
    name: string;
    description: string;
    category: string;
    whatsappNumber: string;
    isVerified: boolean;
    certificationUrl?: string;
    certificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    trustedBadge?: boolean;
    createdAt: string;
    owner: {
      id: string;
      email: string;
      city?: string;
      phone?: string;
    };
    _count: {
      products: number;
    };
  };
  onUpdated?: () => void;
}

export default function StoreApprovalCard({ store, onUpdated }: StoreApprovalCardProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['common', 'admin']);
  const [processing, setProcessing] = useState(false);

  const handleVerify = async (isVerified: boolean) => {
    setProcessing(true);

    try {
      await verifyStore(store.id, isVerified);

      const message = isVerified
        ? t('admin:store_approved', { name: store.name })
        : t('admin:store_rejected', { name: store.name });

      Alert.alert(t('common:success'), message, [
        {
          text: t('common:ok'),
          onPress: () => {
            onUpdated?.();
          },
        },
      ]);
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert(t('common:error'), t('admin:error_verify_store'));
    } finally {
      setProcessing(false);
    }
  };

  const handleCertification = async (status: 'APPROVED' | 'REJECTED') => {
    setProcessing(true);

    try {
      await reviewCertification(store.id, status);
      Alert.alert(t('common:success'), `Certification ${status.toLowerCase()}.`, [
        {
          text: t('common:ok'),
          onPress: () => {
            onUpdated?.();
          },
        },
      ]);
    } catch (error) {
      console.error('Certification review error:', error);
      Alert.alert(t('common:error'), 'Could not review certification.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    navigation.navigate('StoreDetail', { storeId: store.id });
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Title style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Title>
            <Chip mode="outlined" compact style={styles.categoryChip}>
              {store.category}
            </Chip>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={handlePress}
          />
        </View>

        <Paragraph style={styles.description} numberOfLines={2}>
          {store.description}
        </Paragraph>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Paragraph style={styles.infoLabel}>{t('common:seller')}:</Paragraph>
            <Paragraph style={styles.infoValue}>{store.owner.email}</Paragraph>
          </View>
          {store.owner.city && (
            <View style={styles.infoItem}>
              <Paragraph style={styles.infoLabel}>{t('common:city')}:</Paragraph>
              <Paragraph style={styles.infoValue}>{store.owner.city}</Paragraph>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          {store.owner.phone && (
            <View style={styles.infoItem}>
              <Paragraph style={styles.infoLabel}>{t('common:phone')}:</Paragraph>
              <Paragraph style={styles.infoValue}>{store.owner.phone}</Paragraph>
            </View>
          )}
          <View style={styles.infoItem}>
            <Paragraph style={styles.infoLabel}>WhatsApp:</Paragraph>
            <Paragraph style={styles.infoValue}>{store.whatsappNumber}</Paragraph>
          </View>
        </View>

        <View style={styles.metaInfo}>
          <Paragraph style={styles.metaText}>
            {t('admin:product_count', { count: store._count.products })}
          </Paragraph>
          <Paragraph style={styles.metaText}>
            {t('admin:applied')}: {formatDate(store.createdAt)}
          </Paragraph>
        </View>

        <Divider style={styles.divider} />

        {store.certificationUrl ? (
          <>
            <View style={styles.certificationBox}>
              <View style={styles.certificationText}>
                <Paragraph style={styles.infoLabel}>Organic certification</Paragraph>
                <Paragraph style={styles.infoValue} numberOfLines={1}>
                  {store.certificationStatus || 'PENDING'}
                </Paragraph>
              </View>
              {store.trustedBadge ? (
                <Chip compact icon="check-decagram" style={styles.trustedChip}>
                  Trusted
                </Chip>
              ) : null}
            </View>
            {store.certificationStatus !== 'APPROVED' ? (
              <View style={styles.actions}>
                <Button
                  mode="contained-tonal"
                  onPress={() => handleCertification('APPROVED')}
                  disabled={processing}
                  compact
                >
                  Approve badge
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleCertification('REJECTED')}
                  disabled={processing}
                  compact
                >
                  Reject cert
                </Button>
              </View>
            ) : null}
            <Divider style={styles.divider} />
          </>
        ) : null}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleVerify(true)}
            disabled={processing}
            loading={processing}
            style={styles.approveButton}
            contentStyle={styles.buttonContent}
          >
            {t('admin:approve')}
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleVerify(false)}
            disabled={processing}
            style={styles.rejectButton}
            contentStyle={styles.buttonContent}
          >
            {t('admin:reject')}
          </Button>
        </View>
      </Card.Content>

      {processing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#e3f2fd',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  certificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f6f8f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  certificationText: {
    flex: 1,
    marginRight: 10,
  },
  trustedChip: {
    backgroundColor: '#e6f4ea',
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    flex: 1,
    borderColor: '#f44336',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
