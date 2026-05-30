import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DiscoveryFeed from '../../../src/screens/DiscoveryFeed';
import { Category } from '../../../src/types';
import { getStores } from '../../../src/services/stores';

const mockCategories = [
  { name: 'FRUITS_VEGETABLES', label: 'Fruits & Vegetables' },
  { name: 'HONEY', label: 'Honey' },
];

const mockDiscoveryGroups = [
  {
    groupName: 'FRUITS_VEGETABLES',
    groupLabel: 'Fruits & Vegetables',
    totalProducts: 10,
    products: [
      {
        id: '1',
        name: 'Farm Product 1',
        price: '50.00',
        imageUrls: ['https://example.com/food1.jpg'],
        category: 'FRUITS_VEGETABLES',
        store: { name: 'Farm Store', whatsappNumber: '966501234567' },
      },
    ],
  },
];

jest.mock('../../../src/services/discovery', () => ({
  getDiscoveryFeed: jest.fn(() => Promise.resolve({ data: { groups: mockDiscoveryGroups } })),
  getTrendingProducts: jest.fn(() => Promise.resolve({ data: { trending: [] } })),
  getNewProducts: jest.fn(() => Promise.resolve({ data: { newProducts: [] } })),
}));

jest.mock('../../../src/services/stores', () => ({
  getStores: jest.fn(() => Promise.resolve([])),
}));

describe('DiscoveryFeed Component', () => {
  it('should render category tabs', () => {
    const { getAllByText, getByText } = render(<DiscoveryFeed />);

    return waitFor(() => {
      expect(getAllByText('Fruits & Vegetables').length).toBeGreaterThan(0);
      expect(getByText('Honey')).toBeTruthy();
    });
  });

  it('should render product groups', async () => {
    const { getAllByText } = render(<DiscoveryFeed />);
    
    await waitFor(() => {
      expect(getAllByText('Fruits & Vegetables').length).toBeGreaterThan(0);
    });
  });

  it('should switch between category and region groupBy', async () => {
    const { getByTestId } = render(<DiscoveryFeed />);

    const categoryTab = await waitFor(() => getByTestId('category-tab'));
    fireEvent.press(categoryTab);

    const regionTab = getByTestId('region-tab');
    fireEvent.press(regionTab);

    expect(regionTab).toBeTruthy();
  });

  it('should render loading state', () => {
    const { getByTestId } = render(<DiscoveryFeed loading={true} />);
    
    const loadingIndicator = getByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('should render empty state when no products', async () => {
    const { getAllByText } = render(<DiscoveryFeed />);
    
    await waitFor(() => {
      expect(getAllByText('No products found').length).toBeGreaterThan(0);
    });
  });

  it('should navigate to product detail on product press', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
    };
    const { getByTestId } = render(
      <DiscoveryFeed navigation={mockNavigation} />,
    );
    
    const productCard = await waitFor(() => getByTestId('product-card-1'));
    fireEvent.press(productCard);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductDetail', expect.objectContaining({
      productId: '1',
    }));
  });

  it('keeps the see all stores tile the same width as store tiles', async () => {
    (getStores as jest.Mock).mockResolvedValueOnce([
      { id: 'store-1', name: 'Store 1', city: 'Riyadh' },
      { id: 'store-2', name: 'Store 2', city: 'Jeddah' },
      { id: 'store-3', name: 'Store 3', city: 'Dammam' },
      { id: 'store-4', name: 'Store 4', city: 'Al Baha' },
    ]);

    const { getByText } = render(<DiscoveryFeed navigation={{ navigate: jest.fn() }} />);

    const seeAllMeta = await waitFor(() => getByText('4 store'));
    const seeAllTile = seeAllMeta.parent?.parent;

    expect(seeAllTile?.props.style).toEqual(expect.objectContaining({ flexGrow: 0 }));
  });
});
