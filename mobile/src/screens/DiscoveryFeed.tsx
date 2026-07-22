import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { Product, Category } from '../types';
import { Role } from '../types';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';
import SaudiRiyalSymbol from '../components/SaudiRiyalSymbol';
import { getDiscoveryFeed, getTrendingProducts, getNewProducts } from '../services/discovery';
import { getProducts, toggleFavorite } from '../services/products';
import { getStores, Store } from '../services/stores';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clamp, getProductGridMetrics, getRailCardWidth } from '../utils/responsive';

const categoryKeys: Array<{ name: Category; labelKey: string }> = [
  { name: Category.FRUITS_VEGETABLES, labelKey: 'common:fruits_vegetables' },
  { name: Category.HONEY, labelKey: 'common:honey' },
  { name: Category.DAIRY, labelKey: 'common:dairy' },
  { name: Category.HERBS, labelKey: 'common:herbs' },
  { name: Category.NATURAL_BEAUTY, labelKey: 'common:natural_beauty' },
];

const responseData = <T,>(value: T | { data?: T }): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data?: T }).data as T;
  }
  return value as T;
};

export default function DiscoveryFeed({ navigation }: any) {
  const { t } = useTranslation(['discovery', 'common']);
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const searchGrid = getProductGridMetrics(width);
  const railCardWidth = getRailCardWidth(width);
  const bannerWidth = clamp(
    searchGrid.availableWidth * (searchGrid.isWide ? 0.46 : 0.86),
    248,
    480
  );
  const storeColumns = searchGrid.isDesktop ? 8 : searchGrid.isWide ? 6 : 4;
  const storeCardWidth = Math.floor(
    (searchGrid.availableWidth - 12 * (storeColumns - 1)) / storeColumns
  );
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'category' | 'region'>('category');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [nearbyFarms, setNearbyFarms] = useState<Store[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadDiscoveryData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      try {
        const d = responseData(await getDiscoveryFeed({ groupBy, limit: 20 }));
        setGroups(d.groups || []);
      } catch {}
      try {
        const d = responseData(await getTrendingProducts({ period: '7d', limit: 20 }));
        setTrending(d.trending || []);
      } catch {}
      try {
        const d = responseData(await getNewProducts({ days: 7, limit: 10 }));
        setNewProducts(d.newProducts || []);
      } catch {}
      try {
        const stores = await getStores({ verified: true, limit: 8 });
        setNearbyFarms(stores);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const loadSearchResults = async () => {
    if (!selectedCategory && !searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const products = await getProducts(params);
      setSearchResults(products);
    } catch (e) {
      console.error(e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isSearching || selectedCategory || searchQuery.trim()) {
        loadSearchResults();
      } else {
        loadDiscoveryData(true);
      }
    }, [groupBy, selectedCategory])
  );

  const visibleTrending = useMemo(() => trending, [trending]);
  const visibleNewProducts = useMemo(() => newProducts, [newProducts]);
  const visibleGroups = useMemo(
    () =>
      groups.filter(
        (group) =>
          group.products.length > 0 &&
          (groupBy !== 'region' || !selectedRegion || group.groupName === selectedRegion)
      ),
    [groups, groupBy, selectedRegion]
  );

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id, product });
  };
  const handleFavoriteToggle = async (productId: string, isFavorited: boolean) => {
    try {
      await toggleFavorite(productId, isFavorited ? 'add' : 'remove');
      if (isSearching) {
        loadSearchResults();
      } else {
        loadDiscoveryData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderRailProductCard = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      onFavoriteToggle={handleFavoriteToggle}
      layout="rail"
      cardWidth={railCardWidth}
    />
  );

  const renderGridProductCard = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      onFavoriteToggle={handleFavoriteToggle}
      cardWidth={searchGrid.itemWidth}
    />
  );

  const renderGroup = ({ item }: { item: any }) => (
    <View style={styles.groupSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{item.groupLabel}</Text>
          <View style={styles.sectionAccent} />
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>{t('discovery:seeAll')}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={item.products}
        renderItem={renderRailProductCard}
        keyExtractor={(p) => p.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color={colors.primary} />
      </View>
    );

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
      >
        <View style={[styles.pageFrame, { width: searchGrid.contentWidth }]}>
          {/* 1. Header with Location & Icons */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.locationContainer}>
              <Text style={styles.locationLabel}>{t('discovery:title')}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="person-circle-outline" size={28} color={colors.text} />
              </TouchableOpacity>
              {!isAdmin && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('Cart')}
                >
                  <Ionicons name="cart-outline" size={26} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 2. Sticky Search Bar */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6A7565" />
              <TextInput
                style={styles.searchInput}
                placeholder={t('discovery:searchPlaceholder')}
                placeholderTextColor="#6A7565"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={() => loadSearchResults()}
              />
            </View>
          </View>

          {/* 3. Horizontal Category Icons */}
          {groupBy === 'category' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryIconsContainer}
            >
            {categoryKeys.map((cat) => {
              const config: Record<Category, { icon: string; color: string; iconColor: string }> = {
                [Category.FRUITS_VEGETABLES]: {
                  icon: 'leaf',
                  color: '#E1F8E1',
                  iconColor: '#0AAD0A',
                },
                [Category.HONEY]: { icon: 'nutrition', color: '#F8F4E1', iconColor: '#FFA500' },
                [Category.DAIRY]: { icon: 'water', color: '#E1F1F8', iconColor: '#007AFF' },
                [Category.HERBS]: { icon: 'flask', color: '#F8E1F1', iconColor: '#FF007A' },
                [Category.NATURAL_BEAUTY]: {
                  icon: 'flower',
                  color: '#F1E1F8',
                  iconColor: '#800080',
                },
              };
              const item = config[cat.name];
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={styles.categoryIconCard}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: item.color },
                      selectedCategory === cat.name && {
                        borderWidth: 2,
                        borderColor: item.iconColor,
                      },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.categoryIconLabel,
                      selectedCategory === cat.name && {
                        color: item.iconColor,
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    {t(cat.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          )}

          <View style={styles.groupToggle}>
            <TouchableOpacity
              testID="category-tab"
              style={[
                styles.groupToggleButton,
                groupBy === 'category' && styles.groupToggleButtonActive,
              ]}
              onPress={() => {
                setSelectedRegion(null);
                setGroupBy('category');
              }}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={groupBy === 'category' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.groupToggleText,
                  groupBy === 'category' && styles.groupToggleTextActive,
                ]}
              >
                {t('common:category_tab')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="region-tab"
              style={[
                styles.groupToggleButton,
                groupBy === 'region' && styles.groupToggleButtonActive,
              ]}
              onPress={() => {
                setSelectedCategory(null);
                setIsSearching(false);
                setGroupBy('region');
              }}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={groupBy === 'region' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.groupToggleText,
                  groupBy === 'region' && styles.groupToggleTextActive,
                ]}
              >
                {t('common:region_tab')}
              </Text>
            </TouchableOpacity>
          </View>

          {groupBy === 'region' && groups.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionFilters}
            >
              <TouchableOpacity
                style={[styles.regionChip, !selectedRegion && styles.regionChipActive]}
                onPress={() => setSelectedRegion(null)}
              >
                <Ionicons
                  name="map-outline"
                  size={18}
                  color={!selectedRegion ? '#FFFFFF' : colors.primary}
                />
                <Text style={[styles.regionChipText, !selectedRegion && styles.regionChipTextActive]}>
                  {t('discovery:allRegions')}
                </Text>
              </TouchableOpacity>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.groupName}
                  style={[
                    styles.regionChip,
                    selectedRegion === group.groupName && styles.regionChipActive,
                  ]}
                  onPress={() => setSelectedRegion(group.groupName)}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={selectedRegion === group.groupName ? '#FFFFFF' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.regionChipText,
                      selectedRegion === group.groupName && styles.regionChipTextActive,
                    ]}
                  >
                    {group.groupLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {isSearching ? (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                {searchResults.length} {t('common:products')}
              </Text>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderGridProductCard}
                  keyExtractor={(item) => item.id}
                  key={`search-${searchGrid.columns}`}
                  numColumns={searchGrid.columns}
                  columnWrapperStyle={searchGrid.columns > 1 ? styles.columnWrapper : undefined}
                  scrollEnabled={false}
                  contentContainerStyle={[
                    styles.searchGrid,
                    { paddingHorizontal: searchGrid.gutter },
                  ]}
                />
              ) : (
                <View style={styles.emptySearch}>
                  <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptySearchTitle}>{t('common:no_products')}</Text>
                </View>
              )}
            </View>
          ) : groupBy === 'region' ? (
            <View style={styles.regionResults}>
              <FlatList
                data={visibleGroups}
                renderItem={renderGroup}
                keyExtractor={(item) => item.groupName}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <>
              {/* 4. Promotional Banner */}
              <View style={styles.promoCard}>
                <View style={styles.promoContent}>
                  <View style={styles.promoPriceRow}>
                    <SaudiRiyalSymbol size={20} color={colors.text} />
                    <Text style={styles.promoPrice}>10</Text>
                  </View>
                  <Text style={styles.promoTitle}>{t('discovery:promoTitle')}</Text>
                  <Text style={styles.promoSub}>{t('discovery:promoSub')}</Text>
                </View>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>{t('discovery:promoCta')}</Text>
                </TouchableOpacity>
              </View>

              {/* 5. Stores Section */}
              {nearbyFarms.length > 0 && (
                <View style={styles.storesSection}>
                  <View style={styles.storesGrid}>
                    {nearbyFarms.slice(0, 7).map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.storeMiniCard, { width: storeCardWidth }]}
                        onPress={() =>
                          navigation.navigate('StoreDetail', { storeId: item.id, store: item })
                        }
                      >
                        <View style={styles.storeLogoBox}>
                          <Ionicons name="storefront" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.storeMiniName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.storeMiniMeta} numberOfLines={1}>
                          {item.city || ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.storeMiniCard, { width: storeCardWidth }]}
                      onPress={() => navigation.navigate('ProductList', { mode: 'stores' })}
                    >
                      <View style={[styles.storeLogoBox, { backgroundColor: '#F0F0F0' }]}>
                        <Ionicons name="arrow-forward" size={24} color="#666" />
                      </View>
                      <Text style={styles.storeMiniName}>{t('discovery:seeAll')}</Text>
                      <Text style={styles.storeMiniMeta}>
                        {nearbyFarms.length} {t('common:store')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 6. Featured Banners */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bannersScroll}
              >
                <View
                  style={[styles.bannerCard, { width: bannerWidth, backgroundColor: '#153A20' }]}
                >
                  <View style={styles.bannerText}>
                    <Ionicons name="leaf" size={24} color="#FFFFFF" style={{ marginBottom: 10 }} />
                    <Text style={styles.bannerTitle}>{t('discovery:bannerLocalTitle')}</Text>
                    <TouchableOpacity style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>{t('discovery:bannerLocalCta')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View
                  style={[
                    styles.bannerCard,
                    { width: bannerWidth, backgroundColor: colors.primary },
                  ]}
                >
                  <View style={styles.bannerText}>
                    <Text style={styles.bannerTitle}>{t('discovery:bannerSellerTitle')}</Text>
                    <TouchableOpacity style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>{t('discovery:bannerSellerCta')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* 7. Product Sections */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>{t('discovery:trending')}</Text>
                  </View>
                  <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>{t('discovery:seeAll')}</Text>
                  </TouchableOpacity>
                </View>
                {visibleTrending.length > 0 ? (
                  <FlatList
                    data={visibleTrending}
                    renderItem={renderRailProductCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                  />
                ) : (
                  <Text style={styles.emptySectionText}>{t('discovery:noProducts')}</Text>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>{t('discovery:newArrivals')}</Text>
                  </View>
                  <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>{t('discovery:seeAll')}</Text>
                  </TouchableOpacity>
                </View>
                {visibleNewProducts.length > 0 ? (
                  <FlatList
                    data={visibleNewProducts}
                    renderItem={renderRailProductCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                  />
                ) : (
                  <Text style={styles.emptySectionText}>{t('discovery:noProducts')}</Text>
                )}
              </View>

              <FlatList
                data={visibleGroups}
                renderItem={renderGroup}
                keyExtractor={(item) => item.groupName}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  pageFrame: { alignSelf: 'center' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationLabel: { fontFamily: FontFamilies.bold, fontSize: 17, color: colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 4 },

  searchWrapper: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  searchInput: { flex: 1, fontFamily: FontFamilies.regular, fontSize: 15, color: colors.text },

  categoryIconsContainer: { paddingHorizontal: 16, paddingVertical: 16, gap: 20 },
  categoryIconCard: { alignItems: 'center', gap: 6 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  categoryIconLabel: { fontFamily: FontFamilies.semiBold, fontSize: 13, color: colors.text },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4500',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  groupToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
  groupToggleButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
  },
  groupToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7C96A',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  groupToggleText: { fontFamily: FontFamilies.semiBold, fontSize: 14, color: colors.textSecondary },
  groupToggleTextActive: { color: colors.primary },
  regionFilters: { paddingHorizontal: 16, paddingBottom: 18, gap: 10 },
  regionChip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regionChipActive: { backgroundColor: colors.primary },
  regionChipText: { fontFamily: FontFamilies.semiBold, fontSize: 13, color: colors.primary },
  regionChipTextActive: { color: '#FFFFFF' },
  regionResults: { paddingTop: 4 },

  promoCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  promoContent: { flex: 1, paddingRight: 10 },
  promoPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    alignSelf: 'flex-start',
    gap: 6,
    direction: 'ltr',
  },
  promoPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    writingDirection: 'ltr',
  },
  promoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginTop: 4 },
  promoSub: { fontSize: 13, color: '#666', marginTop: 4 },
  promoButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  promoButtonText: { fontSize: 14, fontWeight: 'bold', color: colors.text },

  storesSection: { paddingHorizontal: 16, marginBottom: 24 },
  storesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  storeMiniCard: { minWidth: 70, flexGrow: 0, flexShrink: 0, alignItems: 'center', gap: 6 },
  storeLogoBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeMiniName: { fontSize: 12, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  storeMiniMeta: { fontSize: 10, color: '#999', textAlign: 'center' },

  bannersScroll: { paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  bannerCard: { height: 160, borderRadius: 22, padding: 20, justifyContent: 'flex-end' },
  bannerText: { flex: 1, justifyContent: 'flex-end' },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bannerBtnText: { fontSize: 13, fontWeight: 'bold', color: colors.text },

  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: FontFamilies.bold, fontSize: 22, color: colors.text },
  sectionAccent: {
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  seeAllButton: {},
  seeAllText: { fontFamily: FontFamilies.semiBold, fontSize: 14, color: colors.primary },
  horizontalList: { paddingHorizontal: 16, gap: 12 },
  emptySectionText: { paddingHorizontal: 16, color: '#999' },
  groupSection: { marginBottom: 24 },

  searchResultsContainer: { marginTop: 12 },
  searchResultsTitle: {
    paddingHorizontal: 16,
    fontFamily: FontFamilies.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  searchGrid: { paddingBottom: 20 },
  columnWrapper: { gap: 12 },
  emptySearch: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptySearchTitle: {
    marginTop: 12,
    fontFamily: FontFamilies.semiBold,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
