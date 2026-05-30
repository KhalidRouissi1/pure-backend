import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import SellerDashboard from '../../../src/screens/SellerDashboard';

jest.mock('../../../src/services/stores', () => ({
  getDashboardStats: jest.fn(),
  getSellerStores: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const mockStoreData = {
  id: 'store-1',
  name: 'Test Store',
  description: 'Test description',
  category: 'FOOD',
  isVerified: true,
  whatsappNumber: '966501234567',
  createdAt: '2024-01-01T00:00:00Z',
  _count: { products: 15 },
  products: [
    {
      id: 'product-1',
      name: 'Product 1',
      price: 45,
      imageUrls: ['https://example.com/image.jpg'],
    },
  ],
};

const mockDashboardStats = {
  totalStores: 2,
  totalProducts: 15,
  totalFavorites: 42,
  verifiedStores: 1,
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('SellerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with store information', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    getSellerStores.mockResolvedValue([mockStoreData]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getByText('Total Stores')).toBeTruthy();
      expect(getByText('Total Products')).toBeTruthy();
      expect(getByText('Total Favorites')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    const { getByTestId } = renderWithProviders(<SellerDashboard />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error message when API call fails', async () => {
    const { getSellerStores } = require('../../../src/services/stores');
    getSellerStores.mockRejectedValue(new Error('API Error'));

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getByText('Failed to load dashboard')).toBeTruthy();
    });
  });

  it('displays store list with products', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    getSellerStores.mockResolvedValue([mockStoreData]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getByText('Test Store')).toBeTruthy();
      expect(getByText('Product 1')).toBeTruthy();
    });
  });

  it('navigates to product list when store is pressed', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    const mockNavigate = jest.fn();
    
    require('@react-navigation/native').useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });

    getSellerStores.mockResolvedValue([mockStoreData]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      fireEvent.press(getByText('Test Store'));
      expect(mockNavigate).toHaveBeenCalledWith('ProductList', { storeId: 'store-1' });
    });
  });

  it('navigates to create product when "Add Product" button is pressed', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    const mockNavigate = jest.fn();
    
    require('@react-navigation/native').useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });

    getSellerStores.mockResolvedValue([mockStoreData]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      fireEvent.press(getByText('Add Product'));
      expect(mockNavigate).toHaveBeenCalledWith('CreateProduct');
    });
  });

  it('shows verification status for stores', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    const unverifiedStore = { ...mockStoreData, isVerified: false };
    getSellerStores.mockResolvedValue([unverifiedStore]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getByText('Pending Verification')).toBeTruthy();
    });
  });

  it('displays stats cards with correct numbers', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    getSellerStores.mockResolvedValue([mockStoreData]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getByText('2')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
    });
  });

  it('handles empty store list gracefully', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    getSellerStores.mockResolvedValue([]);
    getDashboardStats.mockResolvedValue({
      totalStores: 0,
      totalProducts: 0,
      totalFavorites: 0,
      verifiedStores: 0,
    });

    const { getByText } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getByText('No stores yet')).toBeTruthy();
      expect(getByText('Create your first store to start selling')).toBeTruthy();
    });
  });

  it('refreshes data when pull-to-refresh is triggered', async () => {
    const { getSellerStores, getDashboardStats } = require('../../../src/services/stores');
    getSellerStores.mockResolvedValue([mockStoreData]);
    getDashboardStats.mockResolvedValue(mockDashboardStats);

    const { getByTestId } = renderWithProviders(<SellerDashboard />);

    await waitFor(() => {
      expect(getSellerStores).toHaveBeenCalledTimes(1);
    });

    fireEvent(getByTestId('flatlist'), 'onRefresh');

    await waitFor(() => {
      expect(getSellerStores).toHaveBeenCalledTimes(2);
    });
  });
});
