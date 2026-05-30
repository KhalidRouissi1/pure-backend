import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  IconButton,
  Menu,
  Divider,
  Button,
  Chip,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getSellerProducts, deleteProduct, Product as SellerProduct } from '../services/products';

interface Product extends Omit<SellerProduct, 'store' | '_count' | 'updatedAt'> {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  store: {
    id: string;
    name: string;
    whatsappNumber: string;
  };
  _count?: {
    favorites: number;
  };
}

interface ProductListProps {
  storeId?: string;
  editMode?: boolean;
}

export default function ProductList({ storeId, editMode = false }: ProductListProps) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t } = useTranslation(['common', 'products']);
  const productsStoreId = storeId || (route.params as any)?.storeId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getSellerProducts(productsStoreId);
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Failed to load products:', error);
      Alert.alert(t('common:error'), t('products:error_load_products'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productsStoreId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  const handleProductPress = (product: Product) => {
    if (editMode) {
      // In edit mode, show menu
      setSelectedProductId(product.id);
      setMenuVisible(true);
    } else {
      // In view mode, navigate to product detail
      navigation.navigate('ProductDetail', { productId: product.id, product });
    }
  };

  const handleEdit = (productId: string) => {
    setMenuVisible(false);
    navigation.navigate('EditProduct', { productId });
  };

  const handleDelete = (productId: string) => {
    setMenuVisible(false);
    Alert.alert(
      t('products:delete_product'),
      t('products:delete_confirm'),
      [
        {
          text: t('common:cancel'),
          style: 'cancel',
        },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: () => confirmDelete(productId),
        },
      ]
    );
  };

  const confirmDelete = async (productId: string) => {
    setDeleting(productId);
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      Alert.alert(t('common:success'), t('products:deleted_successfully'));
    } catch (error) {
      console.error('Delete product error:', error);
      Alert.alert(t('common:error'), t('products:error_delete'));
    } finally {
      setDeleting(null);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.productInfo}>
              <Title style={styles.productName} numberOfLines={1}>
                {item.name}
              </Title>
              <Paragraph style={styles.price}>{t('common:sar')} {item.price.toFixed(2)}</Paragraph>
            </View>
            {editMode && (
              <Menu
                visible={menuVisible && selectedProductId === item.id}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => {
                      setSelectedProductId(item.id);
                      setMenuVisible(true);
                    }}
                  />
                }
              >
                <Menu.Item
                  leadingIcon="pencil"
                  onPress={() => handleEdit(item.id)}
                  title={t('common:edit')}
                />
                <Divider />
                <Menu.Item
                  leadingIcon="delete"
                  onPress={() => handleDelete(item.id)}
                  title={t('common:delete')}
                  titleStyle={{ color: '#f44336' }}
                />
              </Menu>
            )}
          </View>

          <Paragraph style={styles.description} numberOfLines={2}>
            {item.description}
          </Paragraph>

          <View style={styles.footer}>
            <Chip mode="outlined" compact style={styles.categoryChip}>
              {item.category}
            </Chip>
            <Chip icon="heart" mode="outlined" compact style={styles.favoriteChip}>
              {t('products:favorites_count', { count: item._count?.favorites || 0 })}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Title style={styles.emptyStateTitle}>{t('common:no_products')}</Title>
      <Paragraph style={styles.emptyStateText}>
        {editMode
          ? t('products:add_first_product')
          : t('products:no_products_store')}
      </Paragraph>
      {editMode && (
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('CreateProduct')}
          style={styles.createButton}
        >
          {t('products:add_product')}
        </Button>
      )}
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <Paragraph style={styles.loadingText}>{t('products:loading_products')}</Paragraph>
    </View>
  );

  if (loading) {
    return renderLoading();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {deleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.deletingText}>{t('products:deleting_product')}</Paragraph>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#e3f2fd',
  },
  favoriteChip: {
    backgroundColor: '#fff3e0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    minWidth: 200,
    backgroundColor: '#4CAF50',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
});
