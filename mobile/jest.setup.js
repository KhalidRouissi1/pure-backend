const translations = {
  sar: 'SAR',
  category: 'Select Category',
  no_favorites: 'No favorites yet',
  discover_subtitle: 'Find local treasures near you',
  discovery: 'Discover',
  favorites: 'Favorites',
  category_tab: 'Category',
  region_tab: 'Region',
  all: 'All',
  food: 'Food',
  fashion: 'Fashion',
  coffee: 'Coffee',
  crafts: 'Crafts',
  electronics: 'Electronics',
  home: 'Home',
  beauty: 'Beauty',
  other: 'Other',
  fruits_vegetables: 'Fruits & Vegetables',
  honey: 'Honey',
  dairy: 'Dairy Products',
  herbs: 'Herbs',
  natural_beauty: 'Natural Beauty Products',
  product_name: 'Product Name',
  description: 'Description',
  price: 'Price',
  upload_images: 'Upload Images',
  create_title: 'Create Product',
  create_subtitle: 'Add a new product to your store',
  product_images: 'Product Images',
  image_count: 'Images',
  product_image: 'Product Image',
  uploading: 'Uploading...',
  creating: 'Creating...',
  uploading_images: 'Uploading images...',
  created_successfully: 'Product created successfully',
  error_pick_images: 'Failed to pick images',
  error_create: 'Failed to create product',
  error_description_required: 'Description is required',
  error_description_min_length: 'Description must be at least 10 characters',
  error_name_required: 'Product name is required',
  error_name_min_length: 'Product name must be at least 3 characters',
  error_price_required: 'Price is required',
  error_price_positive: 'Please enter a valid price',
  error_max_images: 'Maximum 5 images allowed',
  orderOnWhatsApp: 'Order on WhatsApp',
  visit_store: 'Visit',
  description_section: 'Description',
  noImages: 'No images',
  whatsappMessage: 'Hello, I want to order {{name}} for {{price}}',
  shareTitle: 'Share product',
  shareMessage: 'Check out this product:',
  noWhatsappNumber: 'No WhatsApp number available',
  errorOpenWhatsapp: 'Failed to open WhatsApp',
  trending: 'Trending Now',
  newArrivals: 'New Arrivals',
  seeAll: 'See All',
  noProducts: 'No products found',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => translations[key.split(':').pop()] || key.split(':').pop(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback) => React.useEffect(callback, [callback]),
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMap = (props) => React.createElement(View, props, props.children);
  const MockMarker = (props) => React.createElement(View, props, props.children);
  return {
    __esModule: true,
    default: MockMap,
    Marker: MockMarker,
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 24.7136, longitude: 46.6753 } }),
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([{ city: 'Riyadh', region: 'Riyadh Province', street: 'King Fahd Rd' }]),
  ),
}));

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock-image.jpg' }],
    }),
  ),
}));
