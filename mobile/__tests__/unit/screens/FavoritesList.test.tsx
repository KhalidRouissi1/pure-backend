import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FavoritesList from '../../../src/screens/FavoritesList';

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const mockFavorites = [
  {
    id: 'fav-1',
    productId: 'product-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    product: {
      id: 'product-1',
      name: 'Favorite Product 1',
      price: '100.00',
      imageUrls: ['https://example.com/fav1.jpg'],
      category: 'FOOD',
      store: {
        id: 'store-1',
        name: 'Favorite Store',
        whatsappNumber: '966501234567',
      },
    },
  },
  {
    id: 'fav-2',
    productId: 'product-2',
    createdAt: '2024-01-02T00:00:00.000Z',
    product: {
      id: 'product-2',
      name: 'Favorite Product 2',
      price: '200.00',
      imageUrls: ['https://example.com/fav2.jpg'],
      category: 'FASHION',
      store: {
        id: 'store-2',
        name: 'Another Store',
        whatsappNumber: '966509876543',
      },
    },
  },
];

jest.mock('../../../src/services/products', () => ({
  getUserFavorites: jest.fn(() => Promise.resolve({ 
    data: { 
      favorites: mockFavorites,
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
    } 
  })),
  toggleFavorite: jest.fn(() => Promise.resolve({ success: true })),
}));

describe('FavoritesList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { getUserFavorites } = require('../../../src/services/products');
    getUserFavorites.mockResolvedValue({
      data: {
        favorites: mockFavorites,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
    });
  });

  it('should render favorites list', async () => {
    const { getByText } = render(<FavoritesList />);

    await waitFor(() => {
      expect(getByText('Favorite Product 1')).toBeTruthy();
      expect(getByText('SAR 100.00')).toBeTruthy();
      expect(getByText('Favorite Store')).toBeTruthy();
    });
  });

  it('should render favorites when service returns an array', async () => {
    const { getUserFavorites } = require('../../../src/services/products');
    getUserFavorites.mockResolvedValue(mockFavorites);

    const { getByText } = render(<FavoritesList />);

    await waitFor(() => {
      expect(getByText('Favorite Product 1')).toBeTruthy();
    });
  });

  it('should render empty state when no favorites', async () => {
    const { getUserFavorites } = require('../../../src/services/products');
    getUserFavorites.mockResolvedValue({ data: { favorites: [], pagination: { total: 0 } } });

    const { getByText } = render(<FavoritesList />);

    await waitFor(() => {
      expect(getByText('No favorites yet')).toBeTruthy();
    });
  });

  it('should toggle favorite when favorite button is pressed', async () => {
    const { toggleFavorite } = require('../../../src/services/products');
    const { getByTestId } = render(<FavoritesList />);

    await waitFor(async () => {
      const favoriteButton = getByTestId('favorite-button-product-1');
      fireEvent.press(favoriteButton);

      expect(toggleFavorite).toHaveBeenCalledWith('product-1');
    });
  });

  it('should navigate to product detail on product press', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
    };
    const { getByTestId } = render(
      <FavoritesList navigation={mockNavigation} />,
    );

    await waitFor(() => {
      const productCard = getByTestId('product-card-product-1');
      fireEvent.press(productCard);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductDetail', expect.objectContaining({
        productId: 'product-1',
      }));
    });
  });

  it('should handle pull-to-refresh', async () => {
    const { getUserFavorites } = require('../../../src/services/products');
    const { getByTestId } = render(<FavoritesList />);

    await waitFor(() => {
      const flatList = getByTestId('favorites-flatlist');
      expect(flatList).toBeTruthy();
      expect(flatList.props.refreshControl).toBeDefined();
    });
  });

  it('should render loading state initially', () => {
    const { getUserFavorites } = require('../../../src/services/products');
    getUserFavorites.mockReturnValue(new Promise(() => {}));

    const { getByTestId } = render(<FavoritesList />);

    const loadingIndicator = getByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });
});
